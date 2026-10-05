import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { localSupabase } from '../helpers/local-supabase';
const local = localSupabase();
const owner = local.session();
const staff = local.session();
const ids: string[] = [];
const itemId = `image-${randomUUID()}`;
let key = '';
let bytes: Buffer;
describe('real Storage policies and image attachment', () => {
  beforeAll(async () => {
    for (const [role, session] of [
      ['owner', owner],
      ['staff', staff],
    ] as const) {
      const user = await local.createUser(role);
      ids.push(user.id);
      expect(
        (await session.client.auth.signInWithPassword(user)).error,
      ).toBeNull();
    }
    key = `${ids[0]}/${randomUUID()}.webp`;
    bytes = await sharp({
      create: { width: 5, height: 5, channels: 3, background: 'red' },
    })
      .webp()
      .toBuffer();
    expect(
      (
        await owner.client.from('menu_items').insert({
          id: itemId,
          category_id: 'coffee',
          name_vi: 'Ảnh test',
          price_vnd: 50000,
          sort_order: 1,
        })
      ).error,
    ).toBeNull();
  });
  afterAll(async () => {
    await local.admin.from('menu_items').delete().eq('id', itemId);
    if (key) await local.admin.storage.from('menu-images').remove([key]);
    for (const id of ids) await local.admin.auth.admin.deleteUser(id);
  });
  it('owner uploads an immutable image and attaches it by current item version', async () => {
    expect(
      (
        await owner.client.storage
          .from('menu-images')
          .upload(key, bytes, { contentType: 'image/webp', upsert: false })
      ).error,
    ).toBeNull();
    expect(
      (
        await owner.client.rpc('set_menu_item_image', {
          p_item_id: itemId,
          p_expected_version: 1,
          p_path: key,
        })
      ).data,
    ).toBe(2);
    expect(
      (
        await owner.client.storage
          .from('menu-images')
          .upload(key, bytes, { contentType: 'image/webp', upsert: true })
      ).error,
    ).not.toBeNull();
  });
  it('staff/anonymous/foreign folder uploads are denied and referenced images cannot be deleted', async () => {
    expect(
      (
        await staff.client.storage
          .from('menu-images')
          .upload(`${ids[1]}/${randomUUID()}.webp`, bytes, {
            contentType: 'image/webp',
          })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await local
          .session()
          .client.storage.from('menu-images')
          .upload(key, bytes, { contentType: 'image/webp' })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await owner.client.storage
          .from('menu-images')
          .upload(`${ids[1]}/${randomUUID()}.webp`, bytes, {
            contentType: 'image/webp',
          })
      ).error,
    ).not.toBeNull();
    await owner.client.storage.from('menu-images').remove([key]);
    const download = await local
      .session()
      .client.storage.from('menu-images')
      .download(key);
    expect(download.error).toBeNull();
    expect(download.data?.size).toBe(bytes.length);
  });
  it('revoked owner loses upload and attach access on the next API request', async () => {
    await local.admin
      .from('admin_memberships')
      .update({ is_active: false })
      .eq('user_id', ids[0]!);
    expect(
      (
        await owner.client.storage
          .from('menu-images')
          .upload(`${ids[0]}/${randomUUID()}.webp`, bytes, {
            contentType: 'image/webp',
          })
      ).error,
    ).not.toBeNull();
    expect(
      (
        await owner.client.rpc('set_menu_item_image', {
          p_item_id: itemId,
          p_expected_version: 2,
          p_path: key,
        })
      ).error?.code,
    ).toBe('42501');
  });
});
