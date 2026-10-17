-- Flight lookup cache (AviationStack). Every lookup is cached here so repeated
-- views of the same flight/date never re-spend the 10k/month Basic quota.
-- RLS on, no anon/authenticated access: only the service role (server route) reads/writes.
create table if not exists public.flight_lookups (
  id uuid primary key default gen_random_uuid(),
  flight_iata text not null,
  flight_date date not null,
  found boolean not null default false,
  payload jsonb,
  source text not null default 'aviationstack',
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  unique (flight_iata, flight_date)
);
alter table public.flight_lookups enable row level security;
revoke all on public.flight_lookups from anon, authenticated;
grant all on public.flight_lookups to service_role;
alter table public.trips add column if not exists flight_number text;
alter table public.trips add column if not exists flight_snapshot jsonb;
alter table public.trips add column if not exists flight_checked_at timestamptz;
create index if not exists flight_lookups_expires_idx on public.flight_lookups (expires_at);
