import { z } from 'zod';

const AssetFormatSchema = z.enum(['avif', 'jpeg', 'jpg', 'png', 'webp']);
const EncodedAssetFormatSchema = z.enum(['avif', 'jpeg', 'png', 'webp']);

type AssetFormat = z.infer<typeof AssetFormatSchema>;
type EncodedAssetFormat = z.infer<typeof EncodedAssetFormatSchema>;

const assetFormatMismatchAllowlist = {
  'space/navido_space_arch_seating_01.png': {
    format: 'png',
    encodedFormat: 'jpeg',
  },
  'space/navido_space_warm_dining_corner_01.png': {
    format: 'png',
    encodedFormat: 'jpeg',
  },
} as const satisfies Record<
  string,
  { format: AssetFormat; encodedFormat: EncodedAssetFormat }
>;

export function resolveAssetFormats(
  intakePath: string,
  sharpFormat: string | undefined,
): {
  format: AssetFormat;
  encodedFormat: EncodedAssetFormat;
  formatMismatchDisposition: 'formats-match' | 'allowlisted-owner-extension';
} {
  const extension = intakePath.split('.').at(-1)?.toLowerCase();
  const formatResult = AssetFormatSchema.safeParse(extension);
  if (!formatResult.success) {
    throw new Error(`Unsupported asset format: ${intakePath}`);
  }

  const normalizedSharpFormat = sharpFormat === 'heif' ? 'avif' : sharpFormat;
  const encodedFormatResult = EncodedAssetFormatSchema.safeParse(
    normalizedSharpFormat,
  );
  if (!encodedFormatResult.success) {
    throw new Error(
      `Unsupported encoded asset format: ${intakePath} (${sharpFormat ?? 'unknown'})`,
    );
  }

  const format = formatResult.data;
  const encodedFormat = encodedFormatResult.data;
  const expectedEncodedFormat =
    format === 'jpg' || format === 'jpeg' ? 'jpeg' : format;
  if (encodedFormat === expectedEncodedFormat) {
    return {
      format,
      encodedFormat,
      formatMismatchDisposition: 'formats-match',
    };
  }

  const allowlisted =
    assetFormatMismatchAllowlist[
      intakePath as keyof typeof assetFormatMismatchAllowlist
    ];
  if (
    allowlisted?.format === format &&
    allowlisted.encodedFormat === encodedFormat
  ) {
    return {
      format,
      encodedFormat,
      formatMismatchDisposition: 'allowlisted-owner-extension',
    };
  }

  throw new Error(
    `Unexpected asset format mismatch: ${intakePath} (supplied ${format}, encoded ${encodedFormat})`,
  );
}

export const AssetGroupSchema = z.enum([
  'bakery',
  'coffee',
  'logo',
  'menu',
  'space',
]);

export const AssetManifestEntrySchema = z.object({
  id: z.string().min(1),
  intakePath: z.string().min(1),
  proposedPublicPath: z.string().startsWith('/images/navido/'),
  group: AssetGroupSchema,
  format: AssetFormatSchema,
  encodedFormat: EncodedAssetFormatSchema,
  formatMismatchDisposition: z.enum([
    'formats-match',
    'allowlisted-owner-extension',
  ]),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  intendedUse: z.string().min(1),
  altSubject: z.string().min(1),
  crop: z.enum(['landscape', 'portrait', 'square', 'flexible']),
  authenticity: z.literal('verified-navido'),
  replacementStatus: z.enum(['ready', 'review-crop']),
  provenance: z.literal('owner-supplied'),
});

export const AssetManifestSchema = z.object({
  generatedFrom: z.literal('incoming-assets/navido'),
  assets: z.array(AssetManifestEntrySchema),
  missingGroups: z.array(
    z.enum([
      'packaging',
      'roaster-machine',
      'roasting-process',
      'roasting-team',
    ]),
  ),
});

export type AssetManifestEntry = z.infer<typeof AssetManifestEntrySchema>;
