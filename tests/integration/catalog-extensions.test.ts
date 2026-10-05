import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { localSupabase } from '../helpers/local-supabase';
import { parsePublishedMenu } from '@/features/menu/domain/published-menu';
const local = localSupabase();
const owner = local.session();
const staff = local.session();
const itemId = `extensions-${randomUUID()}`;
const categoryId = `category-${randomUUID()}`;
const userIds: string[] = [];
const group = {
  id: 'size',
  name: { vi: 'Cỡ', en: '', ko: '' },
  minSelections: 1,
  maxSelections: 1,
  sortOrder: 0,
  active: true,
  choices: [
    {
      id: 'small',
      name: { vi: 'Nhỏ', en: '', ko: '' },
      priceVnd: 5000,
      sortOrder: 0,
      active: true,
    },
  ],
};
describe('real catalog extensions and public projection', () => {
  beforeAll(async () => {
    for (const [role, session] of [
      ['owner', owner],
      ['staff', staff],
    ] as const) {
      const user = await local.createUser(role);
      userIds.push(user.id);
      expect(
        (await session.client.auth.signInWithPassword(user)).error,
      ).toBeNull();
    }
    expect(
      (
        await owner.client
          .from('menu_categories')
          .insert({ id: categoryId, name_vi: 'Danh mục mới', sort_order: -100 })
      ).error,
    ).toBeNull();
    expect(
      (
        await owner.client.from('menu_items').insert({
          id: itemId,
          category_id: categoryId,
          name_vi: 'Món mới',
          price_vnd: 65000,
          sort_order: 0,
          publication_status: 'published',
        })
      ).error,
    ).toBeNull();
  });
  afterAll(async () => {
    await local.admin.from('menu_items').delete().eq('id', itemId);
    await local.admin.from('menu_categories').delete().eq('id', categoryId);
    for (const id of userIds) await local.admin.auth.admin.deleteUser(id);
  });
  it('owner saves full options atomically and public receives new category and item without private metadata', async () => {
    const saved = await owner.client.rpc('save_menu_item_extensions', {
      p_item_id: itemId,
      p_expected_version: 1,
      p_vi: 'Mô tả mới',
      p_en: '',
      p_ko: '',
      p_groups: [group],
    });
    expect(saved.error).toBeNull();
    expect(saved.data).toBe(2);
    const result = await local.session().client.rpc('get_published_menu');
    expect(result.error).toBeNull();
    const menu = parsePublishedMenu(result.data);
    expect(menu.categories[0]?.id).toBe(categoryId);
    expect(menu.items.find((i) => i.id === itemId)).toMatchObject({
      priceVnd: 65000,
      description: { en: 'Mô tả mới' },
      optionGroups: [{ choices: [{ priceVnd: 5000 }] }],
    });
    const raw = JSON.stringify(result.data);
    expect(raw).not.toContain('sourceRow');
    expect(raw).not.toContain('updatedBy');
  });
  it('invalid choices and stale versions preserve prior data', async () => {
    const invalid = await owner.client.rpc('save_menu_item_extensions', {
      p_item_id: itemId,
      p_expected_version: 2,
      p_vi: 'Wrong',
      p_en: '',
      p_ko: '',
      p_groups: [{ ...group, choices: [] }],
    });
    expect(invalid.error?.message).toBe('catalog_invalid_input');
    const stale = await owner.client.rpc('save_menu_item_extensions', {
      p_item_id: itemId,
      p_expected_version: 1,
      p_vi: 'Wrong',
      p_en: '',
      p_ko: '',
      p_groups: [],
    });
    expect(stale.error?.message).toBe('catalog_conflict');
    const item = await owner.client
      .from('menu_items')
      .select('description_vi,version')
      .eq('id', itemId)
      .single();
    expect(item.data).toEqual({ description_vi: 'Mô tả mới', version: 2 });
  });
  it('staff and revoked owner cannot mutate content even through direct RPC', async () => {
    const input = {
      p_item_id: itemId,
      p_expected_version: 2,
      p_vi: 'Wrong',
      p_en: '',
      p_ko: '',
      p_groups: [],
    };
    expect(
      (await staff.client.rpc('save_menu_item_extensions', input)).error?.code,
    ).toBe('42501');
    await local.admin
      .from('admin_memberships')
      .update({ is_active: false })
      .eq('user_id', userIds[0]!);
    expect(
      (await owner.client.rpc('save_menu_item_extensions', input)).error?.code,
    ).toBe('42501');
  });
});
