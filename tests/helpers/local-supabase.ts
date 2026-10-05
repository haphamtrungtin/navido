import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/database.types';

export function assertLocalUrl(value: string) {
  const url = new URL(value);
  if (
    url.protocol !== 'http:' ||
    !['127.0.0.1', 'localhost'].includes(url.hostname) ||
    url.port !== '55321' ||
    url.username ||
    url.password ||
    url.pathname !== '/'
  )
    throw new Error(
      'Integration tests require the isolated local Supabase API on port 55321.',
    );
}

export function localSupabase() {
  if (process.env.SUPABASE_URL) assertLocalUrl(process.env.SUPABASE_URL);
  const cli = fileURLToPath(
    new URL('../../node_modules/supabase/dist/supabase.js', import.meta.url),
  );
  let status: Record<string, string>;
  try {
    status = JSON.parse(
      execFileSync(process.execPath, [cli, 'status', '-o', 'json'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
    );
  } catch {
    throw new Error(
      'Start the isolated local Supabase stack before running integration tests.',
    );
  }
  const url = status.API_URL ?? status.api_url;
  const key = status.ANON_KEY ?? status.anon_key;
  const adminKey = status.SERVICE_ROLE_KEY ?? status.service_role_key;
  if (!url || !key || !adminKey)
    throw new Error('Local Supabase credentials unavailable.');
  assertLocalUrl(url);
  const admin = createClient<Database>(url, adminKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return {
    admin,
    async createUser(role?: 'owner' | 'staff') {
      const email = `${randomUUID()}@navido.test`;
      const password = randomUUID();
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (created.error || !created.data.user)
        throw new Error('Could not create local Auth fixture.');
      const id = created.data.user.id;
      if (role) {
        const membership = await admin
          .from('admin_memberships')
          .insert({ user_id: id, role, is_active: true });
        if (membership.error) {
          await admin.auth.admin.deleteUser(id);
          throw new Error('Could not create local membership fixture.');
        }
      }
      return { id, email, password };
    },
    session() {
      const jar = new Map<string, string>();
      const client = createServerClient<Database>(url, key, {
        cookies: {
          getAll: () => [...jar].map(([name, value]) => ({ name, value })),
          setAll: (values) =>
            values.forEach(({ name, value }) =>
              value ? jar.set(name, value) : jar.delete(name),
            ),
        },
      });
      return { client, jar };
    },
  };
}
