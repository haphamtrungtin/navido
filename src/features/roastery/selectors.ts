import type { DisplayMenuItem } from '@/features/menu/domain/types';

import type {
  RoasteryBeanProduct,
  RoasteryOrigin,
  RoasteryMediaAsset,
  RoasteryMediaKey,
} from './domain/types';
import { getRoasteryMedia as getMedia } from './media';

const originCategoryId = 'coffee-beans';
const coffeeCategoryIds = [
  'signature',
  'specialty-coffee',
  'coffee',
  'brew-coffee',
  'phin',
] as const;

export function selectRoasteryItems<T extends { id: string }>(
  items: readonly T[],
): readonly T[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function getPublicItems(
  items: readonly DisplayMenuItem[],
  categoryIds: readonly string[],
): DisplayMenuItem[] {
  return categoryIds.flatMap((categoryId) =>
    items.filter((item) => item.categoryId === categoryId),
  );
}

export function getRoasteryOrigins(
  items: readonly DisplayMenuItem[],
): readonly RoasteryOrigin[] {
  const beans = selectRoasteryItems(getPublicItems(items, [originCategoryId]));

  return Object.freeze(
    beans.map((item) => ({
      label: item.name.en,
      itemId: item.id,
    })),
  );
}

export function getRoasteryCoffeePicks(
  items: readonly DisplayMenuItem[],
  limit = 3,
): readonly DisplayMenuItem[] {
  return Object.freeze(
    selectRoasteryItems(getPublicItems(items, coffeeCategoryIds)).slice(
      0,
      limit,
    ),
  );
}

export function getRoasteryBeanProducts(
  items: readonly DisplayMenuItem[],
): readonly RoasteryBeanProduct[] {
  return Object.freeze(
    selectRoasteryItems(getPublicItems(items, [originCategoryId])),
  );
}

export function getRoasteryMedia(key: RoasteryMediaKey): RoasteryMediaAsset {
  return getMedia(key);
}
