// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import sharp from 'sharp';
import { uploadAndAttachMenuImage } from '@/features/catalog/images/service';
const dep = vi.hoisted(() => ({
  access: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock('@/features/admin-auth/access', () => ({ requireAdmin: dep.access }));
vi.mock('@/lib/supabase/server', () => ({
  createActionSupabaseClient: async () => ({
    rpc: dep.rpc,
    storage: { from: () => ({ upload: dep.upload, remove: dep.remove }) },
  }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
const uid = '40000000-0000-0000-0000-000000000001';
describe('menu image upload transaction boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dep.access.mockResolvedValue({ role: 'owner', userId: uid });
    dep.upload.mockResolvedValue({ error: null });
    dep.remove.mockResolvedValue({ error: null });
    dep.rpc.mockResolvedValue({ error: null, data: 2 });
  });
  it('normalizes before storage and cleans the new object on attach conflict', async () => {
    dep.rpc.mockResolvedValue({
      data: null,
      error: { code: 'P0001', message: 'catalog_conflict' },
    });
    const input = await sharp({
      create: { width: 5, height: 5, channels: 3, background: 'red' },
    })
      .png()
      .toBuffer();
    await expect(
      uploadAndAttachMenuImage({
        itemId: 'item',
        expectedVersion: 1,
        bytes: input,
        mime: 'image/png',
      }),
    ).rejects.toMatchObject({ code: 'conflict' });
    expect(dep.upload).toHaveBeenCalledTimes(1);
    const [key, bytes, options] = dep.upload.mock.calls[0]!;
    expect(key).toMatch(new RegExp(`^${uid}/[a-f0-9-]+\\.webp$`));
    expect((await sharp(bytes).metadata()).format).toBe('webp');
    expect(options).toMatchObject({ upsert: false, contentType: 'image/webp' });
    expect(dep.remove).toHaveBeenCalledWith([key]);
  });
  it('denies staff and bad identifiers before uploading', async () => {
    dep.access.mockResolvedValue({ role: 'staff', userId: uid });
    await expect(
      uploadAndAttachMenuImage({
        itemId: 'item',
        expectedVersion: 1,
        bytes: Buffer.from('bad'),
        mime: 'image/png',
      }),
    ).rejects.toMatchObject({ code: 'forbidden' });
    dep.access.mockResolvedValue({ role: 'owner', userId: uid });
    await expect(
      uploadAndAttachMenuImage({
        itemId: '',
        expectedVersion: 0,
        bytes: Buffer.from('bad'),
        mime: 'image/png',
      }),
    ).rejects.toMatchObject({ code: 'invalid_input' });
    expect(dep.upload).not.toHaveBeenCalled();
  });
  it('keeps uploaded data on successful attachment', async () => {
    const input = await sharp({
      create: { width: 5, height: 5, channels: 3, background: 'red' },
    })
      .png()
      .toBuffer();
    expect(
      await uploadAndAttachMenuImage({
        itemId: 'item',
        expectedVersion: 1,
        bytes: input,
        mime: 'image/png',
      }),
    ).toMatchObject({ version: 2 });
    expect(dep.remove).not.toHaveBeenCalled();
  });
});
