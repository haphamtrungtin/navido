import { describe, expect, it } from 'vitest';

import {
  featuredMenuItemIds,
  menuCategoryPresentations,
} from '@/features/menu/domain/presentation';
import { localMenuRepository } from '@/features/menu/repository/local-menu-repository';

describe('menu presentation', () => {
  it('assigns one Stitch-derived chapter pattern to every source category', () => {
    const categoryIds = localMenuRepository
      .getCategories()
      .map((category) => category.id);

    expect(Object.keys(menuCategoryPresentations)).toEqual(categoryIds);
    expect(menuCategoryPresentations.signature).toEqual({
      chapter: 'signature',
      image: 'avocado',
    });
    expect(menuCategoryPresentations['brew-coffee']).toEqual({
      chapter: 'media-left',
      image: 'pour-over',
    });
    expect(menuCategoryPresentations.brunch).toEqual({
      chapter: 'media-right',
      image: 'brunch',
    });
    expect(menuCategoryPresentations.extras.chapter).toBe('compact');
  });

  it('uses four deterministic featured items that exist in normalized data', () => {
    expect(featuredMenuItemIds).toEqual([
      'row-2-signature',
      'row-52-coffee',
      'row-105-phin',
      'row-7-brunch',
    ]);

    const itemIds = new Set(
      localMenuRepository
        .getCategories()
        .flatMap((category) =>
          localMenuRepository
            .getItemsByCategory(category.id)
            .map((item) => item.id),
        ),
    );

    expect(featuredMenuItemIds.every((id) => itemIds.has(id))).toBe(true);
  });
});
