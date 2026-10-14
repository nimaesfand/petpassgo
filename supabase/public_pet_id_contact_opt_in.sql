-- Applied to production 2026-10-14 as migration "public_pet_id_contact_opt_in".
alter table public.pets add column if not exists show_contact_on_public_id boolean not null default false;
drop function if exists public.get_public_pet_id(uuid);
create function public.get_public_pet_id(pet_id uuid)
returns table (id uuid, name text, animal_type text, breed text, photo_path text, emergency_contact_name text, emergency_contact_phone text)
language sql stable security definer set search_path = public
as $$
  select p.id, p.name, p.animal_type, p.breed, p.photo_url,
    case when p.show_contact_on_public_id then p.emergency_contact_name end,
    case when p.show_contact_on_public_id then p.emergency_contact_phone end
  from public.pets p where p.id = get_public_pet_id.pet_id limit 1;
$$;
revoke all on function public.get_public_pet_id(uuid) from public;
grant execute on function public.get_public_pet_id(uuid) to anon, authenticated;
