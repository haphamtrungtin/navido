import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
} from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import sharp from 'sharp';

import {
  AssetGroupSchema,
  AssetManifestSchema,
  resolveAssetFormats,
  type AssetManifestEntry,
} from '../src/lib/asset-manifest';

const rootDirectory = fileURLToPath(new URL('../', import.meta.url));
const defaultIntakeDirectory = fileURLToPath(
  new URL('../../../incoming-assets/navido/', import.meta.url),
);
const inventoryJsonPath = fileURLToPath(
  new URL('../docs/asset-inventory.json', import.meta.url),
);
const inventoryMarkdownPath = fileURLToPath(
  new URL('../docs/asset-inventory.md', import.meta.url),
);

const missingGroups = [
  'packaging',
  'roaster-machine',
  'roasting-process',
  'roasting-team',
] as const;

const fileRules = {
  bakery: {
    prefix: 'navido_bakery_',
    intendedUse: (subject: string) => `Editorial bakery feature for ${subject}`,
    altSubject: (subject: string) => `NAVIDO bakery ${subject}`,
  },
  coffee: {
    prefix: 'navido_coffee_',
    intendedUse: (subject: string) => `Editorial coffee feature for ${subject}`,
    altSubject: (subject: string) => `NAVIDO coffee ${subject}`,
  },
  logo: {
    prefix: 'navido_logo_',
    intendedUse: (subject: string) => `Brand identity use for ${subject}`,
    altSubject: (subject: string) => `NAVIDO ${subject} logo`,
  },
  menu: {
    prefix: 'navido_menu_',
    intendedUse: (subject: string) => `Menu imagery for ${subject}`,
    altSubject: (subject: string) => `NAVIDO ${subject}`,
  },
  space: {
    prefix: 'navido_space_',
    intendedUse: (subject: string) => `Venue imagery for ${subject}`,
    altSubject: (subject: string) => `NAVIDO ${subject}`,
  },
} as const;

type AssetGroup = keyof typeof fileRules;

export function cropFor(width: number, height: number) {
  const ratio = width / height;
  if (ratio > 1.2) return 'landscape' as const;
  if (ratio < 0.8) return 'portrait' as const;
  if (ratio >= 0.95 && ratio <= 1.05) return 'square' as const;
  return 'flexible' as const;
}

export function proposedPublicPath(relativePath: string): string {
  return `/images/navido/${relativePath.replaceAll('\\', '/')}`;
}

async function collectFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return collectFiles(path);
      if (entry.isFile()) return [path];
      return [];
    }),
  );

  return nestedFiles
    .flat()
    .sort((left, right) => left.localeCompare(right, 'en'));
}

function normalizedRelativePath(sourceDirectory: string, path: string): string {
  return relative(sourceDirectory, path).replaceAll('\\', '/');
}

function descriptionFor(
  group: AssetGroup,
  filenameWithoutExtension: string,
  path: string,
): { intendedUse: string; altSubject: string } {
  const rule = fileRules[group];
  const normalizedFilename = filenameWithoutExtension.toLowerCase();
  if (!normalizedFilename.startsWith(rule.prefix)) {
    throw new Error(`Unknown asset filename prefix: ${path}`);
  }

  const descriptor = normalizedFilename.slice(rule.prefix.length);
  if (descriptor.length === 0) {
    throw new Error(`Asset filename has no subject: ${path}`);
  }

  const sequenceMatch = descriptor.match(/_(\d+)$/);
  const subject = descriptor
    .replace(/_(\d+)$/, '')
    .replaceAll('_', ' ')
    .trim();
  const sequence = Number(sequenceMatch?.[1] ?? '1');
  const subjectWithView =
    sequence > 1 ? `${subject}, view ${sequence}` : subject;

  return {
    intendedUse: rule.intendedUse(subjectWithView),
    altSubject: rule.altSubject(subjectWithView),
  };
}

async function manifestEntry(
  sourceDirectory: string,
  path: string,
): Promise<AssetManifestEntry> {
  const intakePath = normalizedRelativePath(sourceDirectory, path);
  const firstSegment = intakePath.split('/')[0];
  const groupResult = AssetGroupSchema.safeParse(firstSegment);
  if (!groupResult.success) {
    throw new Error(`Unknown asset group: ${intakePath}`);
  }

  const group = groupResult.data;
  const extension = extname(path);
  const filenameWithoutExtension = basename(path, extension);
  const metadata = await sharp(path).metadata();
  if (metadata.width === undefined || metadata.height === undefined) {
    throw new Error(`Asset dimensions are unavailable: ${intakePath}`);
  }

  const crop = cropFor(metadata.width, metadata.height);
  const description = descriptionFor(
    group,
    filenameWithoutExtension,
    intakePath,
  );

  return {
    id: filenameWithoutExtension.toLowerCase(),
    intakePath,
    proposedPublicPath: proposedPublicPath(intakePath),
    group,
    ...resolveAssetFormats(intakePath, metadata.format),
    width: metadata.width,
    height: metadata.height,
    ...description,
    crop,
    authenticity: 'verified-navido',
    replacementStatus: crop === 'flexible' ? 'review-crop' : 'ready',
    provenance: 'owner-supplied',
  };
}

async function generateManifest(sourceDirectory: string) {
  const paths = await collectFiles(sourceDirectory);
  const assets = await Promise.all(
    paths.map((path) => manifestEntry(sourceDirectory, path)),
  );
  const intakePaths = new Set(assets.map((asset) => asset.intakePath));
  if (intakePaths.size !== assets.length) {
    throw new Error(
      'Duplicate intake paths found while generating asset inventory.',
    );
  }

  return AssetManifestSchema.parse({
    generatedFrom: 'incoming-assets/navido',
    assets,
    missingGroups,
  });
}

function countsFor(
  assets: readonly AssetManifestEntry[],
  key: 'group' | 'format' | 'encodedFormat',
): Array<[string, number]> {
  const counts = assets.reduce<Record<string, number>>((result, asset) => {
    result[asset[key]] = (result[asset[key]] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(counts).sort(([left], [right]) =>
    left.localeCompare(right, 'en'),
  );
}

function markdownTable(
  rows: ReadonlyArray<readonly [string, number]>,
): string[] {
  return [
    '<!-- prettier-ignore -->',
    '| Name | Count |',
    '| --- | ---: |',
    ...rows.map(([name, count]) => `| ${name} | ${count} |`),
  ];
}

function serializeMarkdown(
  manifest: ReturnType<typeof AssetManifestSchema.parse>,
): string {
  return `${[
    '# NAVIDO Asset Inventory',
    '',
    'Deterministically generated from the owner-supplied `incoming-assets/navido` intake. These files are inventoried only and have not been copied into the public site.',
    '',
    '## Summary',
    '',
    `- Total assets: ${manifest.assets.length}`,
    `- Unique intake paths: ${new Set(manifest.assets.map((asset) => asset.intakePath)).size}`,
    '',
    '## Counts by group',
    '',
    ...markdownTable(countsFor(manifest.assets, 'group')),
    '',
    '## Counts by format',
    '',
    ...markdownTable(countsFor(manifest.assets, 'format')),
    '',
    '## Counts by encoded format',
    '',
    ...markdownTable(countsFor(manifest.assets, 'encodedFormat')),
    '',
    '## Reviewed format mismatches',
    '',
    'The supplied filename extension is retained as `format`; Sharp metadata is normalized as `encodedFormat`. Only these reviewed owner-supplied mismatches are allowed.',
    '',
    '<!-- prettier-ignore -->',
    '| Intake path | Supplied format | Encoded format | Disposition |',
    '| --- | --- | --- | --- |',
    ...manifest.assets
      .filter((asset) => asset.formatMismatchDisposition !== 'formats-match')
      .map(
        (asset) =>
          `| ${asset.intakePath} | ${asset.format} | ${asset.encodedFormat} | ${asset.formatMismatchDisposition} |`,
      ),
    '',
    '## Missing Roastery photography',
    '',
    ...manifest.missingGroups.map((group) => `- ${group}`),
    '',
    '## Assets',
    '',
    '<!-- prettier-ignore -->',
    '| Intake path | Dimensions | Group | Supplied format | Encoded format | Format disposition | Crop | Status | Intended use | Alt subject |',
    '| --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...manifest.assets.map(
      (asset) =>
        `| ${asset.intakePath} | ${asset.width}x${asset.height} | ${asset.group} | ${asset.format} | ${asset.encodedFormat} | ${asset.formatMismatchDisposition} | ${asset.crop} | ${asset.replacementStatus} | ${asset.intendedUse} | ${asset.altSubject} |`,
    ),
  ].join('\n')}\n`;
}

async function readExisting(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

function parseArguments(arguments_: string[]): {
  checkOnly: boolean;
  sourceDirectory: string;
} {
  let checkOnly = false;
  let sourceDirectory = defaultIntakeDirectory;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === '--check') {
      checkOnly = true;
      continue;
    }
    if (argument === '--source') {
      const sourceArgument = arguments_[index + 1];
      if (sourceArgument === undefined || !isAbsolute(sourceArgument)) {
        throw new Error('--source requires an absolute path.');
      }
      sourceDirectory = sourceArgument;
      index += 1;
      continue;
    }
    throw new Error(
      'Usage: pnpm generate:assets [--source <absolute-path>] [--check]',
    );
  }

  return { checkOnly, sourceDirectory };
}

async function main(): Promise<void> {
  const { checkOnly, sourceDirectory } = parseArguments(process.argv.slice(2));
  const manifest = await generateManifest(sourceDirectory);
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  const markdown = serializeMarkdown(manifest);

  if (checkOnly) {
    const [currentJson, currentMarkdown] = await Promise.all([
      readExisting(inventoryJsonPath),
      readExisting(inventoryMarkdownPath),
    ]);
    if (currentJson !== json || currentMarkdown !== markdown) {
      throw new Error(
        `Asset inventory is out of date. Run pnpm generate:assets from ${rootDirectory}.`,
      );
    }
    return;
  }

  await mkdir(dirname(inventoryJsonPath), { recursive: true });
  await Promise.all([
    writeFile(inventoryJsonPath, json, 'utf8'),
    writeFile(inventoryMarkdownPath, markdown, 'utf8'),
  ]);
}

const executedPath = process.argv[1];
if (
  executedPath !== undefined &&
  import.meta.url === pathToFileURL(executedPath).href
) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
