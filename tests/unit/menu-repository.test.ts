import { describe, expect, it } from 'vitest';

import { localMenuRepository } from '@/features/menu/repository/local-menu-repository';

describe('local menu repository', () => {
  it('exposes all 130 unique source rows through ordered display categories', () => {
    const categories = localMenuRepository.getCategories();
    const items = categories.flatMap((category) =>
      localMenuRepository.getItemsByCategory(category.id),
    );

    expect(categories.map((category) => category.id)).toEqual([
      'signature',
      'coffee',
      'brew-coffee',
      'phin',
      'non-coffee',
      'frappuccino',
      'fruit-juices',
      'tea-pot-cup',
      'brunch',
      'cake',
      'desserts',
      'extras',
      'specialty-coffee',
      'coffee-beans',
    ]);
    expect(items).toHaveLength(130);
    expect(new Set(items.map((item) => item.sourceRow))).toHaveLength(130);
  });

  it('merges Extras only at the display level while retaining source traceability', () => {
    const extras = localMenuRepository
      .getCategories()
      .find((category) => category.id === 'extras');
    const extraItems = localMenuRepository.getItemsByCategory('extras');

    expect(extras?.sourceCategoryCodes).toEqual([
      'ITEM_TYPE-7918',
      'ITEM_TYPE_OTHER',
    ]);
    expect(extraItems.map((item) => item.sourceCategoryCode)).toEqual(
      expect.arrayContaining(['ITEM_TYPE-7918', 'ITEM_TYPE_OTHER']),
    );
  });

  it('returns items in deterministic category order and never exposes internal category codes as IDs', () => {
    const categories = localMenuRepository.getCategories();
    const coffeeItems = localMenuRepository.getItemsByCategory('coffee');

    expect(
      categories.every((category) => !category.id.startsWith('ITEM_TYPE')),
    ).toBe(true);
    expect(coffeeItems).toEqual(
      [...coffeeItems].sort(
        (left, right) =>
          left.sortOrder - right.sortOrder || left.sourceRow - right.sourceRow,
      ),
    );
    expect(localMenuRepository.getItemsByCategory('missing-category')).toEqual(
      [],
    );
  });
});
