import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseServerEnv } from '@/lib/server-env';
import type { Database } from './database.types';

async function createClient(writable: boolean) {
  const { url, publishableKey } = getSupabaseServerEnv();
  const store = await cookies();
  return createServerClient<Database>(url, publishableKey, {
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        if (writable)
          values.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        // Read-only renders rely on proxy to persist refreshes. Never suppress a write error in actions.
      },
    },
  });
}

export async function createServerSupabaseClient() {
  return createClient(false);
}
export async function createActionSupabaseClient() {
  return createClient(true);
}
