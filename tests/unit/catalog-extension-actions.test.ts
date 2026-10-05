import { describe, expect, it, vi, beforeEach } from 'vitest';
import { saveItemExtensions } from '@/features/catalog/extensions/actions';
import { AdminAccessError } from '@/features/admin-auth/types';
const dep = vi.hoisted(() => ({ access: vi.fn(), rpc: vi.fn() }));
vi.mock('@/features/admin-auth/access', () => ({ requireAdmin: dep.access }));
vi.mock('@/lib/supabase/server', () => ({
  createActionSupabaseClient: async () => ({ rpc: dep.rpc }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
function input() {
  const f = new FormData();
  for (const [k, v] of Object.entries({
    id: 'one',
    expectedVersion: '3',
    descriptionVi: 'Draft',
    descriptionEn: '',
    descriptionKo: '',
    groups: '[]',
  }))
    f.set(k, v);
  return f;
}
describe('extension actions', () => {
  beforeEach(() => {
    dep.access.mockResolvedValue({ role: 'owner' });
    dep.rpc.mockReset();
  });
  it('retains the last saved draft version after a conflict', async () => {
    dep.rpc.mockResolvedValue({
      data: null,
      error: { code: 'P0001', message: 'catalog_conflict' },
    });
    expect(
      await saveItemExtensions({ error: null, savedVersion: 3 }, input()),
    ).toEqual({ error: 'conflict', savedVersion: 3 });
  });
  it('denies staff and unavailable membership before mutating', async () => {
    dep.access.mockResolvedValue({ role: 'staff' });
    expect((await saveItemExtensions({ error: null }, input())).error).toBe(
      'forbidden',
    );
    dep.access.mockRejectedValue(new AdminAccessError('unavailable'));
    expect((await saveItemExtensions({ error: null }, input())).error).toBe(
      'unavailable',
    );
    expect(dep.rpc).not.toHaveBeenCalled();
  });
});
