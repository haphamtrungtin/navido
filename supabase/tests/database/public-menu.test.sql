begin;
select plan(8);
insert into public.menu_items(id,category_id,name_vi,price_vnd,sort_order,publication_status,source_category_code)
values('public-mock-test','coffee','Mock',10,999,'published','MOCK_BEANS');
set local role anon;
select is(jsonb_array_length(public.get_published_menu()->'items'),127,'only real published rows');
select is(jsonb_array_length(public.get_published_menu()->'categories'),13,'only categories with public items');
select ok(not exists(select 1 from jsonb_array_elements(public.get_published_menu()->'items') i where i->>'id'='public-mock-test'),'published mock excluded');
select ok(not exists(select 1 from jsonb_array_elements(public.get_published_menu()->'items') i where i ? 'sourceRow' or i ? 'reviewNotes' or i ? 'updatedBy'),'private metadata excluded');
select throws_ok('select * from public.menu_items','42501',null,'anon cannot read raw items');
select throws_ok('select * from public.menu_categories','42501',null,'anon cannot read raw categories');
select throws_ok('select * from public.menu_audit_events','42501',null,'anon cannot read audit');
select throws_ok('select * from public.admin_memberships','42501',null,'anon cannot read memberships');
reset role;
select * from finish();
rollback;
