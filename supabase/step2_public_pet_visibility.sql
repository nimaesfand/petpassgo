-- Step 2 safety. Run in the Supabase SQL editor. Additive only.
-- Run this file as one script, top to bottom.
-- Existing pets keep today's public visibility (switches ON).
-- New pets default OFF for date of birth, weight, sex, color, and About.
-- Safe to re-run.

alter table public.pets
  add column if not exists show_dob_on_public boolean,
  add column if not exists show_weight_on_public boolean,
  add column if not exists show_sex_on_public boolean,
  add column if not exists show_color_on_public boolean,
  add column if not exists show_about_on_public boolean;

update public.pets
set show_dob_on_public = coalesce(show_dob_on_public, true),
    show_weight_on_public = coalesce(show_weight_on_public, true),
    show_sex_on_public = coalesce(show_sex_on_public, true),
    show_color_on_public = coalesce(show_color_on_public, true),
    show_about_on_public = coalesce(show_about_on_public, true);

alter table public.pets alter column show_dob_on_public set default false;
alter table public.pets alter column show_weight_on_public set default false;
alter table public.pets alter column show_sex_on_public set default false;
alter table public.pets alter column show_color_on_public set default false;
alter table public.pets alter column show_about_on_public set default false;

alter table public.pets alter column show_dob_on_public set not null;
alter table public.pets alter column show_weight_on_public set not null;
alter table public.pets alter column show_sex_on_public set not null;
alter table public.pets alter column show_color_on_public set not null;
alter table public.pets alter column show_about_on_public set not null;

grant select (
  show_dob_on_public, show_weight_on_public, show_sex_on_public, show_color_on_public, show_about_on_public
) on public.pets to authenticated;
grant update (
  show_dob_on_public, show_weight_on_public, show_sex_on_public, show_color_on_public, show_about_on_public
) on public.pets to authenticated;

-- Public profile. Same return shape. The five fields follow the owner's switches.
create or replace function public.get_public_pet_id(pet_id uuid)
returns table (
  id uuid, name text, animal_type text, breed text, photo_path text,
  emergency_contact_name text, emergency_contact_phone text, microchipped boolean, passport_no text,
  color text, sex text, date_of_birth date, weight_lb numeric, role text, public_slug text, about_bio text,
  allergies text, medications text, vet_name text, vet_phone text, housing_notes text, handler_name text
)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.animal_type, p.breed, p.photo_url,
    case when p.show_contact_on_public_id then p.emergency_contact_name end,
    case when p.show_contact_on_public_id then p.emergency_contact_phone end,
    (p.microchip_number is not null and btrim(p.microchip_number) <> '')::boolean,
    p.passport_no,
    case when p.show_color_on_public then nullif(btrim(p.color), '') end,
    case when p.show_sex_on_public then nullif(btrim(p.sex), '') end,
    case when p.show_dob_on_public then p.date_of_birth end,
    case when p.show_weight_on_public then p.weight_lb end,
    p.role,
    p.public_slug,
    case when p.show_about_on_public then nullif(btrim(p.about_bio), '') end,
    case when p.show_medical_on_public then nullif(btrim(p.allergies), '') end,
    case when p.show_medical_on_public then nullif(btrim(p.medications), '') end,
    case when p.show_medical_on_public then nullif(btrim(p.vet_name), '') end,
    case when p.show_medical_on_public then nullif(btrim(p.vet_phone), '') end,
    case when p.show_housing_on_public then nullif(btrim(p.housing_notes), '') end,
    case when p.show_contact_on_public_id then nullif(btrim(p.handler_name), '') end
  from public.pets p where p.id = get_public_pet_id.pet_id limit 1;
$$;

revoke all on function public.get_public_pet_id(uuid) from public;
grant execute on function public.get_public_pet_id(uuid) to anon, authenticated;
