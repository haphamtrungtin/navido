import { z } from 'zod';
import type { DisplayMenuItem, MenuCategory } from './types';

const int = z.number().int().min(-2147483648).max(2147483647);
const id = z.string().min(1).max(160);
const name = z
  .object({ vi: z.string().trim().min(1), en: z.string(), ko: z.string() })
  .transform((n) => ({
    vi: n.vi,
    en: n.en.trim() || n.vi,
    ko: n.ko.trim() || n.vi,
  }));
const category = z
  .object({ id, name, sortOrder: int })
  .transform((c) => ({ ...c, sourceCategoryCodes: [] }));
const item = z
  .object({
    id,
    categoryId: id,
    name,
    priceVnd: int.nonnegative(),
    sortOrder: int,
    isAvailable: z.boolean(),
    netWeightGram: int.positive().nullish(),
  })
  .transform((i) => ({ ...i, netWeightGram: i.netWeightGram ?? undefined }));
const schema = z
  .object({ categories: z.array(category), items: z.array(item) })
  .superRefine((menu, ctx) => {
    const categories = new Set(menu.categories.map((c) => c.id));
    if (
      categories.size !== menu.categories.length ||
      new Set(menu.items.map((i) => i.id)).size !== menu.items.length ||
      menu.items.some((i) => !categories.has(i.categoryId))
    ) {
      ctx.addIssue({ code: 'custom', message: 'Inconsistent public menu' });
    }
  });
export type PublishedMenu = {
  categories: MenuCategory[];
  items: DisplayMenuItem[];
};
export function parsePublishedMenu(input: unknown): PublishedMenu {
  return schema.parse(input);
}
