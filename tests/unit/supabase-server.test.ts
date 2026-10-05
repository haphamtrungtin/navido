import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CookieMethodsServer } from '@supabase/ssr';
const state = vi.hoisted(() => ({
  cookies: null as CookieMethodsServer | null,
  written: [] as string[],
  writable: true,
}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    getAll: () => [{ name: 'session', value: 'old' }],
    set: (name: string) => {
      if (!state.writable) throw new Error('cookie write denied');
      state.written.push(name);
    },
  }),
}));
vi.mock('@supabase/ssr', () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: { cookies: CookieMethodsServer },
  ) => {
    state.cookies = options.cookies;
    return {};
  },
}));
import {
  createActionSupabaseClient,
  createServerSupabaseClient,
} from '@/lib/supabase/server';
describe('request-scoped server client cookie boundary', () => {
  beforeEach(() => {
    vi.stubEnv('SUPABASE_URL', 'http://127.0.0.1:55321');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'test');
    state.writable = true;
    state.written = [];
  });
  it('keeps rendering read-only and supplies incoming cookies', async () => {
    await createServerSupabaseClient();
    expect(await state.cookies?.getAll()).toEqual([
      { name: 'session', value: 'old' },
    ]);
    await state.cookies?.setAll?.(
      [{ name: 'session', value: 'refreshed', options: {} }],
      {},
    );
    expect(state.written).toEqual([]);
  });
  it('persists action cookies and propagates failed writes', async () => {
    await createActionSupabaseClient();
    await state.cookies?.setAll?.(
      [{ name: 'session', value: 'refreshed', options: {} }],
      {},
    );
    expect(state.written).toEqual(['session']);
    state.writable = false;
    expect(() =>
      state.cookies?.setAll?.(
        [{ name: 'session', value: '', options: {} }],
        {},
      ),
    ).toThrow('cookie write denied');
  });
});
