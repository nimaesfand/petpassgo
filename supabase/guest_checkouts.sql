-- Pay-first (guest) checkout: a checkout started while signed out. Holds the plan and trip
-- answers until the buyer creates a password (or logs in) and the purchase is claimed.
-- Service role only: RLS on, no policies, no grants to anon/authenticated.
create table if not exists public.guest_checkouts (
  id uuid primary key default gen_random_uuid(),
  plan text not null check (plan in ('pass','join','membership')),
  trip jsonb,
  attribution jsonb,
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  email text,
  first_name text,
  last_name text,
  amount_cents integer,
  currency text,
  paid_at timestamptz,
  claimed_user_id uuid references auth.users(id) on delete set null,
  claimed_trip_id uuid references public.trips(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists guest_checkouts_email_unclaimed on public.guest_checkouts (lower(email)) where claimed_at is null and paid_at is not null;
alter table public.guest_checkouts enable row level security;
revoke all on public.guest_checkouts from public, anon, authenticated;
grant all on public.guest_checkouts to service_role;

-- Server-only lookup of an account id by email (to avoid letting a guest set a password on an existing account).
create or replace function public.auth_user_id_by_email(p_email text)
returns uuid language sql stable security definer set search_path = '' as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1
$$;
revoke all on function public.auth_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.auth_user_id_by_email(text) to service_role;
