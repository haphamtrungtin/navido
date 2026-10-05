create function private.valid_option_groups(groups jsonb) returns boolean language plpgsql immutable set search_path='' as $$
declare g jsonb; c jsonb; active_count integer; ids text[] := '{}'; choice_ids text[];
begin
  if groups is null or jsonb_typeof(groups)<>'array' or jsonb_array_length(groups)>10 then return false; end if;
  for g in select value from jsonb_array_elements(groups) loop
    if jsonb_typeof(g)<>'object' or not (g ?& array['id','name','minSelections','maxSelections','sortOrder','active','choices']) or (g - array['id','name','minSelections','maxSelections','sortOrder','active','choices'])<>'{}'::jsonb
      or jsonb_typeof(g->'id')<>'string' or (g->>'id') !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$' or g->>'id'=any(ids)
      or not private.valid_option_name(g->'name')
      or jsonb_typeof(g->'active')<>'boolean' or jsonb_typeof(g->'choices')<>'array' or jsonb_array_length(g->'choices')>20
      or jsonb_typeof(g->'minSelections')<>'number' or (g->>'minSelections') !~ '^[0-9]+$' or (g->>'minSelections')::numeric>20
      or jsonb_typeof(g->'maxSelections')<>'number' or (g->>'maxSelections') !~ '^[0-9]+$' or (g->>'maxSelections')::numeric not between 1 and 20
      or (g->>'minSelections')::integer>(g->>'maxSelections')::integer
      or jsonb_typeof(g->'sortOrder')<>'number' or (g->>'sortOrder') !~ '^-?[0-9]+$' or (g->>'sortOrder')::numeric not between -2147483648 and 2147483647
    then return false; end if;
    ids := array_append(ids,g->>'id'); active_count := 0; choice_ids := '{}';
    for c in select value from jsonb_array_elements(g->'choices') loop
      if jsonb_typeof(c)<>'object' or not(c ?& array['id','name','priceVnd','sortOrder','active']) or (c - array['id','name','priceVnd','sortOrder','active'])<>'{}'::jsonb
        or jsonb_typeof(c->'id')<>'string' or (c->>'id') !~ '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$' or c->>'id'=any(choice_ids)
        or not private.valid_option_name(c->'name') or jsonb_typeof(c->'active')<>'boolean'
        or jsonb_typeof(c->'priceVnd')<>'number' or (c->>'priceVnd') !~ '^[0-9]+$' or (c->>'priceVnd')::numeric not between 0 and 2147483647
        or jsonb_typeof(c->'sortOrder')<>'number' or (c->>'sortOrder') !~ '^-?[0-9]+$' or (c->>'sortOrder')::numeric not between -2147483648 and 2147483647
      then return false; end if;
      choice_ids := array_append(choice_ids,c->>'id');
      if (c->>'active')::boolean then active_count := active_count+1; end if;
    end loop;
    if (g->>'active')::boolean and (g->>'maxSelections')::integer>active_count then return false; end if;
  end loop;
  return true;
exception when others then return false;
end;
$$;
-- Helper is created before validators are first executed (PL/pgSQL resolves calls at execution).
create function private.valid_option_name(n jsonb) returns boolean language sql immutable set search_path='' as $$
  select coalesce(jsonb_typeof(n)='object' and n ?& array['vi','en','ko'] and (n-array['vi','en','ko'])='{}'::jsonb
    and jsonb_typeof(n->'vi')='string' and length(btrim(n->>'vi')) between 1 and 300
    and jsonb_typeof(n->'en')='string' and length(n->>'en')<=300
    and jsonb_typeof(n->'ko')='string' and length(n->>'ko')<=300,false);
$$;
revoke all on function private.valid_option_groups(jsonb),private.valid_option_name(jsonb) from public,anon;
grant usage on schema private to authenticated;
grant execute on function private.valid_option_groups(jsonb),private.valid_option_name(jsonb) to authenticated;

alter table public.menu_items
  add column description_vi text not null default '' check(length(description_vi)<=4000),
  add column description_en text not null default '' check(length(description_en)<=4000),
  add column description_ko text not null default '' check(length(description_ko)<=4000),
  add column option_groups jsonb not null default '[]'::jsonb check(private.valid_option_groups(option_groups));

create function private.require_catalog_owner() returns void language plpgsql stable security definer set search_path='' as $$
begin
  if auth.uid() is null or not exists(select 1 from public.admin_memberships where user_id=auth.uid() and is_active and role='owner') then raise exception using errcode='42501',message='catalog_forbidden'; end if;
end;
$$;
revoke all on function private.require_catalog_owner() from public,anon,authenticated;
create function public.save_menu_item_extensions(p_item_id text,p_expected_version integer,p_vi text,p_en text,p_ko text,p_groups jsonb) returns integer
language plpgsql security definer set search_path='' as $$
declare v integer;
begin
  perform private.require_catalog_owner();
  if p_expected_version is null or p_expected_version<1 or p_vi is null or p_en is null or p_ko is null or greatest(length(p_vi),length(p_en),length(p_ko))>4000 or not private.valid_option_groups(p_groups) then raise exception 'catalog_invalid_input'; end if;
  update public.menu_items set description_vi=p_vi,description_en=p_en,description_ko=p_ko,option_groups=p_groups where id=p_item_id and version=p_expected_version returning version into v;
  if v is null then
    if exists(select 1 from public.menu_items where id=p_item_id) then raise exception 'catalog_conflict'; else raise exception 'catalog_not_found'; end if;
  end if;
  return v;
end;
$$;
revoke all on function public.save_menu_item_extensions(text,integer,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.save_menu_item_extensions(text,integer,text,text,text,jsonb) to authenticated;

create function private.valid_order_days(days jsonb,prep integer) returns boolean language plpgsql immutable set search_path='' as $$
declare d jsonb; ids integer[] := '{}'; start_min integer; last_min integer; end_min integer;
begin
  if days is null or prep is null or prep not between 1 and 180 or jsonb_typeof(days)<>'array' or jsonb_array_length(days)<>7 then return false; end if;
  for d in select value from jsonb_array_elements(days) loop
    if jsonb_typeof(d)<>'object' or not(d ?& array['day','enabled','start','lastOrder','end']) or (d-array['day','enabled','start','lastOrder','end'])<>'{}'::jsonb
      or jsonb_typeof(d->'day')<>'number' or (d->>'day') !~ '^[0-6]$' or (d->>'day')::integer=any(ids)
      or jsonb_typeof(d->'enabled')<>'boolean' or jsonb_typeof(d->'start')<>'string' or jsonb_typeof(d->'lastOrder')<>'string' or jsonb_typeof(d->'end')<>'string'
      or (d->>'start') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or (d->>'lastOrder') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$' or (d->>'end') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
    then return false; end if;
    ids := array_append(ids,(d->>'day')::integer);
    start_min := split_part(d->>'start',':',1)::integer*60+split_part(d->>'start',':',2)::integer;
    last_min := split_part(d->>'lastOrder',':',1)::integer*60+split_part(d->>'lastOrder',':',2)::integer;
    end_min := split_part(d->>'end',':',1)::integer*60+split_part(d->>'end',':',2)::integer;
    if (d->>'enabled')::boolean and (start_min>=last_min or last_min+prep>end_min) then return false; end if;
  end loop;
  return true;
exception when others then return false;
end;
$$;
revoke all on function private.valid_order_days(jsonb,integer) from public,anon;
grant execute on function private.valid_order_days(jsonb,integer) to authenticated;
create table public.store_order_settings (
  id text primary key default 'store' check(id='store'), timezone text not null default 'Asia/Ho_Chi_Minh' check(timezone='Asia/Ho_Chi_Minh'),
  preparation_minutes integer not null default 20 check(preparation_minutes between 1 and 180), paused boolean not null default true,
  days jsonb not null check(private.valid_order_days(days,preparation_minutes)), version integer not null default 1 check(version>0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), updated_by uuid references auth.users(id) on delete set null
);
alter table public.store_order_settings enable row level security;
revoke all on public.store_order_settings from anon,authenticated;
grant select,update on public.store_order_settings to authenticated;
grant all on public.store_order_settings to service_role;
create policy admin_order_settings_read on public.store_order_settings for select to authenticated using(exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role in ('owner','staff')));
create policy owner_order_settings_update on public.store_order_settings for update to authenticated using(exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role='owner')) with check(exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role='owner'));
insert into public.store_order_settings(id,days) select 'store',jsonb_agg(jsonb_build_object('day',d,'enabled',false,'start','07:00','lastOrder','21:30','end','22:00') order by d) from generate_series(0,6) d;
alter table public.menu_audit_events drop constraint menu_audit_events_entity_type_check;
alter table public.menu_audit_events add constraint menu_audit_events_entity_type_check check(entity_type in ('category','item','settings'));
create function private.stamp_order_settings() returns trigger language plpgsql set search_path='' as $$
begin
  if new.id is distinct from old.id or new.created_at is distinct from old.created_at then raise exception 'catalog_source_immutable'; end if;
  new.version:=old.version+1; new.updated_at:=now(); new.updated_by:=auth.uid(); return new;
end;
$$;
create or replace function private.audit_catalog_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.menu_audit_events(entity_type,entity_id,operation,actor_id,before_data,after_data)
  values(case TG_TABLE_NAME when 'menu_items' then 'item' when 'store_order_settings' then 'settings' else 'category' end,new.id,lower(TG_OP),auth.uid(),case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
  return new;
end;
$$;
revoke all on function private.stamp_order_settings() from public,anon,authenticated;
create trigger stamp_order_settings before update on public.store_order_settings for each row execute function private.stamp_order_settings();
create trigger audit_order_settings after update on public.store_order_settings for each row execute function private.audit_catalog_change();
create function public.save_order_settings(p_expected_version integer,p_preparation_minutes integer,p_paused boolean,p_days jsonb) returns integer language plpgsql security definer set search_path='' as $$
declare v integer;
begin
  perform private.require_catalog_owner();
  if p_expected_version is null or p_expected_version<1 or p_paused is null or not private.valid_order_days(p_days,p_preparation_minutes) then raise exception 'catalog_invalid_input'; end if;
  update public.store_order_settings set preparation_minutes=p_preparation_minutes,paused=p_paused,days=p_days where id='store' and version=p_expected_version returning version into v;
  if v is null then raise exception 'catalog_conflict'; end if; return v;
end;
$$;
create function public.set_orders_paused(p_paused boolean,p_expected_version integer) returns integer language plpgsql security definer set search_path='' as $$
declare v integer;
begin
  if auth.uid() is null or not exists(select 1 from public.admin_memberships where user_id=auth.uid() and is_active and role in('owner','staff')) then raise exception using errcode='42501',message='catalog_forbidden'; end if;
  if p_expected_version is null or p_expected_version<1 or p_paused is null then raise exception 'catalog_invalid_input'; end if;
  update public.store_order_settings set paused=p_paused where id='store' and version=p_expected_version returning version into v;
  if v is null then raise exception 'catalog_conflict'; end if; return v;
end;
$$;
revoke all on function public.save_order_settings(integer,integer,boolean,jsonb),public.set_orders_paused(boolean,integer) from public,anon,authenticated;
grant execute on function public.save_order_settings(integer,integer,boolean,jsonb),public.set_orders_paused(boolean,integer) to authenticated;

create or replace function public.get_published_menu() returns jsonb language sql stable security definer set search_path='' as $$
  with visible_items as (select * from public.menu_items where publication_status='published' and source_category_code is distinct from 'MOCK_BEANS')
  select jsonb_build_object(
    'categories',coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'name',jsonb_build_object('vi',c.name_vi,'en',c.name_en,'ko',c.name_ko),'sortOrder',c.sort_order) order by c.sort_order,c.id) from public.menu_categories c where exists(select 1 from visible_items i where i.category_id=c.id)),'[]'::jsonb),
    'items',coalesce((select jsonb_agg(jsonb_build_object('id',i.id,'categoryId',i.category_id,'name',jsonb_build_object('vi',i.name_vi,'en',i.name_en,'ko',i.name_ko),'priceVnd',i.price_vnd,'sortOrder',i.sort_order,'isAvailable',i.is_available,'netWeightGram',i.net_weight_gram,
      'description',jsonb_build_object('vi',i.description_vi,'en',i.description_en,'ko',i.description_ko),
      'optionGroups',coalesce((select jsonb_agg((g-'choices')||jsonb_build_object('choices',coalesce((select jsonb_agg(ch order by (ch->>'sortOrder')::integer,ch->>'id') from jsonb_array_elements(g->'choices') ch where (ch->>'active')::boolean),'[]'::jsonb)) order by (g->>'sortOrder')::integer,g->>'id') from jsonb_array_elements(i.option_groups) g where (g->>'active')::boolean),'[]'::jsonb)
    ) order by c.sort_order,c.id,i.sort_order,i.id) from visible_items i join public.menu_categories c on c.id=i.category_id),'[]'::jsonb),
    'orderSettings',(select jsonb_build_object('timezone',timezone,'preparationMinutes',preparation_minutes,'paused',paused,'days',days) from public.store_order_settings where id='store')
  );
$$;
