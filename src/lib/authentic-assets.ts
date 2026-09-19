import assetInventory from '../../docs/asset-inventory.json';

import type { MenuItem } from '@/features/menu/domain/types';

type EditorialAssetKey = 'bakery' | 'coffee' | 'space';

type InventoryAsset = (typeof assetInventory.assets)[number];

const editorialAssetPaths: Record<EditorialAssetKey, string> = {
  bakery: '/images/navido/bakery/navido_bakery_pastries_and_drinks_01.jpeg',
  coffee: '/images/navido/coffee/navido_coffee_table_setting_01.jpg',
  space: '/images/navido/space/navido_space_ground_floor_seating_01.jpeg',
};

const menuAssets = assetInventory.assets.filter(
  (asset): asset is InventoryAsset & { group: 'menu' } =>
    asset.group === 'menu',
);

function normalizeAssetTokens(value: string): string {
  return value
    .replace(/\([^)]*\)/g, ' ')
    .replace(/đ/gi, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function candidateTokens(item: MenuItem): readonly string[] {
  return [item.name.en, item.name.vi]
    .map(normalizeAssetTokens)
    .filter(
      (value, index, values) =>
        value.length > 0 && values.indexOf(value) === index,
    );
}

export function getAuthenticEditorialAssetPath(key: EditorialAssetKey): string {
  return editorialAssetPaths[key];
}

export function getAuthenticMenuAssetPath(item: MenuItem): string | null {
  const candidates = candidateTokens(item);
  const asset = menuAssets.find((entry) =>
    candidates.some((candidate) => entry.id.includes(`menu_${candidate}_`)),
  );

  return asset?.proposedPublicPath ?? null;
}
