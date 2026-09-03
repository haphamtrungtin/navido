import { z } from 'zod';

const nonblankSourceString = z
  .string()
  .refine((value) => value.trim().length > 0, {
    message: 'Required',
  });

export const RawMenuItemSchema = z.object({
  sourceRow: z.number().int().positive(),
  name: nonblankSourceString,
  price: z.number().int().nonnegative(),
  category: nonblankSourceString,
  categoryCode: nonblankSourceString,
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
