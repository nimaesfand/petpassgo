-- NOT APPLIED. Stores chat "talk to a person" requests. Anyone may submit; only the
-- owner (Supabase dashboard / service role) can read them.
create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null check (char_length(email) <= 200),
  message text check (char_length(message) <= 2000),
  transcript text check (char_length(transcript) <= 6000),
  source text,
  handled boolean not null default false
);
alter table public.support_requests enable row level security;
create policy "Anyone can submit a support request" on public.support_requests
  for insert to anon, authenticated with check (handled = false);
-- No select/update/delete policies: requests are private to the owner.
