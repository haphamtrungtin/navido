// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/menu-image/route';
const dep = vi.hoisted(() => ({ access: vi.fn(), upload: vi.fn() }));
vi.mock('@/features/catalog/extensions/mutation', () => ({
  requireOwner: dep.access,
  mutationError: (e: { code?: string }) => ({ error: e.code ?? 'unavailable' }),
}));
vi.mock('@/features/catalog/images/service', () => ({
  uploadAndAttachMenuImage: dep.upload,
}));
describe('bounded image route', () => {
  it('rejects cross origin and oversize bodies before decode/upload', async () => {
    dep.access.mockResolvedValue({});
    const cross = new NextRequest('https://navido.test/api/admin/menu-image', {
      method: 'POST',
      headers: { origin: 'https://evil.test' },
      body: 'bad',
    });
    expect((await POST(cross)).status).toBe(403);
    const large = new NextRequest('https://navido.test/api/admin/menu-image', {
      method: 'POST',
      headers: {
        origin: 'https://navido.test',
        'content-length': String(3 * 1024 * 1024 + 1),
      },
      body: 'bad',
    });
    expect((await POST(large)).status).toBe(400);
    expect(dep.upload).not.toHaveBeenCalled();
  });
  it('bounds actual streamed bytes when no content length exists', async () => {
    const request = new NextRequest(
      'https://navido.test/api/admin/menu-image',
      {
        method: 'POST',
        headers: { origin: 'https://navido.test' },
        body: new Uint8Array(3 * 1024 * 1024 + 1),
      },
    );
    expect((await POST(request)).status).toBe(400);
    expect(dep.upload).not.toHaveBeenCalled();
  });
});
