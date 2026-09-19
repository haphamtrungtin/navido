import { localMenuRepository } from '@/features/menu/repository/local-menu-repository';
import type { MenuItem } from '@/features/menu/domain/types';

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

export function selectRoasteryItems<T extends { sourceRow: number }>(
  items: readonly T[],
): readonly T[] {
  const seen = new Set<number>();

  return items.filter((item) => {
    if (seen.has(item.sourceRow)) {
      return false;
    }

    seen.add(item.sourceRow);
    return true;
  });
}

function getPublicItems(categoryIds: readonly string[]): MenuItem[] {
  return categoryIds.flatMap((categoryId) =>
    localMenuRepository.getItemsByCategory(categoryId),
  );
}

export function getRoasteryOrigins(): readonly RoasteryOrigin[] {
  const beans = selectRoasteryItems(
    getPublicItems([originCategoryId]).filter(
      (item) => item.sourceCategoryCode !== 'MOCK_BEANS',
    ),
  );

  return Object.freeze(
    beans.map((item) => ({
      label: item.name.en,
      sourceCategoryCode: item.sourceCategoryCode,
      sourceRows: Object.freeze([item.sourceRow]),
    })),
  );
}

export function getRoasteryCoffeePicks(limit = 3): readonly MenuItem[] {
  return Object.freeze(
    selectRoasteryItems(getPublicItems(coffeeCategoryIds)).slice(0, limit),
  );
}

export function getRoasteryBeanProducts(): readonly RoasteryBeanProduct[] {
  return Object.freeze(
    selectRoasteryItems(
      getPublicItems([originCategoryId]).filter(
        (item) => item.sourceCategoryCode !== 'MOCK_BEANS',
      ),
    ),
  );
}

export function getRoasteryMedia(key: RoasteryMediaKey): RoasteryMediaAsset {
  return getMedia(key);
}
