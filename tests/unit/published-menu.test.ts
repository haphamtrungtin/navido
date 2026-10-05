import { describe, expect, it } from 'vitest';
import { parsePublishedMenu } from '@/features/menu/domain/published-menu';

const category = {
  id: 'new',
  name: { vi: 'Mới', en: '', ko: '' },
  sortOrder: 4,
};
const item = {
  id: 'new-item',
  categoryId: 'new',
  name: { vi: 'Món mới', en: '', ko: '' },
  priceVnd: 45000,
  sortOrder: 1,
  isAvailable: false,
};

describe('public menu boundary', () => {
  it('retains public descriptions/options and order settings with VI fallback', () => {
    const option = {
      id: 'size',
      name: { vi: 'Cỡ', en: '', ko: '' },
      minSelections: 1,
      maxSelections: 1,
      sortOrder: 0,
      active: true,
      choices: [
        {
          id: 'small',
          name: { vi: 'Nhỏ', en: '', ko: '' },
          priceVnd: 5000,
          sortOrder: 0,
          active: true,
        },
      ],
    };
    const menu = parsePublishedMenu({
      categories: [category],
      items: [
        {
          ...item,
          description: { vi: 'Mô tả', en: '', ko: '' },
          optionGroups: [option],
        },
      ],
      orderSettings: {
        timezone: 'Asia/Ho_Chi_Minh',
        preparationMinutes: 20,
        paused: true,
        days: Array.from({ length: 7 }, (_, day) => ({
          day,
          enabled: false,
          start: '07:00',
          lastOrder: '21:30',
          end: '22:00',
        })),
      },
    });
    expect(menu.items[0]?.description?.ko).toBe('Mô tả');
    expect(menu.items[0]?.optionGroups?.[0]?.choices[0]?.name.en).toBe('Nhỏ');
    expect(menu.orderSettings?.paused).toBe(true);
  });
  it('renders new DB items without invented import metadata and falls back to VI', () => {
    const menu = parsePublishedMenu({ categories: [category], items: [item] });
    expect(menu.categories[0]?.name).toEqual({
      vi: 'Mới',
      en: 'Mới',
      ko: 'Mới',
    });
    expect(menu.items[0]).toMatchObject({
      id: 'new-item',
      priceVnd: 45000,
      isAvailable: false,
      name: { en: 'Món mới', ko: 'Món mới' },
    });
    expect(menu.items[0]).not.toHaveProperty('sourceRow');
  });
  it('preserves order supplied by DB for renamed and newly created categories', () => {
    const menu = parsePublishedMenu({
      categories: [category, { ...category, id: 'old', sortOrder: 9 }],
      items: [item, { ...item, id: 'old-item', categoryId: 'old' }],
    });
    expect(menu.categories.map((c) => c.id)).toEqual(['new', 'old']);
  });
  it.each([-1, 1.5, 2147483648])('rejects invalid VND price %s', (priceVnd) => {
    expect(() =>
      parsePublishedMenu({
        categories: [category],
        items: [{ ...item, priceVnd }],
      }),
    ).toThrow();
  });
  it('rejects unknown categories, duplicate IDs and partial responses', () => {
    expect(() =>
      parsePublishedMenu({ categories: [], items: [item] }),
    ).toThrow();
    expect(() =>
      parsePublishedMenu({ categories: [category], items: [item, item] }),
    ).toThrow();
    expect(() => parsePublishedMenu({ categories: [category] })).toThrow();
  });
  it('strips internal metadata from the public type', () => {
    const menu = parsePublishedMenu({
      categories: [category],
      items: [
        {
          ...item,
          sourceName: 'Private',
          reviewNotes: ['Private'],
          updatedBy: 'actor',
        },
      ],
    });
    expect(menu.items[0]).not.toHaveProperty('sourceName');
    expect(menu.items[0]).not.toHaveProperty('reviewNotes');
    expect(menu.items[0]).not.toHaveProperty('updatedBy');
  });
  it('accepts a genuinely empty menu', () => {
    expect(parsePublishedMenu({ categories: [], items: [] })).toMatchObject({
      categories: [],
      items: [],
    });
  });
});
