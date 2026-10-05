'use server';
import type { LoginState, LogoutState } from './types';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createActionSupabaseClient } from '@/lib/supabase/server';
import { createAccessClient, resolveAdminAccess } from './access';

const credentials = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(1024),
});

export async function signInAdmin(
  _state: LoginState,
  form: FormData,
): Promise<LoginState> {
  const parsed = credentials.safeParse({
    email: String(form.get('email') ?? '').trim(),
    password: form.get('password'),
  });
  if (!parsed.success) return { error: 'invalid_input' };
  try {
    const client = await createActionSupabaseClient();
    const { error } = await client.auth.signInWithPassword(parsed.data);
    if (error)
      return {
        error: [
          'invalid_credentials',
          'email_not_confirmed',
          'user_banned',
        ].includes(error.code ?? '')
          ? 'invalid_credentials'
          : 'unavailable',
      };
    const access = await resolveAdminAccess(createAccessClient(client));
    if (access.status !== 'allowed') {
      const cleanup = await client.auth.signOut({ scope: 'local' });
      return {
        error:
          cleanup.error || access.status !== 'forbidden'
            ? 'unavailable'
            : 'forbidden',
      };
    }
  } catch {
    return { error: 'unavailable' };
  }
  redirect('/admin');
}

export async function signOutAdmin(
  _state: LogoutState,
  _form: FormData,
): Promise<LogoutState> {
  void _state;
  void _form;
  try {
    const client = await createActionSupabaseClient();
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error) return { error: 'unavailable' };
  } catch {
    return { error: 'unavailable' };
  }
  redirect('/admin/login');
}
