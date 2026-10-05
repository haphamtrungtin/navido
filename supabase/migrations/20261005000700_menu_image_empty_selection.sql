-- The Data API types do not express nullable SQL arguments. Empty selection
-- is the explicit client representation of removing an item image.
create or replace function public.set_menu_item_image(p_item_id text,p_expected_version integer,p_path text) returns integer language plpgsql security definer set search_path='' as $$
declare v integer; selected_path text := nullif(p_path,'');
begin
  perform private.require_catalog_owner();
  if p_expected_version is null or p_expected_version<1 or not private.menu_image_path_valid(selected_path) then raise exception 'catalog_invalid_input'; end if;
  update public.menu_items set image_path=selected_path where id=p_item_id and version=p_expected_version returning version into v;
  if v is null then
    if exists(select 1 from public.menu_items where id=p_item_id) then raise exception 'catalog_conflict'; else raise exception 'catalog_not_found'; end if;
  end if; return v;
end;
$$;
