import { describe, expect, it } from 'vitest';

import {
  getRoasteryBeanProducts,
  getRoasteryCoffeePicks,
  getRoasteryMedia,
  getRoasteryOrigins,
  selectRoasteryItems,
} from '@/features/roastery/selectors';

describe('Roastery selectors', () => {
  it('derives public origins without hidden mock rows', () => {
    const origins = getRoasteryOrigins();

    expect(origins).toEqual([]);
  });

  it('selects a bounded coffee bridge from public menu items', () => {
    const picks = getRoasteryCoffeePicks(3);

    expect(picks).toHaveLength(3);
    expect(
      picks.every((item) => item.sourceCategoryCode !== 'MOCK_BEANS'),
    ).toBe(true);
  });

  it('returns an intentional empty state when no public packaged beans exist', () => {
    expect(getRoasteryBeanProducts()).toEqual([]);
  });

  it('marks unresolved roastery media as temporary', () => {
    expect(getRoasteryMedia('roaster-machine')).toMatchObject({
      replacementStatus: 'temporary',
      replacementKey: 'roaster-machine',
    });
  });

  it('deduplicates selector input by source row while preserving order', () => {
    const items = [
      { sourceRow: 1, sourceName: 'Kenya AA' },
      { sourceRow: 1, sourceName: 'Kenya AA' },
      { sourceRow: 2, sourceName: 'Guatemala Pacaya' },
    ];

    expect(selectRoasteryItems(items)).toEqual([
      { sourceRow: 1, sourceName: 'Kenya AA' },
      { sourceRow: 2, sourceName: 'Guatemala Pacaya' },
    ]);
    expect(selectRoasteryItems([])).toEqual([]);
  });
});
