-- Pet ID v2: structured chip fields, health-passport records and expiring share cards.
-- No public API exposes a full microchip number. Backups: /workspace/supabase_backup_petidv2.
alter table public.pets
  add column if not exists chip_brand text null,
  add column if not exists chip_registry text null,
  add column if not exists chip_registry_phone text null,
  add column if not exists chip_registry_url text null,
  add column if not exists chip_verified_at date null;

create table if not exists public.pet_health_records (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('vaccine','medication','allergy','note')),
  name text not null,
  date_given date null,
  expires_on date null,
  clinic text null,
  notes text null,
  show_to_finder boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.pet_health_records enable row level security;
revoke all on public.pet_health_records from anon;
drop policy if exists "Owner reads health records" on public.pet_health_records;
drop policy if exists "Owner writes health records" on public.pet_health_records;
drop policy if exists "Owner updates health records" on public.pet_health_records;
drop policy if exists "Owner deletes health records" on public.pet_health_records;
create policy "Owner reads health records" on public.pet_health_records for select to authenticated using (auth.uid() = user_id);
create policy "Owner writes health records" on public.pet_health_records for insert to authenticated with check (auth.uid() = user_id);
create policy "Owner updates health records" on public.pet_health_records for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Owner deletes health records" on public.pet_health_records for delete to authenticated using (auth.uid() = user_id);
create index if not exists pet_health_records_pet_idx on public.pet_health_records(pet_id, kind, expires_on);

create table if not exists public.pet_share_cards (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  last_viewed_at timestamptz null,
  view_count integer not null default 0
);
alter table public.pet_share_cards enable row level security;
revoke all on public.pet_share_cards from anon;
drop policy if exists "Owner manages share cards" on public.pet_share_cards;
create policy "Owner manages share cards" on public.pet_share_cards for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists pet_share_cards_pet_idx on public.pet_share_cards(pet_id, expires_at desc);

-- Additive, compatible output for the existing public ID RPC.
drop function if exists public.get_public_pet_id(uuid);
create function public.get_public_pet_id(pet_id uuid)
returns table (
  id uuid, name text, animal_type text, breed text, photo_path text,
  emergency_contact_name text, emergency_contact_phone text, microchipped boolean
)
language sql stable security definer set search_path = public
as $$
  select p.id, p.name, p.animal_type, p.breed, p.photo_url,
    case when p.show_contact_on_public_id then p.emergency_contact_name end,
    case when p.show_contact_on_public_id then p.emergency_contact_phone end,
    (p.microchip_number is not null and btrim(p.microchip_number) <> '')::boolean
  from public.pets p where p.id = get_public_pet_id.pet_id limit 1;
$$;
revoke all on function public.get_public_pet_id(uuid) from public;
grant execute on function public.get_public_pet_id(uuid) to anon, authenticated;

-- Public, finder-visible health lines: owner-controlled toggles only.
drop function if exists public.get_public_pet_health(uuid);
create function public.get_public_pet_health(pet_id uuid)
returns table (kind text, name text, expires_on date)
language sql stable security definer set search_path = public
as $$
  select h.kind, h.name, h.expires_on
  from public.pet_health_records h
  join public.pets p on p.id = h.pet_id
  where p.id = get_public_pet_health.pet_id and h.show_to_finder
  order by h.expires_on nulls last, h.created_at;
$$;
revoke all on function public.get_public_pet_health(uuid) from public;
grant execute on function public.get_public_pet_health(uuid) to anon, authenticated;

grant select, insert, update, delete on public.pet_health_records to authenticated;
grant select, update on public.pet_share_cards to authenticated;
grant select, insert, update, delete on public.pet_health_records, public.pet_share_cards to service_role;
