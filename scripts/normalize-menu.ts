import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { z } from 'zod';

import { normalizeMenu } from '../src/features/menu/domain/normalize';
import {
  NormalizedMenuCategorySchema,
  NormalizedMenuItemSchema,
} from '../src/features/menu/domain/schemas';
import type {
  MenuAnomaly,
  NormalizationResult,
} from '../src/features/menu/domain/types';

const rootDirectory = fileURLToPath(new URL('../', import.meta.url));
const sourcePath = fileURLToPath(new URL('../menu.json', import.meta.url));
const generatedDataPath = fileURLToPath(
  new URL(
    '../src/features/menu/data/normalized-menu.generated.json',
    import.meta.url,
  ),
);
const reviewPath = fileURLToPath(
  new URL('../docs/menu-review.md', import.meta.url),
);

const GeneratedMenuSchema = z.object({
  categories: z.array(NormalizedMenuCategorySchema),
  items: z.array(NormalizedMenuItemSchema),
});

type ReviewGroup = {
  title: string;
  anomalies: readonly MenuAnomaly[];
};

function serializeGeneratedMenu(result: NormalizationResult): string {
  const generated = GeneratedMenuSchema.parse({
    categories: result.categories,
    items: result.items,
  });

  return `${JSON.stringify(generated, null, 2)}\n`;
}

function formatAnomaly(anomaly: MenuAnomaly): string {
  const related =
    anomaly.relatedSourceRow === undefined
      ? ''
      : ` Related row: ${anomaly.relatedSourceRow}.`;
  return `- Row ${anomaly.sourceRow}: ${anomaly.message}${related}`;
}

function groupAnomalies(anomalies: readonly MenuAnomaly[]): ReviewGroup[] {
  const matching = (...types: MenuAnomaly['type'][]) =>
    anomalies.filter((anomaly) => types.includes(anomaly.type));

  return [
    {
      title: 'Corrections',
      anomalies: matching('source-encoding-repaired'),
    },
    {
      title: 'Generated Translations',
      anomalies: matching('generated-translation'),
    },
    {
      title: 'Suspected Duplicates',
      anomalies: matching('exact-duplicate', 'likely-duplicate'),
    },
    {
      title: 'Mixed-Language Names',
      anomalies: matching('mixed-language-name'),
    },
    {
      title: 'Suspicious Source Rows',
      anomalies: matching('suspicious-record'),
    },
  ];
}

function serializeReview(result: NormalizationResult): string {
  const summary = [
    '# NAVIDO Menu Review',
    '',
    'Generated from the immutable `menu.json` source. Content anomalies remain renderable and require editorial review.',
    '',
    '## Summary',
    '',
    `- Source records: ${result.items.length}`,
    `- Display categories: ${result.categories.length}`,
    `- Review anomalies: ${result.anomalies.length}`,
  ];

  const groups = groupAnomalies(result.anomalies).flatMap((group) => [
    '',
    `## ${group.title}`,
    '',
    ...(group.anomalies.length === 0
      ? ['- None.']
      : group.anomalies.map(formatAnomaly)),
  ]);

  return `${[...summary, ...groups].join('\n')}\n`;
}

async function generatedOutputs(): Promise<{
  data: string;
  review: string;
}> {
  const source = await readFile(sourcePath, 'utf8');
  const rawMenu: unknown = JSON.parse(source);
  const normalized = normalizeMenu(rawMenu);

  return {
    data: serializeGeneratedMenu(normalized),
    review: serializeReview(normalized),
  };
}

async function readExisting(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined;
    throw error;
  }
}

async function main(): Promise<void> {
  const arguments_ = process.argv.slice(2);
  const checkOnly = arguments_.includes('--check');
  if (arguments_.some((argument) => argument !== '--check')) {
    throw new Error('Usage: pnpm generate:menu [--check]');
  }

  const outputs = await generatedOutputs();
  if (checkOnly) {
    const [currentData, currentReview] = await Promise.all([
      readExisting(generatedDataPath),
      readExisting(reviewPath),
    ]);
    if (currentData !== outputs.data || currentReview !== outputs.review) {
      throw new Error(
        `Generated menu data is out of date. Run pnpm generate:menu from ${rootDirectory}.`,
      );
    }
    return;
  }

  await Promise.all([
    mkdir(dirname(generatedDataPath), { recursive: true }),
    mkdir(dirname(reviewPath), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(generatedDataPath, outputs.data, 'utf8'),
    writeFile(reviewPath, outputs.review, 'utf8'),
  ]);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
