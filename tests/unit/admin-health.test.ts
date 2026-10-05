import { describe, expect, it, vi } from 'vitest';
const access = vi.hoisted(() => ({ status: 'allowed' }));
vi.mock('@/features/admin-auth/access', () => ({
  getAdminAccess: async () => access,
}));
import { GET } from '@/app/api/admin/health/route';
describe('private database health endpoint', () => {
  it.each([
    ['allowed', 200, 'ok'],
    ['unauthenticated', 401, 'unauthenticated'],
    ['forbidden', 403, 'forbidden'],
    ['unavailable', 503, 'unavailable'],
  ])('returns JSON for %s', async (status, code, body) => {
    access.status = String(status);
    const response = await GET();
    expect(response.status).toBe(code);
    expect(await response.json()).toEqual({ status: body });
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('location')).toBeNull();
  });
});
