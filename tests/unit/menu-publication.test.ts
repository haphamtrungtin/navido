import { describe, expect, it } from 'vitest';

import rawMenu from '../../menu.json';

import { normalizeMenu } from '@/features/menu/domain/normalize';
import { getMenuPublicationStatus } from '@/features/menu/domain/publication';
import { localMenuRepository } from '@/features/menu/repository/local-menu-repository';

describe('provisional menu publication policy', () => {
  const result = normalizeMenu(rawMenu);

  it('hides every mock-source product deterministically', () => {
    const mockItems = result.items.filter(
      (item) =>
        item.sourceCategoryCode.trim() === 'MOCK_BEANS' ||
        /\bmock\b/i.test(item.sourceName),
    );

    expect(mockItems).toHaveLength(3);
    expect(mockItems.map(getMenuPublicationStatus)).toEqual([
      'hidden',
      'hidden',
      'hidden',
    ]);
  });

  it('excludes hidden mock products and empty categories from the public repository', () => {
    const visibleItems = localMenuRepository
      .getCategories()
      .flatMap((category) =>
        localMenuRepository.getItemsByCategory(category.id),
      );

    expect(visibleItems).toHaveLength(127);
    expect(
      visibleItems.some(
        (item) => item.sourceCategoryCode.trim() === 'MOCK_BEANS',
      ),
    ).toBe(false);
    expect(
      localMenuRepository
        .getCategories()
        .some((category) => category.id === 'coffee-beans'),
    ).toBe(false);
  });

  it('classifies all non-mock source items as provisional drafts', () => {
    const statuses = result.items
      .filter((item) => item.sourceCategoryCode.trim() !== 'MOCK_BEANS')
      .map(getMenuPublicationStatus);

    expect(new Set(statuses)).toEqual(new Set(['draft']));
  });
});
