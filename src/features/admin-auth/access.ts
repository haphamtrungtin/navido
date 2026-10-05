import 'server-only';
import type { AdminAccess } from './types';
import { AdminAccessError } from './types';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

export interface AccessClient {
  auth: {
    getUser(): Promise<{
      data: { user: { id: string; email?: string } | null };
      error: { code?: string; status?: number; name?: string } | null;
    }>;
  };
  readMembership(userId: string): PromiseLike<{
    data: { role: string | null; is_active: boolean } | null;
    error: unknown;
  }>;
}

export function createAccessClient(
  client: SupabaseClient<Database>,
): AccessClient {
  return {
    auth: client.auth,
    readMembership: async (id) =>
      client
        .from('admin_memberships')
        .select('role,is_active')
        .eq('user_id', id)
        .maybeSingle(),
  };
}

export function isInvalidSession(error: {
  code?: string;
  status?: number;
  name?: string;
}): boolean {
  return (
    error.name === 'AuthSessionMissingError' ||
    [
      'bad_jwt',
      'session_not_found',
      'session_expired',
      'refresh_token_not_found',
      'refresh_token_already_used',
      'user_not_found',
    ].includes(error.code ?? '') ||
    error.status === 401 ||
    error.status === 403
  );
}

export async function getAdminAccess(): Promise<AdminAccess> {
  try {
    return await resolveAdminAccess(
      createAccessClient(await createServerSupabaseClient()),
    );
  } catch {
    return { status: 'unavailable' };
  }
}

export async function requireAdmin() {
  const access = await getAdminAccess();
  if (access.status !== 'allowed') throw new AdminAccessError(access.status);
  return access.actor;
}

export async function resolveAdminAccess(
  client: AccessClient,
): Promise<AdminAccess> {
  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();
    if (error)
      return {
        status: isInvalidSession(error) ? 'unauthenticated' : 'unavailable',
      };
    if (!user) return { status: 'unauthenticated' };
    const membership = await client.readMembership(user.id);
    if (membership.error) return { status: 'unavailable' };
    if (
      !membership.data?.is_active ||
      !['owner', 'staff'].includes(membership.data.role ?? '')
    )
      return { status: 'forbidden' };
    const role = membership.data.role;
    if (role !== 'owner' && role !== 'staff') return { status: 'forbidden' };
    return {
      status: 'allowed',
      actor: { userId: user.id, email: user.email ?? '', role },
    };
  } catch {
    return { status: 'unavailable' };
  }
}
