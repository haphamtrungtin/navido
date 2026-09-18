import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { AssetManifestSchema, resolveAssetFormats } from '@/lib/asset-manifest';

const manifest = AssetManifestSchema.parse(
  JSON.parse(readFileSync(resolve('docs/asset-inventory.json'), 'utf8')),
);

describe('authentic NAVIDO asset manifest', () => {
  it('records every supplied asset exactly once', () => {
    expect(manifest.assets).toHaveLength(110);
    expect(new Set(manifest.assets.map((asset) => asset.intakePath)).size).toBe(
      110,
    );
    expect(manifest.assets.every((asset) => asset.width > 0)).toBe(true);
    expect(manifest.assets.every((asset) => asset.height > 0)).toBe(true);
  });

  it('records known file-format counts', () => {
    const counts = manifest.assets.reduce<Record<string, number>>(
      (result, asset) => ({
        ...result,
        [asset.format]: (result[asset.format] ?? 0) + 1,
      }),
      {},
    );
    expect(counts).toEqual({ avif: 97, jpeg: 3, jpg: 6, png: 2, webp: 2 });
  });

  it('records only the two reviewed extension-encoding mismatches', () => {
    expect(
      manifest.assets
        .filter((asset) => asset.formatMismatchDisposition !== 'formats-match')
        .map((asset) => ({
          intakePath: asset.intakePath,
          format: asset.format,
          encodedFormat: asset.encodedFormat,
          formatMismatchDisposition: asset.formatMismatchDisposition,
        })),
    ).toEqual([
      {
        intakePath: 'space/navido_space_arch_seating_01.png',
        format: 'png',
        encodedFormat: 'jpeg',
        formatMismatchDisposition: 'allowlisted-owner-extension',
      },
      {
        intakePath: 'space/navido_space_warm_dining_corner_01.png',
        format: 'png',
        encodedFormat: 'jpeg',
        formatMismatchDisposition: 'allowlisted-owner-extension',
      },
    ]);
  });

  it('normalizes encoding aliases without treating them as mismatches', () => {
    expect(resolveAssetFormats('menu/example.avif', 'heif')).toEqual({
      format: 'avif',
      encodedFormat: 'avif',
      formatMismatchDisposition: 'formats-match',
    });
    expect(resolveAssetFormats('menu/example.jpg', 'jpeg')).toEqual({
      format: 'jpg',
      encodedFormat: 'jpeg',
      formatMismatchDisposition: 'formats-match',
    });
    expect(resolveAssetFormats('menu/example.jpeg', 'jpeg')).toEqual({
      format: 'jpeg',
      encodedFormat: 'jpeg',
      formatMismatchDisposition: 'formats-match',
    });
  });

  it('rejects an unexpected extension-encoding mismatch', () => {
    expect(() => resolveAssetFormats('menu/unexpected.png', 'jpeg')).toThrow(
      'Unexpected asset format mismatch: menu/unexpected.png (supplied png, encoded jpeg)',
    );
  });

  it('keeps unresolved Roastery photography explicit', () => {
    expect(manifest.missingGroups).toEqual([
      'packaging',
      'roaster-machine',
      'roasting-process',
      'roasting-team',
    ]);
  });
});
