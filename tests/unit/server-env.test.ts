import { afterEach, describe, expect, it, vi } from 'vitest';

describe('Supabase runtime configuration', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('can be imported without Supabase configuration', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '');
    await expect(import('@/lib/server-env')).resolves.toBeDefined();
  });

  it('reads configuration lazily and never exposes secrets in errors', async () => {
    const { getSupabaseServerEnv } = await import('@/lib/server-env');
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'private-test-value');
    expect(() => getSupabaseServerEnv()).toThrow('Supabase is unavailable');
    try {
      getSupabaseServerEnv();
    } catch (error) {
      expect(String(error)).not.toContain('private-test-value');
    }
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    expect(getSupabaseServerEnv()).toEqual({
      url: 'https://example.supabase.co',
      publishableKey: 'private-test-value',
    });
  });

  it('rejects malformed URLs and missing keys', async () => {
    const { getSupabaseServerEnv } = await import('@/lib/server-env');
    vi.stubEnv('SUPABASE_URL', 'not-a-url');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', 'key');
    expect(() => getSupabaseServerEnv()).toThrow();
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_PUBLISHABLE_KEY', '');
    expect(() => getSupabaseServerEnv()).toThrow();
  });
});
