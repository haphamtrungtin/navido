create table public.admin_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'staff')),
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.admin_memberships enable row level security;
revoke all on public.admin_memberships from anon, authenticated;
grant select on public.admin_memberships to authenticated;
grant all on public.admin_memberships to service_role;
create policy own_membership on public.admin_memberships for select to authenticated
  using (user_id = (select auth.uid()));
