import { beforeEach, describe, expect, it, vi } from 'vitest';
const backend = vi.hoisted(() => ({ denied: false, error: false }));
const category = {
  id: 'coffee',
  name_vi: 'Cà phê',
  name_en: '',
  name_ko: '',
  sort_order: 1,
  version: 1,
  source_category_codes: [],
  updated_at: '2026-10-05',
};
const rows = [
  {
    id: 'b',
    category_id: 'coffee',
    name_vi: 'Cà phê B',
    name_en: '',
    name_ko: '',
    sort_order: 1,
    publication_status: 'published',
    is_available: false,
    price_vnd: 50000,
    version: 1,
    source_row: null,
    source_name: null,
    source_category_code: null,
    needs_review: true,
    review_notes: [],
    net_weight_gram: null,
    updated_at: '2026-10-05',
    updated_by: null,
  },
  {
    id: 'a',
    category_id: 'coffee',
    name_vi: 'Cà phê A',
    name_en: '',
    name_ko: '',
    sort_order: 0,
    publication_status: 'draft',
    is_available: true,
    price_vnd: 40000,
    version: 1,
    source_row: null,
    source_name: null,
    source_category_code: null,
    needs_review: false,
    review_notes: [],
    net_weight_gram: null,
    updated_at: '2026-10-05',
    updated_by: null,
  },
];
vi.mock('@/features/admin-auth/access', () => ({
  requireAdmin: async () => {
    if (backend.denied) throw new Error('denied');
    return { role: 'owner' };
  },
}));
vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: async () => ({
    from: (table: string) => {
      let id: string | null = null;
      const query = {
        select: () => query,
        order: () => query,
        eq: (_key: string, value: string) => {
          id = value;
          return query;
        },
        range: async () => ({
          data: table === 'menu_categories' ? [category] : rows,
          error: backend.error ? { message: 'private' } : null,
        }),
        maybeSingle: async () => ({
          data: rows.find((row) => row.id === id) ?? null,
          error: null,
        }),
      };
      return query;
    },
  }),
}));
import {
  getCatalogItem,
  getCatalogPreview,
  listCatalog,
} from '@/features/catalog/repository';
describe('private catalog reads', () => {
  beforeEach(() => {
    backend.denied = false;
    backend.error = false;
  });
  it('filters literal search text and review status without raw DB filter interpolation', async () => {
    const result = await listCatalog({ query: 'CA PHE', needsReview: true });
    expect(result.items.map((item) => item.id)).toEqual(['b']);
    expect(result.items[0]?.isAvailable).toBe(false);
    expect((await listCatalog({ query: '),or(id.eq.a' })).items).toEqual([]);
  });
  it('previews only published items and preserves sold-out records', async () => {
    expect((await getCatalogPreview()).items.map((item) => item.id)).toEqual([
      'b',
    ]);
    expect(await getCatalogItem('missing')).toBeNull();
  });
  it('reauthenticates every read and never falls back to file data during DB errors', async () => {
    await listCatalog({});
    backend.denied = true;
    await expect(listCatalog({})).rejects.toThrow();
    backend.denied = false;
    backend.error = true;
    await expect(listCatalog({})).rejects.toThrow('Catalog request failed');
  });
});
