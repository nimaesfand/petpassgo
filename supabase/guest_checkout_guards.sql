-- Rate limiting for the signed-out email check, and a log of safety-net refunds/cancellations
-- when a guest payment turns out to belong to an existing member. Service role only.
create table if not exists public.api_rate_limits (
  key text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from public, anon, authenticated;
grant all on public.api_rate_limits to service_role;

-- Returns true when the call is allowed (and counts it).
create or replace function public.rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare v_hits integer;
begin
  insert into public.api_rate_limits as r (key, window_start, hits) values (p_key, now(), 1)
  on conflict (key) do update set
    hits = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.hits + 1 end,
    window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning hits into v_hits;
  delete from public.api_rate_limits where window_start < now() - interval '1 day';
  return v_hits <= p_limit;
end $$;
revoke all on function public.rate_limit_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_hit(text, integer, integer) to service_role;

create table if not exists public.guest_refunds (
  id uuid primary key default gen_random_uuid(),
  guest_checkout_id uuid,
  user_id uuid references auth.users(id) on delete set null,
  plan text,
  reason text not null,              -- duplicate_membership | member_price_difference
  amount_cents integer,
  stripe_payment_intent_id text,
  stripe_subscription_id text,
  subscription_canceled boolean not null default false,
  stripe_refund_id text,
  status text not null check (status in ('refunded','failed','manual_review')),
  error text,
  created_at timestamptz not null default now()
);
alter table public.guest_refunds enable row level security;
revoke all on public.guest_refunds from public, anon, authenticated;
grant all on public.guest_refunds to service_role;
