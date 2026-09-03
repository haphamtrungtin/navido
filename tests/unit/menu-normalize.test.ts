import { describe, expect, it } from 'vitest';

import rawMenu from '../../menu.json';
import {
  malformedPriceMenuFixture,
  multilingualMenuFixture,
} from '../fixtures/menu';

import { RawMenuItemSchema } from '@/features/menu/domain/schemas';
import {
  formatPriceVnd,
  normalizeMenu,
} from '@/features/menu/domain/normalize';

describe('menu normalization', () => {
  it('keeps every record with a stable ID and source traceability', () => {
    const result = normalizeMenu(multilingualMenuFixture);
    const avocado = result.items.find((item) => item.sourceRow === 2);

    expect(result.items).toHaveLength(8);
    expect(avocado).toMatchObject({
      id: 'row-2-signature',
      categoryId: 'signature',
      sourceCategoryCode: 'SIG',
      sourceName: 'Cà phê Avocado Coffee (아보카도 커피)',
      sourceRow: 2,
      priceVnd: 85000,
      name: {
        vi: 'Cà phê Avocado Coffee',
        en: 'Avocado Coffee',
        ko: '아보카도 커피',
      },
    });
  });

  it('preserves all 130 supplied menu records with unique source rows', () => {
    const result = normalizeMenu(rawMenu);

    expect(result.items).toHaveLength(130);
    expect(new Set(result.items.map((item) => item.sourceRow)).size).toBe(130);
    expect(result.items.find((item) => item.sourceRow === 2)?.id).toBe(
      'row-2-signature',
    );
  });

  it('maps both raw Extras codes to a single display category without losing source codes', () => {
    const result = normalizeMenu(multilingualMenuFixture);
    const extras = result.items.filter((item) => item.categoryId === 'extras');

    expect(extras).toHaveLength(2);
    expect(extras.map((item) => item.sourceCategoryCode).sort()).toEqual([
      'ITEM_TYPE-7918',
      'ITEM_TYPE_OTHER',
    ]);
    expect(
      result.categories.find((category) => category.id === 'extras'),
    ).toMatchObject({
      sourceCategoryCodes: ['ITEM_TYPE-7918', 'ITEM_TYPE_OTHER'],
    });
  });

  it('flags generated translations, suspicious mock data, and duplicate rows without deleting them', () => {
    const result = normalizeMenu(multilingualMenuFixture);
    const duplicate = result.items.find((item) => item.sourceRow === 60);
    const beans = result.items.find((item) => item.sourceRow === 9001);

    expect(result.items).toHaveLength(8);
    expect(duplicate?.needsReview).toBe(true);
    expect(duplicate?.reviewNotes).toContain('exact-duplicate:row-59');
    expect(beans?.needsReview).toBe(true);
    expect(beans?.reviewNotes).toContain('generated-translation:en');
    expect(beans?.reviewNotes).toContain('generated-translation:ko');
    expect(beans?.reviewNotes).toContain('mock-source-record');
    expect(result.anomalies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'exact-duplicate', sourceRow: 60 }),
        expect.objectContaining({ type: 'likely-duplicate', sourceRow: 62 }),
        expect.objectContaining({ type: 'suspicious-record', sourceRow: 9001 }),
      ]),
    );
  });

  it('orders display categories by source order and items by source row within a category', () => {
    const result = normalizeMenu(multilingualMenuFixture);

    expect(result.categories.map((category) => category.id)).toEqual([
      'signature',
      'coffee',
      'extras',
      'coffee-beans',
    ]);
    expect(
      result.items
        .filter((item) => item.categoryId === 'coffee')
        .map((item) => item.sourceRow),
    ).toEqual([59, 60, 61, 62]);
  });

  it('flags a derived English label from supplied Vietnamese source text for review', () => {
    const item = normalizeMenu(rawMenu).items.find(
      (candidate) => candidate.sourceRow === 52,
    );

    expect(item?.needsReview).toBe(true);
    expect(item?.reviewNotes).toContain('generated-translation:en');
  });

  it('uses the canonical Extras category order when the raw codes arrive reversed', () => {
    const result = normalizeMenu([
      {
        sourceRow: 128,
        name: 'Extra Shot',
        price: 10000,
        category: 'Extras',
        categoryCode: 'ITEM_TYPE_OTHER',
        sort: 13,
      },
      {
        sourceRow: 78,
        name: 'Bread',
        price: 40000,
        category: 'Extras',
        categoryCode: 'ITEM_TYPE-7918',
        sort: 11,
      },
    ]);

    expect(result.categories).toEqual([
      expect.objectContaining({
        id: 'extras',
        sortOrder: 11,
        sourceCategoryCodes: ['ITEM_TYPE-7918', 'ITEM_TYPE_OTHER'],
      }),
    ]);
  });

  it('preserves raw source strings while using normalized values for display mapping', () => {
    const rawName = '  Raw Americano  ';
    const rawCategory = '  Coffee  ';
    const rawCategoryCode = ' CF ';
    const item = normalizeMenu([
      {
        sourceRow: 301,
        name: rawName,
        price: 60000,
        category: rawCategory,
        categoryCode: rawCategoryCode,
        sort: 1,
      },
    ]).items[0];

    expect(
      RawMenuItemSchema.parse({
        sourceRow: 301,
        name: rawName,
        price: 60000,
        category: rawCategory,
        categoryCode: rawCategoryCode,
        sort: 1,
      }),
    ).toMatchObject({
      name: rawName,
      category: rawCategory,
      categoryCode: rawCategoryCode,
    });

    expect(item).toMatchObject({
      sourceName: rawName,
      sourceCategoryCode: rawCategoryCode,
      categoryId: 'coffee',
    });
  });
  it('rejects malformed source prices instead of coercing them', () => {
    expect(() => normalizeMenu(malformedPriceMenuFixture)).toThrow(/price/i);
  });

  it('formats prices with locale-aware VND formatting', () => {
    expect(formatPriceVnd(85000, 'vi')).toBe('85.000 ₫');
    expect(formatPriceVnd(85000, 'en')).toBe('₫85,000');
    expect(formatPriceVnd(85000, 'ko')).toBe('₫85,000');
  });
});
