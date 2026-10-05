begin;
create extension if not exists pgtap with schema extensions;
select plan(9);
insert into auth.users (id) values
  ('10000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000003');
insert into public.admin_memberships (user_id, role, is_active) values
  ('10000000-0000-0000-0000-000000000001', 'owner', true),
  ('10000000-0000-0000-0000-000000000002', 'staff', true),
  ('10000000-0000-0000-0000-000000000003', 'staff', false);
select throws_ok($$update public.admin_memberships set role = null$$, '23502', null, 'role cannot be null');
select throws_ok($$update public.admin_memberships set role = 'superadmin'$$, '23514', null, 'role is constrained');
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
select is((select count(*)::integer from public.admin_memberships), 1, 'only own membership visible');
select is((select count(*)::integer from public.admin_memberships where user_id = '10000000-0000-0000-0000-000000000002'), 0, 'cannot read another user');
select throws_ok($$insert into public.admin_memberships(user_id, role) values (auth.uid(), 'owner')$$, '42501', null, 'cannot insert membership');
select throws_ok($$update public.admin_memberships set is_active = true$$, '42501', null, 'cannot update membership');
select throws_ok($$delete from public.admin_memberships$$, '42501', null, 'cannot delete membership');
select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000003', true);
select throws_ok($$update public.admin_memberships set is_active = true$$, '42501', null, 'inactive cannot reactivate');
set local role anon;
select throws_ok($$select * from public.admin_memberships$$, '42501', null, 'anon cannot read');
select * from finish();
rollback;
