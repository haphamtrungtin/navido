import 'server-only';
import type { CatalogCategory, CatalogFilters, CatalogItem } from './types';
import { CatalogError } from './types';
import { ItemInputSchema } from './schemas';
import { requireAdmin } from '@/features/admin-auth/access';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Tables } from '@/lib/supabase/database.types';

function mapItem(row: Tables<'menu_items'>): CatalogItem {
  const input = ItemInputSchema.parse({
    name: { vi: row.name_vi, en: row.name_en, ko: row.name_ko },
    categoryId: row.category_id,
    priceVnd: row.price_vnd,
    sortOrder: row.sort_order,
    publicationStatus: row.publication_status,
    isAvailable: row.is_available,
    netWeightGram: row.net_weight_gram,
    needsReview: row.needs_review,
  });
  return {
    ...input,
    id: row.id,
    version: row.version,
    sourceRow: row.source_row,
    sourceName: row.source_name,
    sourceCategoryCode: row.source_category_code,
    reviewNotes: row.review_notes,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}
function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('vi')
    .replaceAll('đ', 'd');
}
async function readPages<T>(
  read: (
    start: number,
    end: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await read(offset, offset + 999);
    if (result.error || !result.data) throw new CatalogError('unavailable');
    rows.push(...result.data);
    if (result.data.length < 1000) return rows;
  }
}

export async function listCatalog(
  filters: CatalogFilters,
): Promise<{ categories: CatalogCategory[]; items: CatalogItem[] }> {
  await requireAdmin();
  try {
    const client = await createServerSupabaseClient();
    const [categoryRows, itemRows] = await Promise.all([
      readPages((start, end) =>
        client
          .from('menu_categories')
          .select('*')
          .order('sort_order')
          .order('id')
          .range(start, end),
      ),
      readPages((start, end) =>
        client
          .from('menu_items')
          .select('*')
          .order('sort_order')
          .order('id')
          .range(start, end),
      ),
    ]);
    const categories: CatalogCategory[] = categoryRows.map((row) => ({
      id: row.id,
      name: { vi: row.name_vi, en: row.name_en, ko: row.name_ko },
      sortOrder: row.sort_order,
      version: row.version,
      sourceCategoryCodes: row.source_category_codes,
      updatedAt: row.updated_at,
    }));
    const query = fold(filters.query?.trim().slice(0, 300) ?? '');
    const items = itemRows
      .map(mapItem)
      .filter(
        (item) =>
          (!filters.categoryId || item.categoryId === filters.categoryId) &&
          (!filters.publicationStatus ||
            item.publicationStatus === filters.publicationStatus) &&
          (filters.needsReview === undefined ||
            item.needsReview === filters.needsReview) &&
          (!query ||
            Object.values(item.name).some((name) =>
              fold(name).includes(query),
            )),
      );
    return { categories, items };
  } catch {
    throw new CatalogError('unavailable');
  }
}
export async function getCatalogItem(id: string): Promise<CatalogItem | null> {
  await requireAdmin();
  try {
    const client = await createServerSupabaseClient();
    const result = await client
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (result.error) throw new CatalogError('unavailable');
    return result.data ? mapItem(result.data) : null;
  } catch {
    throw new CatalogError('unavailable');
  }
}
export async function getCatalogPreview(): Promise<{
  categories: CatalogCategory[];
  items: CatalogItem[];
}> {
  const catalog = await listCatalog({ publicationStatus: 'published' });
  const order = new Map(
    catalog.categories.map((category, index) => [category.id, index]),
  );
  catalog.items.sort(
    (a, b) =>
      (order.get(a.categoryId) ?? 0) - (order.get(b.categoryId) ?? 0) ||
      a.sortOrder - b.sortOrder ||
      a.id.localeCompare(b.id),
  );
  return {
    categories: catalog.categories.filter((category) =>
      catalog.items.some((item) => item.categoryId === category.id),
    ),
    items: catalog.items,
  };
}
