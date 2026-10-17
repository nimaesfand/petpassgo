-- Feedback (private; owner can add/read own, service reads all) + purchase history.
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('purchase','post_trip')),
  trip_id uuid null references public.trips(id) on delete set null,
  ref text null,
  rating int not null check (rating between 1 and 5),
  comment text null check (char_length(comment) <= 2000),
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref)
);
alter table public.feedback enable row level security;
revoke all on public.feedback from anon;
grant select, insert on public.feedback to authenticated;
grant select, insert, update, delete on public.feedback to service_role;
drop policy if exists "Owner adds feedback" on public.feedback;
drop policy if exists "Owner reads own feedback" on public.feedback;
create policy "Owner adds feedback" on public.feedback for insert to authenticated with check (auth.uid() = user_id);
create policy "Owner reads own feedback" on public.feedback for select to authenticated using (auth.uid() = user_id);

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid null references public.trips(id) on delete set null,
  kind text not null check (kind in ('pass','member_pass','join','membership','membership_renewal')),
  amount_cents int null,
  currency text not null default 'usd',
  stripe_checkout_session_id text null unique,
  stripe_payment_intent_id text null,
  stripe_invoice_id text null unique,
  receipt_url text null,
  created_at timestamptz not null default now()
);
alter table public.purchases enable row level security;
revoke all on public.purchases from anon;
grant select on public.purchases to authenticated;
grant select, insert, update, delete on public.purchases to service_role;
drop policy if exists "Owner reads own purchases" on public.purchases;
create policy "Owner reads own purchases" on public.purchases for select to authenticated using (auth.uid() = user_id);
create index if not exists purchases_user_idx on public.purchases(user_id, created_at desc);
create index if not exists feedback_user_idx on public.feedback(user_id, created_at desc);
