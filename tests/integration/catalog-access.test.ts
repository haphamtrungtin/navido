import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';
import { localSupabase } from '../helpers/local-supabase';
const local = localSupabase();
const users: string[] = [];
const items: string[] = [];
const categories: string[] = [];
afterAll(async () => {
  for (const id of items) {
    await local.admin.from('menu_items').delete().eq('id', id);
    await local.admin.from('menu_audit_events').delete().eq('entity_id', id);
  }
  for (const id of categories) {
    await local.admin.from('menu_categories').delete().eq('id', id);
    await local.admin.from('menu_audit_events').delete().eq('entity_id', id);
  }
  for (const id of users) await local.admin.auth.admin.deleteUser(id);
});
describe('catalog Data API authorization and audit', () => {
  it('enforces owner/staff rights, optimistic updates and immediate revocation', async () => {
    const owner = await local.createUser('owner');
    users.push(owner.id);
    const staff = await local.createUser('staff');
    users.push(staff.id);
    const ownerClient = local.session().client;
    const staffClient = local.session().client;
    expect((await ownerClient.auth.signInWithPassword(owner)).error).toBeNull();
    expect((await staffClient.auth.signInWithPassword(staff)).error).toBeNull();
    const categoryId = randomUUID();
    categories.push(categoryId);
    expect(
      (
        await ownerClient.from('menu_categories').insert({
          id: categoryId,
          name_vi: 'Integration category',
          sort_order: 1,
        })
      ).error,
    ).toBeNull();
    const itemId = randomUUID();
    items.push(itemId);
    const inserted = await ownerClient
      .from('menu_items')
      .insert({
        id: itemId,
        category_id: categoryId,
        name_vi: 'Integration item',
        price_vnd: 50000,
        sort_order: 1,
        publication_status: 'published',
      })
      .select('*')
      .single();
    expect(inserted.error).toBeNull();
    expect(inserted.data?.version).toBe(1);
    expect(inserted.data?.updated_by).toBe(owner.id);
    const staffEdit = await staffClient
      .from('menu_items')
      .update({ price_vnd: 1 })
      .eq('id', itemId)
      .select('id');
    expect(staffEdit.data).toEqual([]);
    expect(
      (
        await staffClient
          .from('menu_items')
          .select('price_vnd')
          .eq('id', itemId)
          .single()
      ).data?.price_vnd,
    ).toBe(50000);
    expect(
      (
        await staffClient.rpc('set_menu_item_availability', {
          p_item_id: itemId,
          p_is_available: false,
          p_expected_version: 1,
        })
      ).data,
    ).toBe(2);
    const audit = await ownerClient
      .from('menu_audit_events')
      .select('*')
      .eq('entity_id', itemId)
      .order('id');
    expect(audit.data).toHaveLength(2);
    expect(audit.data?.[1]?.actor_id).toBe(staff.id);
    expect(
      (
        await staffClient
          .from('menu_audit_events')
          .select('*')
          .eq('entity_id', itemId)
      ).data,
    ).toEqual([]);
    const stale = await ownerClient
      .from('menu_items')
      .update({ price_vnd: 60000 })
      .eq('id', itemId)
      .eq('version', 1)
      .select('id');
    expect(stale.data).toEqual([]);
    const edited = await ownerClient
      .from('menu_items')
      .update({ price_vnd: 60000, publication_status: 'archived' })
      .eq('id', itemId)
      .eq('version', 2)
      .select('*')
      .single();
    expect(edited.data?.version).toBe(3);
    expect(edited.data?.publication_status).toBe('archived');
    expect(
      (await ownerClient.from('menu_items').delete().eq('id', itemId)).error
        ?.code,
    ).toBe('42501');
    expect(
      (
        await local.admin
          .from('admin_memberships')
          .update({ is_active: false })
          .eq('user_id', staff.id)
      ).error,
    ).toBeNull();
    expect(
      (await staffClient.from('menu_items').select('id').eq('id', itemId)).data,
    ).toEqual([]);
    expect(
      (
        await staffClient.rpc('set_menu_item_availability', {
          p_item_id: itemId,
          p_is_available: true,
          p_expected_version: 3,
        })
      ).error?.code,
    ).toBe('42501');
  });
  it('rejects public registration and anonymous catalog access', async () => {
    const { client } = local.session();
    const signup = await client.auth.signUp({
      email: `${randomUUID()}@navido.test`,
      password: randomUUID(),
    });
    expect(signup.error?.code).toBe('signup_disabled');
    expect((await client.from('menu_items').select('id')).error?.code).toBe(
      '42501',
    );
  });
});
