import { describe, expect, it } from 'vitest';
import { resolveAdminAccess } from '@/features/admin-auth/access';

function client(
  user: { id: string; email?: string } | null,
  membership: { role: string | null; is_active: boolean } | null,
  authError: { code?: string; status?: number } | null = null,
  dbError: unknown = null,
) {
  return {
    auth: { getUser: async () => ({ data: { user }, error: authError }) },
    readMembership: async () => ({ data: membership, error: dbError }),
  };
}

describe('verified admin access', () => {
  it('allows only a verified user with an active known role', async () => {
    expect(
      await resolveAdminAccess(
        client(
          { id: 'a', email: 'a@example.test' },
          { role: 'owner', is_active: true },
        ),
      ),
    ).toEqual({
      status: 'allowed',
      actor: { userId: 'a', email: 'a@example.test', role: 'owner' },
    });
  });
  it.each([
    null,
    { role: 'staff', is_active: false },
    { role: null, is_active: true },
    { role: 'superadmin', is_active: true },
  ])(
    'rejects missing, inactive or invalid membership %j',
    async (membership) => {
      expect(await resolveAdminAccess(client({ id: 'a' }, membership))).toEqual(
        { status: 'forbidden' },
      );
    },
  );
  it('denies missing and forged sessions but distinguishes infrastructure failure', async () => {
    expect(await resolveAdminAccess(client(null, null))).toEqual({
      status: 'unauthenticated',
    });
    expect(
      await resolveAdminAccess(
        client(null, null, { code: 'bad_jwt', status: 403 }),
      ),
    ).toEqual({ status: 'unauthenticated' });
    expect(
      await resolveAdminAccess(client(null, null, { status: 503 })),
    ).toEqual({ status: 'unavailable' });
    expect(
      await resolveAdminAccess(
        client({ id: 'a' }, null, null, { message: 'offline' }),
      ),
    ).toEqual({ status: 'unavailable' });
  });
});
