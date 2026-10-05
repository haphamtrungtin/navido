import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { localSupabase } from '../helpers/local-supabase';
import manifest from '../../docs/menu-db-import-manifest.json';
const local = localSupabase();
const seed = readFileSync(
  'supabase/migrations/20261005000300_import_initial_menu.sql',
  'utf8',
);
function sql(input: string) {
  try {
    return execFileSync(
      'docker',
      [
        'exec',
        '-i',
        'supabase_db_navido-website',
        'psql',
        '-X',
        '-q',
        '-t',
        '-A',
        '-v',
        'ON_ERROR_STOP=1',
        '-U',
        'postgres',
        '-d',
        'postgres',
      ],
      { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] },
    );
  } catch {
    throw new Error('Local SQL verification failed.');
  }
}
describe('real menu import migration', () => {
  it('matches every source record and metadata field in the manifest', async () => {
    const categories = await local.admin.from('menu_categories').select('*');
    const items = await local.admin.from('menu_items').select('*');
    expect(categories.error).toBeNull();
    expect(items.error).toBeNull();
    expect(categories.data).toHaveLength(14);
    expect(items.data).toHaveLength(130);
    for (const item of manifest.items) {
      expect(items.data?.find((row) => row.id === item.id)).toMatchObject({
        category_id: item.categoryId,
        name_vi: item.name.vi,
        name_en: item.name.en,
        name_ko: item.name.ko,
        price_vnd: item.priceVnd,
        sort_order: item.sortOrder,
        publication_status: item.publicationStatus,
        source_row: item.sourceRow,
        source_name: item.sourceName,
        source_category_code: item.sourceCategoryCode,
        needs_review: item.needsReview,
        review_notes: item.reviewNotes,
        net_weight_gram: 'netWeightGram' in item ? item.netWeightGram : null,
      });
    }
    for (const category of manifest.categories)
      expect(
        categories.data?.find((row) => row.id === category.id),
      ).toMatchObject({
        name_vi: category.name.vi,
        name_en: category.name.en,
        name_ko: category.name.ko,
        sort_order: category.sortOrder,
        source_category_codes: category.sourceCategoryCodes,
      });
  });
  it('reruns without duplicating or overwriting changed data', () => {
    const payload = seed.replace(/^BEGIN;$/m, '').replace(/^COMMIT;$/m, '');
    const result = sql(
      `BEGIN; UPDATE public.menu_items SET price_vnd=61523,name_vi='Edited',category_id='coffee' WHERE id='row-2-signature';\n${payload}\n${payload}\nSELECT count(*) FROM public.menu_items; SELECT price_vnd FROM public.menu_items WHERE id='row-2-signature'; SELECT category_id FROM public.menu_items WHERE id='row-2-signature'; ROLLBACK;`,
    );
    expect(result.trim().split(/\r?\n/)).toEqual(['130', '61523', 'coffee']);
  });
  it('rolls back the entire transaction if an imported row violates constraints', async () => {
    expect(() =>
      sql(
        "BEGIN; INSERT INTO public.menu_categories(id,name_vi,sort_order) VALUES('atomic-test','Atomic',1); INSERT INTO public.menu_items(id,category_id,name_vi,price_vnd,sort_order) VALUES('atomic-item','missing','Bad',-1,1); COMMIT;",
      ),
    ).toThrow('Local SQL verification failed');
    expect(
      (
        await local.admin
          .from('menu_categories')
          .select('id')
          .eq('id', 'atomic-test')
      ).data,
    ).toEqual([]);
  });
});
