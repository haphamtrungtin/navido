-- Public access is a projection, never SELECT on internal catalog tables.
create function public.get_published_menu() returns jsonb
language sql stable security definer set search_path='' as $$
  with visible_items as (
    select * from public.menu_items
    where publication_status='published' and source_category_code is distinct from 'MOCK_BEANS'
  )
  select jsonb_build_object(
    'categories',coalesce((select jsonb_agg(jsonb_build_object(
      'id',c.id,'name',jsonb_build_object('vi',c.name_vi,'en',c.name_en,'ko',c.name_ko),'sortOrder',c.sort_order
    ) order by c.sort_order,c.id) from public.menu_categories c where exists(select 1 from visible_items i where i.category_id=c.id)),'[]'::jsonb),
    'items',coalesce((select jsonb_agg(jsonb_build_object(
      'id',i.id,'categoryId',i.category_id,'name',jsonb_build_object('vi',i.name_vi,'en',i.name_en,'ko',i.name_ko),
      'priceVnd',i.price_vnd,'sortOrder',i.sort_order,'isAvailable',i.is_available,'netWeightGram',i.net_weight_gram
    ) order by c.sort_order,c.id,i.sort_order,i.id) from visible_items i join public.menu_categories c on c.id=i.category_id),'[]'::jsonb)
  );
$$;
revoke all on function public.get_published_menu() from public,anon,authenticated;
grant execute on function public.get_published_menu() to anon,authenticated;
