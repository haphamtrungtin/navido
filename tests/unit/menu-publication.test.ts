import { describe, expect, it } from 'vitest';

import rawMenu from '../../menu.json';

import { normalizeMenu } from '@/features/menu/domain/normalize';
import { getMenuPublicationStatus } from '@/features/menu/domain/publication';

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

  it('classifies all non-mock source items as provisional drafts', () => {
    const statuses = result.items
      .filter((item) => item.sourceCategoryCode.trim() !== 'MOCK_BEANS')
      .map(getMenuPublicationStatus);

    expect(new Set(statuses)).toEqual(new Set(['draft']));
  });
});
