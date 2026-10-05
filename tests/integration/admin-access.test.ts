import { afterAll, describe, expect, it } from 'vitest';
import {
  createAccessClient,
  resolveAdminAccess,
} from '@/features/admin-auth/access';
import { assertLocalUrl, localSupabase } from '../helpers/local-supabase';

describe('real local Auth and membership', () => {
  const local = localSupabase();
  const ids: string[] = [];
  afterAll(async () => {
    for (const id of ids) await local.admin.auth.admin.deleteUser(id);
  });
  it('rejects any remote target before accessing credentials', () => {
    expect(() => assertLocalUrl('https://production.supabase.co')).toThrow();
    expect(() => assertLocalUrl('http://127.0.0.1:54321')).toThrow();
  });
  it('revokes menu access on the next request without waiting for session expiry', async () => {
    const user = await local.createUser('owner');
    ids.push(user.id);
    const { client } = local.session();
    expect((await client.auth.signInWithPassword(user)).error).toBeNull();
    expect((await resolveAdminAccess(createAccessClient(client))).status).toBe(
      'allowed',
    );
    expect(
      (
        await local.admin
          .from('admin_memberships')
          .update({ is_active: false })
          .eq('user_id', user.id)
      ).error,
    ).toBeNull();
    expect((await resolveAdminAccess(createAccessClient(client))).status).toBe(
      'forbidden',
    );
  });
  it('never grants an Auth-only user administrative access', async () => {
    const user = await local.createUser();
    ids.push(user.id);
    const { client } = local.session();
    expect((await client.auth.signInWithPassword(user)).error).toBeNull();
    expect((await resolveAdminAccess(createAccessClient(client))).status).toBe(
      'forbidden',
    );
  });
  it('local logout preserves other sessions and denies a revoked token', async () => {
    const user = await local.createUser('staff');
    ids.push(user.id);
    const first = local.session();
    const second = local.session();
    expect((await first.client.auth.signInWithPassword(user)).error).toBeNull();
    expect(
      (await second.client.auth.signInWithPassword(user)).error,
    ).toBeNull();
    const token = (await first.client.auth.getSession()).data.session
      ?.access_token;
    expect(
      (await first.client.auth.signOut({ scope: 'local' })).error,
    ).toBeNull();
    expect(
      (await resolveAdminAccess(createAccessClient(second.client))).status,
    ).toBe('allowed');
    expect((await first.client.auth.getUser(token)).error).not.toBeNull();
  });
});
