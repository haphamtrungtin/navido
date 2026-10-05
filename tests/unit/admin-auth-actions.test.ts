import { beforeEach, describe, expect, it, vi } from 'vitest';
const provider = vi.hoisted(() => ({
  signInError: null as { code: string } | null,
  signOutError: null as unknown,
  access: 'allowed',
  logoutScopes: [] as string[],
}));
vi.mock('@/lib/supabase/server', () => ({
  createActionSupabaseClient: async () => ({
    auth: {
      signInWithPassword: async () => ({ error: provider.signInError }),
      signOut: async ({ scope }: { scope: string }) => {
        provider.logoutScopes.push(scope);
        return { error: provider.signOutError };
      },
    },
  }),
}));
vi.mock('@/features/admin-auth/access', () => ({
  createAccessClient: (client: unknown) => client,
  resolveAdminAccess: async () => ({ status: provider.access }),
}));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
import { signInAdmin, signOutAdmin } from '@/features/admin-auth/actions';

function form() {
  const data = new FormData();
  data.set('email', 'owner@example.test');
  data.set('password', 'private-password');
  data.set('next', 'https://evil.test');
  return data;
}
describe('admin authentication actions', () => {
  beforeEach(() => {
    provider.signInError = null;
    provider.signOutError = null;
    provider.access = 'allowed';
    provider.logoutScopes = [];
  });
  it('rejects missing credentials and invalid passwords without exposing credentials', async () => {
    expect(await signInAdmin({ error: null }, new FormData())).toEqual({
      error: 'invalid_input',
    });
    provider.signInError = { code: 'invalid_credentials' };
    expect(await signInAdmin({ error: null }, form())).toEqual({
      error: 'invalid_credentials',
    });
  });
  it('always redirects successful login to admin', async () => {
    await expect(signInAdmin({ error: null }, form())).rejects.toThrow(
      'redirect:/admin',
    );
  });
  it.each(['forbidden', 'unavailable'])(
    'cleans up a rejected login: %s',
    async (access) => {
      provider.access = access;
      expect(await signInAdmin({ error: null }, form())).toEqual({
        error: access,
      });
      expect(provider.logoutScopes).toEqual(['local']);
    },
  );
  it('returns unavailable if rejected-login cleanup fails', async () => {
    provider.access = 'forbidden';
    provider.signOutError = new Error('offline');
    expect(await signInAdmin({ error: null }, form())).toEqual({
      error: 'unavailable',
    });
  });
  it('logs out only the current session even without active membership', async () => {
    provider.access = 'forbidden';
    await expect(signOutAdmin({ error: null }, new FormData())).rejects.toThrow(
      'redirect:/admin/login',
    );
    expect(provider.logoutScopes).toEqual(['local']);
  });
  it('never claims logout succeeded during provider failure', async () => {
    provider.signOutError = new Error('offline');
    expect(await signOutAdmin({ error: null }, new FormData())).toEqual({
      error: 'unavailable',
    });
  });
});
