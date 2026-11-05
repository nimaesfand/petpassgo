-- Step 2 safety. Run in the Supabase SQL editor. Additive only.
-- Reuses one unpaid trip per user and checkout attempt. The key includes the
-- travel date, so the same route on another date is still allowed.
-- Safe to re-run.

alter table public.trips add column if not exists checkout_key text;

create unique index if not exists trips_user_checkout_key
  on public.trips (user_id, checkout_key)
  where checkout_key is not null;

grant insert (checkout_key) on public.trips to authenticated;
grant update (checkout_key) on public.trips to authenticated;
