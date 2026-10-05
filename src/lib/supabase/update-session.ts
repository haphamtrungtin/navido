import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerEnv } from '@/lib/server-env';
import type { Database } from './database.types';

export async function updateAdminSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  try {
    const { url, publishableKey } = getSupabaseServerEnv();
    const client = createServerClient<Database>(url, publishableKey, {
      cookieOptions: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookies, headers) {
          cookies.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          const previousCookies = response.cookies.getAll();
          const previousHeaders = new Headers(response.headers);
          response = NextResponse.next({ request });
          previousCookies.forEach((cookie) => response.cookies.set(cookie));
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          for (const header of [
            'cache-control',
            'expires',
            'pragma',
            'x-robots-tag',
          ]) {
            const value = previousHeaders.get(header);
            if (value) response.headers.set(header, value);
          }
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    });
    await client.auth.getUser();
  } catch {
    // The destination's guard distinguishes configuration/provider failure from a missing session.
  }
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
