-- PetPassGo passport / registration number + Care Card preset
-- Additive only. passport_no is generated once, unique, and never changed by an edit.

alter table public.pets add column if not exists passport_no text;
alter table public.pet_share_cards add column if not exists preset text not null default 'sitter';

do $$ begin
  if not exists (select 1 from pg_constraint where conname='pet_share_cards_preset_check') then
    alter table public.pet_share_cards add constraint pet_share_cards_preset_check check (preset in ('sitter','emergency'));
  end if;
end $$;

create or replace function public.generate_pet_passport_no() returns text
language plpgsql volatile set search_path = public as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
begin
  loop
    candidate := 'PPG-' || (
      select string_agg(substr(alphabet, 1 + floor(random()*length(alphabet))::int, 1), '')
      from generate_series(1,6)
    );
    exit when not exists (select 1 from public.pets where passport_no = candidate);
  end loop;
  return candidate;
end $$;

do $$
declare r record;
begin
  for r in select id from public.pets where passport_no is null or btrim(passport_no)='' loop
    update public.pets set passport_no = public.generate_pet_passport_no() where id = r.id;
  end loop;
end $$;

create unique index if not exists pets_passport_no_key on public.pets(passport_no);
alter table public.pets alter column passport_no set not null;

create or replace function public.pets_passport_no_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    if new.passport_no is null or btrim(new.passport_no)='' then
      new.passport_no := public.generate_pet_passport_no();
    end if;
    return new;
  end if;
  new.passport_no := old.passport_no;
  return new;
end $$;

drop trigger if exists pets_passport_no_guard on public.pets;
create trigger pets_passport_no_guard before insert or update on public.pets
for each row execute function public.pets_passport_no_guard();

-- Public finder RPC: add passport_no (number alone reveals no contact/health data).
drop function if exists public.get_public_pet_id(uuid);
create function public.get_public_pet_id(pet_id uuid)
returns table (
  id uuid, name text, animal_type text, breed text, photo_path text,
  emergency_contact_name text, emergency_contact_phone text, microchipped boolean, passport_no text
)
language sql stable security definer set search_path = public
as $$
  select p.id, p.name, p.animal_type, p.breed, p.photo_url,
    case when p.show_contact_on_public_id then p.emergency_contact_name end,
    case when p.show_contact_on_public_id then p.emergency_contact_phone end,
    (p.microchip_number is not null and btrim(p.microchip_number) <> '')::boolean,
    p.passport_no
  from public.pets p where p.id = get_public_pet_id.pet_id limit 1;
$$;
revoke all on function public.get_public_pet_id(uuid) from public;
grant execute on function public.get_public_pet_id(uuid) to anon, authenticated;
