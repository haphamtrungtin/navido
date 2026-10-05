import { beforeEach, describe, expect, it, vi } from 'vitest';
const store = vi.hoisted(() => ({
  role: 'owner',
  result: {
    data: { id: 'item' } as { id: string } | null,
    error: null as { code: string; message: string } | null,
  },
  payload: null as unknown,
  version: null as unknown,
  existing: true,
}));
vi.mock('@/features/admin-auth/access', () => ({
  requireAdmin: async () => ({ role: store.role }),
}));
vi.mock('@/lib/supabase/server', () => ({
  createActionSupabaseClient: async () => ({
    from: () => {
      let reading = true;
      const query = {
        insert: (payload: unknown) => {
          store.payload = payload;
          reading = false;
          return query;
        },
        update: (payload: unknown) => {
          store.payload = payload;
          reading = false;
          return query;
        },
        eq: (key: string, value: unknown) => {
          if (key === 'version') store.version = value;
          return query;
        },
        select: () => query,
        maybeSingle: async () =>
          reading
            ? { data: store.existing ? { id: 'item' } : null, error: null }
            : store.result,
      };
      return query;
    },
    rpc: async () => store.result,
  }),
}));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
vi.mock('next/cache', () => ({ revalidatePath: () => {} }));
import {
  saveMenuItem,
  saveMenuCategory,
  setMenuAvailability,
} from '@/features/catalog/actions';
function form() {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    id: 'item',
    expectedVersion: '3',
    nameVi: 'Cà phê',
    nameEn: '',
    nameKo: '',
    categoryId: 'coffee',
    priceVnd: '50000',
    sortOrder: '1',
    publicationStatus: 'draft',
    isAvailable: 'on',
    needsReview: '',
    netWeightGram: '',
    updatedBy: 'spoofed',
    sourceRow: '99',
  }))
    form.set(key, value);
  return form;
}
describe('catalog server mutations', () => {
  beforeEach(() => {
    store.role = 'owner';
    store.result = { data: { id: 'item' }, error: null };
    store.payload = null;
    store.version = null;
    store.existing = true;
  });
  it('updates with an expected version and excludes injected metadata', async () => {
    await expect(saveMenuItem({ error: null }, form())).rejects.toThrow(
      'redirect:/admin/menu',
    );
    expect(store.version).toBe(3);
    expect(store.payload).toMatchObject({
      name_vi: 'Cà phê',
      price_vnd: 50000,
    });
    expect(store.payload).not.toHaveProperty('updated_by');
    expect(store.payload).not.toHaveProperty('source_row');
  });
  it.each([saveMenuItem, saveMenuCategory])(
    'staff cannot mutate owner fields',
    async (action) => {
      store.role = 'staff';
      expect(await action({ error: null }, form())).toEqual({
        error: 'forbidden',
      });
      expect(store.payload).toBeNull();
    },
  );
  it('does not report a stale update as successful', async () => {
    store.result.data = null;
    expect(await saveMenuItem({ error: null }, form())).toEqual({
      error: 'conflict',
    });
    store.existing = false;
    expect(await saveMenuItem({ error: null }, form())).toEqual({
      error: 'not_found',
    });
  });
  it('maps DB and RPC failures to safe errors', async () => {
    store.result.error = { code: '42501', message: 'private detail' };
    expect(await saveMenuItem({ error: null }, form())).toEqual({
      error: 'forbidden',
    });
    store.result.error = { code: 'P0001', message: 'catalog_conflict' };
    expect(await setMenuAvailability({ error: null }, form())).toEqual({
      error: 'conflict',
    });
  });
  it('rejects empty price and missing update version', async () => {
    const empty = form();
    empty.set('priceVnd', '');
    expect((await saveMenuItem({ error: null }, empty)).error).toBe(
      'invalid_input',
    );
    const version = form();
    version.delete('expectedVersion');
    expect((await saveMenuItem({ error: null }, version)).error).toBe(
      'invalid_input',
    );
  });
});
