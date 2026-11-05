-- Step 2 safety. Run in the Supabase SQL editor. Additive only.
-- One row per Stripe event id so a webhook retry does not run twice.
-- The service role writes this table. Customers cannot read it.
-- Safe to re-run.

create table if not exists public.stripe_events (
  id text primary key,
  event_type text not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
revoke all on public.stripe_events from anon, authenticated;
grant select, insert, delete on public.stripe_events to service_role;
