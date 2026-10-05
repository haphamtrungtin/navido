import { z } from 'zod';
const integer = z.number().int().min(-2147483648).max(2147483647);
export const CategoryInputSchema = z.object({
  name: z.object({
    vi: z.string().trim().min(1).max(300),
    en: z.string().trim().max(300),
    ko: z.string().trim().max(300),
  }),
  sortOrder: integer,
});
export const ItemInputSchema = CategoryInputSchema.extend({
  categoryId: z.string().min(1).max(160),
  priceVnd: integer.min(0),
  publicationStatus: z.enum(['draft', 'published', 'archived']),
  isAvailable: z.boolean(),
  netWeightGram: integer.min(1).nullable(),
  needsReview: z.boolean(),
});
export const VersionSchema = integer.min(1);
