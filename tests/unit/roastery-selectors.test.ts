import { describe, expect, it } from 'vitest';
import type { DisplayMenuItem } from '@/features/menu/domain/types';

import {
  getRoasteryBeanProducts,
  getRoasteryCoffeePicks,
  getRoasteryMedia,
  getRoasteryOrigins,
  selectRoasteryItems,
} from '@/features/roastery/selectors';

describe('Roastery selectors', () => {
  it('derives public origins without hidden mock rows', () => {
    const origins = getRoasteryOrigins([]);

    expect(origins).toEqual([]);
  });

  it('selects a bounded coffee bridge from public menu items', () => {
    const items: DisplayMenuItem[] = [1, 2, 3, 4].map((n) => ({
      id: `new-${n}`,
      categoryId: 'coffee',
      name: { vi: 'Coffee', en: 'Coffee', ko: 'Coffee' },
      priceVnd: 50000,
      sortOrder: n,
    }));
    const picks = getRoasteryCoffeePicks(items, 3);

    expect(picks).toHaveLength(3);
    expect(picks.every((item) => item.categoryId === 'coffee')).toBe(true);
  });

  it('returns an intentional empty state when no public packaged beans exist', () => {
    expect(getRoasteryBeanProducts([])).toEqual([]);
  });

  it('marks unresolved roastery media as temporary', () => {
    expect(getRoasteryMedia('roaster-machine')).toMatchObject({
      replacementStatus: 'temporary',
      replacementKey: 'roaster-machine',
    });
  });

  it('deduplicates selector input by ID while retaining distinct new DB items', () => {
    const items = [
      { id: 'one', name: 'Kenya AA' },
      { id: 'one', name: 'Kenya AA' },
      { id: 'two', name: 'Guatemala Pacaya' },
    ];

    expect(selectRoasteryItems(items)).toEqual([
      { id: 'one', name: 'Kenya AA' },
      { id: 'two', name: 'Guatemala Pacaya' },
    ]);
    expect(selectRoasteryItems([])).toEqual([]);
  });
});
