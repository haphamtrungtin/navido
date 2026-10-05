create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.menu_categories (
  id text primary key,
  name_vi text not null check (length(btrim(name_vi)) > 0),
  name_en text not null default '', name_ko text not null default '',
  sort_order integer not null,
  source_category_codes text[] not null default '{}',
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create table public.menu_items (
  id text primary key,
  category_id text not null references public.menu_categories(id) on delete restrict,
  name_vi text not null check (length(btrim(name_vi)) > 0),
  name_en text not null default '', name_ko text not null default '',
  price_vnd integer not null check (price_vnd >= 0), sort_order integer not null,
  publication_status text not null default 'draft' check (publication_status in ('draft','published','archived')),
  is_available boolean not null default true,
  source_row integer unique check (source_row > 0), source_name text, source_category_code text,
  needs_review boolean not null default false, review_notes text[] not null default '{}',
  net_weight_gram integer check (net_weight_gram > 0),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
create index menu_items_category_idx on public.menu_items(category_id);
create table public.menu_audit_events (
  id bigint generated always as identity primary key,
  entity_type text not null check (entity_type in ('category','item')),
  entity_id text not null, operation text not null check (operation in ('insert','update')),
  actor_id uuid references auth.users(id) on delete set null,
  occurred_at timestamptz not null default now(), before_data jsonb, after_data jsonb not null
);
create index menu_audit_entity_idx on public.menu_audit_events(entity_type,entity_id,occurred_at desc);

alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_audit_events enable row level security;
revoke all on public.menu_categories, public.menu_items, public.menu_audit_events from anon, authenticated;
grant select,insert,update on public.menu_categories,public.menu_items to authenticated;
grant select on public.menu_audit_events to authenticated;
grant all on public.menu_categories,public.menu_items,public.menu_audit_events to service_role;
grant usage,select on sequence public.menu_audit_events_id_seq to service_role;

create policy admin_catalog_read on public.menu_categories for select to authenticated using (
  exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role in ('owner','staff'))
);
create policy owner_category_insert on public.menu_categories for insert to authenticated with check (
  exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role='owner')
);
create policy owner_category_update on public.menu_categories for update to authenticated using (
  exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role='owner')
) with check (
  exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role='owner')
);
create policy admin_catalog_read on public.menu_items for select to authenticated using (
  exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role in ('owner','staff'))
);
create policy owner_item_insert on public.menu_items for insert to authenticated with check (
  exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role='owner')
);
create policy owner_item_update on public.menu_items for update to authenticated using (
  exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role='owner')
) with check (
  exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role='owner')
);
create policy owner_audit_read on public.menu_audit_events for select to authenticated using (
  exists(select 1 from public.admin_memberships where user_id=(select auth.uid()) and is_active and role='owner')
);

create function private.stamp_catalog_change() returns trigger language plpgsql set search_path='' as $$
begin
  if TG_OP='UPDATE' then
    if new.id is distinct from old.id or new.created_at is distinct from old.created_at then
      raise exception 'catalog_source_immutable';
    end if;
    if TG_TABLE_NAME='menu_items' then
      if new.source_row is distinct from old.source_row or new.source_name is distinct from old.source_name
        or new.source_category_code is distinct from old.source_category_code or new.review_notes is distinct from old.review_notes then
        raise exception 'catalog_source_immutable';
      end if;
    elsif new.source_category_codes is distinct from old.source_category_codes then
      raise exception 'catalog_source_immutable';
    end if;
    new.version := old.version+1;
  else
    if auth.uid() is not null then
      if TG_TABLE_NAME='menu_items' then
        if new.source_row is not null or new.source_name is not null or new.source_category_code is not null or new.review_notes <> '{}'::text[] then
          raise exception 'catalog_source_immutable';
        end if;
      elsif new.source_category_codes <> '{}'::text[] then
        raise exception 'catalog_source_immutable';
      end if;
    end if;
    new.version := 1;
    new.created_at := now();
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create function private.audit_catalog_change() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.menu_audit_events(entity_type,entity_id,operation,actor_id,before_data,after_data)
    values(case when TG_TABLE_NAME='menu_items' then 'item' else 'category' end,new.id,lower(TG_OP),auth.uid(),case when TG_OP='UPDATE' then to_jsonb(old) else null end,to_jsonb(new));
  return new;
end;
$$;
revoke all on function private.stamp_catalog_change(),private.audit_catalog_change() from public,anon,authenticated;
create trigger stamp_category before insert or update on public.menu_categories for each row execute function private.stamp_catalog_change();
create trigger stamp_item before insert or update on public.menu_items for each row execute function private.stamp_catalog_change();
create trigger audit_category after insert or update on public.menu_categories for each row execute function private.audit_catalog_change();
create trigger audit_item after insert or update on public.menu_items for each row execute function private.audit_catalog_change();

create function public.set_menu_item_availability(p_item_id text,p_is_available boolean,p_expected_version integer)
returns integer language plpgsql security definer set search_path='' as $$
declare next_version integer;
begin
  if auth.uid() is null or not exists(select 1 from public.admin_memberships where user_id=auth.uid() and is_active and role in ('owner','staff')) then
    raise exception using errcode='42501',message='catalog_forbidden';
  end if;
  if p_is_available is null or p_expected_version is null or p_expected_version <= 0 then
    raise exception 'catalog_invalid_input';
  end if;
  update public.menu_items set is_available=p_is_available where id=p_item_id and version=p_expected_version returning version into next_version;
  if next_version is null then
    if exists(select 1 from public.menu_items where id=p_item_id) then raise exception 'catalog_conflict';
    else raise exception 'catalog_not_found'; end if;
  end if;
  return next_version;
end;
$$;
revoke all on function public.set_menu_item_availability(text,boolean,integer) from public,anon,authenticated;
grant execute on function public.set_menu_item_availability(text,boolean,integer) to authenticated;
