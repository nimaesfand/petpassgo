-- EU/UK withdrawal consent, given at checkout before Stripe.
-- Service role only. The browser cannot read or write these rows.
create table if not exists public.withdrawal_consents (
  id uuid primary key default gen_random_uuid(),
  consented_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  email text,
  plan text not null check (plan in ('pass', 'member_pass', 'join', 'membership')),
  policy_version text not null,
  stripe_checkout_session_id text unique,
  guest_checkout_id uuid references public.guest_checkouts(id) on delete set null,
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists withdrawal_consents_email on public.withdrawal_consents (lower(email));
create index if not exists withdrawal_consents_user on public.withdrawal_consents (user_id);
create index if not exists withdrawal_consents_guest on public.withdrawal_consents (guest_checkout_id);

alter table public.withdrawal_consents enable row level security;
revoke all on public.withdrawal_consents from public, anon, authenticated;
grant all on public.withdrawal_consents to service_role;
