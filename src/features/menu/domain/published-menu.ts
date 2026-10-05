import { z } from 'zod';
import type { DisplayMenuItem, MenuCategory } from './types';

import {
  OptionGroupsSchema,
  OrderSettingsSchema,
} from '@/features/catalog/extensions/schemas';
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
    description: z
      .object({ vi: z.string(), en: z.string(), ko: z.string() })
      .transform((n) => ({
        vi: n.vi,
        en: n.en.trim() || n.vi,
        ko: n.ko.trim() || n.vi,
      }))
      .optional(),
    optionGroups: OptionGroupsSchema.transform((groups) =>
      groups.map((g) => ({
        ...g,
        name: {
          vi: g.name.vi,
          en: g.name.en || g.name.vi,
          ko: g.name.ko || g.name.vi,
        },
        choices: g.choices.map((c) => ({
          ...c,
          name: {
            vi: c.name.vi,
            en: c.name.en || c.name.vi,
            ko: c.name.ko || c.name.vi,
          },
        })),
      })),
    ).optional(),
    netWeightGram: int.positive().nullish(),
  })
  .transform((i) => ({ ...i, netWeightGram: i.netWeightGram ?? undefined }));
const schema = z
  .object({
    categories: z.array(category),
    items: z.array(item),
    orderSettings: OrderSettingsSchema.extend({
      timezone: z.literal('Asia/Ho_Chi_Minh'),
    }).optional(),
  })
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
  orderSettings?: z.infer<typeof OrderSettingsSchema> & {
    timezone: 'Asia/Ho_Chi_Minh';
  };
};
export function parsePublishedMenu(input: unknown): PublishedMenu {
  return schema.parse(input);
}
