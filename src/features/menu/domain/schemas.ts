import { z } from 'zod';

export const RawMenuItemSchema = z.object({
  sourceRow: z.number().int().positive(),
  name: z.string().trim().min(1),
  price: z.number().int().nonnegative(),
  category: z.string().trim().min(1),
  categoryCode: z.string().trim().min(1),
  sort: z.number().int(),
  netWeightGram: z.number().int().positive().optional(),
});

export const RawMenuSchema = z.array(RawMenuItemSchema);

export const NormalizedMenuItemSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  sourceCategoryCode: z.string().min(1),
  sourceName: z.string().min(1),
  name: z.object({
    vi: z.string(),
    en: z.string(),
    ko: z.string(),
  }),
  priceVnd: z.number().int().nonnegative(),
  sortOrder: z.number().int(),
  sourceRow: z.number().int().positive(),
  needsReview: z.boolean(),
  reviewNotes: z.array(z.string()),
  netWeightGram: z.number().int().positive().optional(),
});

export const NormalizedMenuCategorySchema = z.object({
  id: z.string().min(1),
  name: z.object({
    vi: z.string(),
    en: z.string(),
    ko: z.string(),
  }),
  sortOrder: z.number().int(),
  sourceCategoryCodes: z.array(z.string().min(1)).min(1),
});
