import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerEnv } from '@/lib/server-env';
import type { Database } from './database.types';

export function createPublicSupabaseClient() {
  const { url, publishableKey } = getSupabaseServerEnv();
  return createClient<Database>(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
