-- Membership plumbing (no Stripe yet). The browser can READ its own membership
-- but can never write it: only the service role (future Stripe webhook) can.
create table if not exists public.memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'active' check (status in ('active','past_due','canceled')),
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz not null default now()
);
alter table public.memberships enable row level security;
revoke all on public.memberships from anon, authenticated;
grant select (user_id, status, current_period_end) on public.memberships to authenticated;
drop policy if exists "Member reads own membership" on public.memberships;
create policy "Member reads own membership" on public.memberships for select to authenticated using (auth.uid() = user_id);

create or replace function public.is_member(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.memberships m where m.user_id = uid and m.status = 'active'
                 and (m.current_period_end is null or m.current_period_end > now()));
$$;
revoke all on function public.is_member(uuid) from public, anon, authenticated;

create or replace function public.my_membership() returns boolean
language sql stable security definer set search_path = public as $$ select public.is_member(auth.uid()); $$;
revoke all on function public.my_membership() from public, anon;
grant execute on function public.my_membership() to authenticated;

-- Free accounts: 1 pet. Members: unlimited. Only gates NEW inserts; existing pets are untouched.
create or replace function public.enforce_pet_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_member(new.user_id)
     and (select count(*) from public.pets where user_id = new.user_id) >= 1 then
    raise exception 'PET_LIMIT: free accounts can have one pet' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists pets_enforce_limit on public.pets;
create trigger pets_enforce_limit before insert on public.pets for each row execute function public.enforce_pet_limit();

-- Document expiry (members get reminder emails).
alter table public.documents add column if not exists expires_on date;
create table if not exists public.document_reminders (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid not null,
  kind text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (document_id, kind)
);
alter table public.document_reminders enable row level security;
revoke all on public.document_reminders from anon, authenticated;
