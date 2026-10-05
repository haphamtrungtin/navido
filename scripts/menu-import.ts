import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import { normalizeMenu } from '../src/features/menu/domain/normalize';
import { getMenuPublicationStatus } from '../src/features/menu/domain/publication';
import {
  NormalizedMenuCategorySchema,
  NormalizedMenuItemSchema,
} from '../src/features/menu/domain/schemas';
import type { MenuCategory, MenuItem } from '../src/features/menu/domain/types';

export type ImportManifest = {
  rawSha256: string;
  normalizedSha256: string;
  categoryCount: number;
  itemCount: number;
  categories: MenuCategory[];
  items: (MenuItem & { publicationStatus: 'draft' | 'published' })[];
};
const schema = z.object({
  categories: z.array(NormalizedMenuCategorySchema).min(1),
  items: z.array(NormalizedMenuItemSchema).min(1),
});
const text = (value: string) => `'${value.replaceAll("'", "''")}'`;
const array = (values: readonly string[]) =>
  `ARRAY[${values.map(text).join(',')}]::text[]`;
const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');

export function buildMenuImport(
  raw: string,
  normalized: string,
): { sql: string; manifest: ImportManifest } {
  const menu = schema.parse(JSON.parse(normalized));
  for (const values of [
    menu.categories.map((category) => category.id),
    menu.items.map((item) => item.id),
    menu.items.map((item) => item.sourceRow),
  ]) {
    if (new Set<string | number>(values).size !== values.length)
      throw new Error('Duplicate source identifiers in menu import.');
  }
  const expected = normalizeMenu(JSON.parse(raw));
  if (
    !isDeepStrictEqual(menu, {
      categories: expected.categories,
      items: expected.items,
    })
  )
    throw new Error(
      'Raw and normalized menu do not match. Run validate:menu and review the source.',
    );
  const categoryIds = new Set(menu.categories.map((category) => category.id));
  if (menu.items.some((item) => !categoryIds.has(item.categoryId)))
    throw new Error('Missing menu category.');
  const items = menu.items.map((item) => ({
    ...item,
    publicationStatus:
      getMenuPublicationStatus(item) === 'hidden'
        ? ('draft' as const)
        : ('published' as const),
  }));
  const categoriesSql = menu.categories
    .map(
      (category) =>
        `(${[text(category.id), text(category.name.vi), text(category.name.en), text(category.name.ko), category.sortOrder, array(category.sourceCategoryCodes)].join(',')})`,
    )
    .join(',\n');
  const itemsSql = items
    .map(
      (item) =>
        `(${[text(item.id), text(item.categoryId), text(item.name.vi), text(item.name.en), text(item.name.ko), item.priceVnd, item.sortOrder, text(item.publicationStatus), true, item.sourceRow, text(item.sourceName), text(item.sourceCategoryCode), item.needsReview, array(item.reviewNotes), item.netWeightGram ?? 'NULL'].join(',')})`,
    )
    .join(',\n');
  const sql = `-- Initial menu snapshot. Raw SHA-256: ${hash(raw)}\nBEGIN;\nSET LOCAL standard_conforming_strings = on;\nINSERT INTO public.menu_categories(id,name_vi,name_en,name_ko,sort_order,source_category_codes) VALUES\n${categoriesSql}\nON CONFLICT (id) DO NOTHING;\nINSERT INTO public.menu_items(id,category_id,name_vi,name_en,name_ko,price_vnd,sort_order,publication_status,is_available,source_row,source_name,source_category_code,needs_review,review_notes,net_weight_gram) VALUES\n${itemsSql}\nON CONFLICT (id) DO NOTHING;\nCOMMIT;\n`;
  return {
    sql,
    manifest: {
      rawSha256: hash(raw),
      normalizedSha256: hash(normalized),
      categoryCount: menu.categories.length,
      itemCount: items.length,
      categories: menu.categories,
      items,
    },
  };
}
