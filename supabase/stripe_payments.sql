-- Stripe phase. Browser can no longer write trips.paid or memberships; only the
-- service role (Stripe webhook) can. Backup: /workspace/supabase_backup_stripe.

-- 1) Trips: payment + refund-rule columns.
alter table public.trips add column if not exists details_first_viewed_at timestamptz null;
alter table public.trips add column if not exists paid_at timestamptz null;
alter table public.trips add column if not exists stripe_checkout_session_id text null;
alter table public.trips alter column paid set default false;

-- 2) Column privileges: anon gets nothing; authenticated may only write trip answers.
revoke all on public.trips from anon;
revoke insert, update, truncate, references, trigger on public.trips from authenticated;
grant insert (user_id, pet_id, origin, destination, airline, travel_date, status, animal_type, role)
  on public.trips to authenticated;
grant update (pet_id, origin, destination, airline, travel_date, status, animal_type, role)
  on public.trips to authenticated;
-- select/delete own rows stay as before (RLS policies unchanged).

-- Belt and braces: a client insert can never arrive paid (column default false, not granted).
create or replace function public.trips_guard_paid() returns trigger
language plpgsql set search_path = public as $$
begin
  if current_user in ('anon','authenticated') then
    if tg_op = 'INSERT' then
      new.paid := false; new.paid_at := null; new.stripe_checkout_session_id := null; new.details_first_viewed_at := null;
    else
      new.paid := old.paid; new.paid_at := old.paid_at; new.stripe_checkout_session_id := old.stripe_checkout_session_id;
      new.details_first_viewed_at := old.details_first_viewed_at;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists trips_guard_paid on public.trips;
create trigger trips_guard_paid before insert or update on public.trips for each row execute function public.trips_guard_paid();

-- 3) Memberships: read-only for the owner (re-assert).
revoke all on public.memberships from anon, authenticated;
grant select (user_id, status, current_period_end) on public.memberships to authenticated;

-- 4) Stripe customer per user (server only).
create table if not exists public.stripe_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  customer_id text not null unique,
  created_at timestamptz not null default now()
);
alter table public.stripe_customers enable row level security;
revoke all on public.stripe_customers from anon, authenticated;

-- 5) Refund rule: record first time paid details are opened. Once, never overwritten.
create or replace function public.mark_trip_details_viewed(p_trip_id uuid) returns timestamptz
language sql security definer set search_path = public as $$
  update public.trips set details_first_viewed_at = now()
  where id = p_trip_id and user_id = auth.uid() and paid and details_first_viewed_at is null
  returning details_first_viewed_at;
$$;
revoke all on function public.mark_trip_details_viewed(uuid) from public, anon;
grant execute on function public.mark_trip_details_viewed(uuid) to authenticated;
