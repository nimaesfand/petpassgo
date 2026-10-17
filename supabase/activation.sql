-- Guided activation state that cannot be derived from data (QR shared/downloaded, dismissed).
create table if not exists public.pet_activation (
  pet_id uuid primary key references public.pets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  qr_done_at timestamptz null,
  dismissed_at timestamptz null,
  updated_at timestamptz not null default now()
);
alter table public.pet_activation enable row level security;
revoke all on public.pet_activation from anon;
grant select, insert, update on public.pet_activation to authenticated;
grant select, insert, update, delete on public.pet_activation to service_role;
drop policy if exists "Owner manages activation" on public.pet_activation;
create policy "Owner manages activation" on public.pet_activation for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists pet_activation_user_idx on public.pet_activation(user_id);
