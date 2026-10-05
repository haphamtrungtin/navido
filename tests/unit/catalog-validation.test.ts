import { describe, expect, it } from 'vitest';
import {
  CategoryInputSchema,
  ItemInputSchema,
} from '@/features/catalog/schemas';
const input = {
  name: { vi: 'Cà phê', en: '', ko: '' },
  categoryId: 'coffee',
  priceVnd: 50000,
  sortOrder: 1,
  publicationStatus: 'draft',
  isAvailable: true,
  netWeightGram: null,
  needsReview: false,
};
describe('catalog write validation', () => {
  it.each([
    { priceVnd: -1 },
    { priceVnd: 1.5 },
    { priceVnd: 2147483648 },
    { name: { vi: ' ', en: '', ko: '' } },
    { netWeightGram: 0 },
    { publicationStatus: 'verified' },
    { categoryId: '' },
  ])('rejects invalid item input %j', (change) => {
    expect(ItemInputSchema.safeParse({ ...input, ...change }).success).toBe(
      false,
    );
  });
  it('allows a free item and missing translations without permitting arbitrary metadata', () => {
    const result = ItemInputSchema.parse({
      ...input,
      priceVnd: 0,
      updatedBy: 'spoofed',
      sourceRow: 42,
    });
    expect(result.priceVnd).toBe(0);
    expect(result).not.toHaveProperty('updatedBy');
    expect(result).not.toHaveProperty('sourceRow');
  });
  it('requires a nonblank category name and integer sort order', () => {
    expect(
      CategoryInputSchema.safeParse({
        name: { vi: '', en: '', ko: '' },
        sortOrder: 1,
      }).success,
    ).toBe(false);
    expect(
      CategoryInputSchema.safeParse({
        name: { vi: 'Món', en: '', ko: '' },
        sortOrder: 1.5,
      }).success,
    ).toBe(false);
  });
});
