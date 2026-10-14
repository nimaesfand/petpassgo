-- Applied to production 2026-10-14 as migration "create_get_public_pet_id".
create or replace function public.get_public_pet_id(pet_id uuid)
returns table (id uuid, name text, animal_type text, breed text, role text, photo_path text, emergency_contact_name text, emergency_contact_phone text)
language sql stable security definer set search_path = public
as $$
  select p.id, p.name, p.animal_type, p.breed, p.role, p.photo_url, p.emergency_contact_name, p.emergency_contact_phone
  from public.pets p where p.id = get_public_pet_id.pet_id limit 1;
$$;
revoke all on function public.get_public_pet_id(uuid) from public;
grant execute on function public.get_public_pet_id(uuid) to anon, authenticated;
