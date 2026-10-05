begin;
create extension if not exists pgtap with schema extensions;
select plan(16);
insert into auth.users(id) values
  ('30000000-0000-0000-0000-000000000001'),
  ('30000000-0000-0000-0000-000000000002'),
  ('30000000-0000-0000-0000-000000000003'),
  ('30000000-0000-0000-0000-000000000004');
insert into public.admin_memberships(user_id,role,is_active) values
  ('30000000-0000-0000-0000-000000000001','owner',true),
  ('30000000-0000-0000-0000-000000000002','staff',true),
  ('30000000-0000-0000-0000-000000000003','owner',false);
insert into public.menu_categories(id,name_vi,sort_order) values ('boundary-category','Danh mục kiểm tra',1);
insert into public.menu_items(id,category_id,name_vi,price_vnd,sort_order) values ('boundary-item','boundary-category','Món kiểm tra',50000,1);
set local role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000001',true);
select throws_ok($$insert into public.menu_categories(id,name_vi,source_category_codes,sort_order) values ('forged-category','Giả',array['FORGED'],1)$$,'P0001','catalog_source_immutable','owner cannot forge category import metadata');
select throws_ok($$insert into public.menu_items(id,category_id,name_vi,price_vnd,sort_order,source_row) values ('forged-item','boundary-category','Giả',1,1,999)$$,'P0001','catalog_source_immutable','owner cannot forge item import metadata');
select throws_ok($$insert into public.menu_audit_events(entity_type,entity_id,operation,after_data) values ('item','boundary-item','insert','{}')$$,'42501',null,'owner cannot insert audit');
select throws_ok($$update public.menu_audit_events set actor_id=auth.uid()$$,'42501',null,'owner cannot rewrite audit');
select lives_ok($$update public.menu_items set version=999,updated_by='30000000-0000-0000-0000-000000000004',updated_at='2000-01-01' where id='boundary-item'$$,'DB owns version and actor on direct updates');
select is((select version from public.menu_items where id='boundary-item'),2,'forged version replaced by monotonic DB version');
select is((select updated_by::text from public.menu_items where id='boundary-item'),'30000000-0000-0000-0000-000000000001','forged actor replaced by caller');
select throws_ok($$update public.menu_categories set source_category_codes=array['FORGED'] where id='boundary-category'$$,'P0001','catalog_source_immutable','category source remains immutable');
select throws_ok($$update public.menu_items set created_at='2000-01-01' where id='boundary-item'$$,'P0001','catalog_source_immutable','creation timestamp remains immutable');
select throws_ok($$update public.menu_items set review_notes=array['FORGED'] where id='boundary-item'$$,'P0001','catalog_source_immutable','source review notes remain immutable');
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000002',true);
with changed as (update public.menu_categories set name_vi='Staff overwrite' where id='boundary-category' returning id)
select is((select count(*)::integer from changed),0,'staff cannot directly edit category');
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000004',true);
select is((select count(*)::integer from public.menu_categories),0,'user without membership cannot read categories');
select throws_ok($$select public.set_menu_item_availability('boundary-item',false,2)$$,'42501','catalog_forbidden','user without membership cannot mutate');
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000003',true);
select is((select count(*)::integer from public.menu_items),0,'inactive owner cannot read catalog');
select throws_ok($$select public.set_menu_item_availability('boundary-item',false,2)$$,'42501','catalog_forbidden','inactive owner cannot mutate');
set local role anon;
select throws_ok($$select * from public.menu_categories$$,'42501',null,'anonymous cannot read catalog');
select * from finish();
rollback;
