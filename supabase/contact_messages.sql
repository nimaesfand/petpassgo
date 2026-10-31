-- Contact form. Written by the server with the service role.
-- RLS on, and anon/authenticated have no grants: only the service role can read or write.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 200),
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'read', 'closed'))
);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant select, insert, update, delete on public.contact_messages to service_role;
create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);
