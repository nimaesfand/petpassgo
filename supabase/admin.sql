-- Owner-only admin. Seeded with the PetPassGo owner. No browser access to the table.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
insert into public.admins(user_id) values ('c9017545-9d9a-4cc9-b7f3-5de02e56be83') on conflict do nothing;
alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;
grant select, insert, update, delete on public.admins to service_role;

create or replace function public.is_admin(uid uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = uid);
$$;
revoke all on function public.is_admin(uuid) from public, anon, authenticated;
grant execute on function public.is_admin(uuid) to service_role;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null,
  admin_email text null,
  target_user_id uuid not null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from anon, authenticated;
grant select, insert on public.admin_audit_log to service_role;
create index if not exists admin_audit_target_idx on public.admin_audit_log(target_user_id, created_at desc);
