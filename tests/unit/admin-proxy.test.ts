import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import type { CookieMethodsServer } from '@supabase/ssr';
const sdk = vi.hoisted(() => ({
  cookies: null as CookieMethodsServer | null,
  fail: false,
}));
vi.mock('next-intl/middleware', async () => {
  const { NextResponse } = await import('next/server');
  return {
    default: () => () => NextResponse.next({ headers: { 'x-intl': '1' } }),
  };
});
vi.mock('@supabase/ssr', () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: { cookies: CookieMethodsServer },
  ) => {
    sdk.cookies = options.cookies;
    return {
      auth: {
        getUser: async () => {
          sdk.cookies?.setAll?.(
            [
              {
                name: 'sb-test.0',
                value: 'part-a',
                options: { httpOnly: true, path: '/' },
              },
              {
                name: 'sb-test.1',
                value: 'part-b',
                options: { httpOnly: true, path: '/' },
              },
            ],
            {
              'Cache-Control': 'private, no-store',
              Expires: '0',
              Pragma: 'no-cache',
            },
          );
          if (sdk.fail) throw new Error('provider unavailable');
          return { data: { user: null }, error: null };
        },
      },
    };
  },
}));
import proxy, { config } from '../../proxy';

describe('admin proxy boundary', () => {
  beforeEach(() => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'test-key');
    sdk.cookies = null;
    sdk.fail = false;
  });
  it.each([
    '/admin',
    '/admin/login',
    '/admin/report.csv',
    '/api/admin/health',
    '/api/admin/report.csv',
  ])('matches and refreshes %s', async (path) => {
    expect(
      unstable_doesMiddlewareMatch({ config, nextConfig: {}, url: path }),
    ).toBe(true);
    const request = new NextRequest(`https://navido.test${path}`);
    const response = await proxy(request);
    expect(response.headers.get('location')).toBeNull();
    expect(response.cookies.get('sb-test.0')?.value).toBe('part-a');
    expect(response.cookies.get('sb-test.1')?.value).toBe('part-b');
    expect(request.cookies.get('sb-test.0')?.value).toBe('part-a');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('pragma')).toBe('no-cache');
    expect(response.headers.get('expires')).toBe('0');
  });
  it.each([
    '/administrator',
    '/api/admin-other',
    '/api/webhooks/test',
    '/vi/menu',
    '/en',
    '/ko/roastery',
  ])('does not initialize auth for %s', async (path) => {
    await proxy(new NextRequest(`https://navido.test${path}`));
    expect(sdk.cookies).toBeNull();
  });
  it('leaves outage decisions to guards and preserves refresh cookies', async () => {
    sdk.fail = true;
    const response = await proxy(
      new NextRequest('https://navido.test/api/admin/health'),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(response.cookies.get('sb-test.1')?.value).toBe('part-b');
  });
  it('does not require configuration for public locales', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '');
    const response = await proxy(
      new NextRequest('https://navido.test/vi/menu'),
    );
    expect(response.status).toBeLessThan(500);
    expect(sdk.cookies).toBeNull();
  });
});
