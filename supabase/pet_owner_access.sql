-- Does this pet's owner currently have full Pet ID access (member, or a paid trip
-- whose travel date hasn't passed)? Returns only a boolean. The UI uses it only when
-- NEXT_PUBLIC_SITE_LAUNCHED=true to show a basic public page for lapsed owners.
create or replace function public.pet_owner_has_access(pet_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.pets p where p.id = pet_owner_has_access.pet_id and (
      public.is_member(p.user_id)
      or exists (select 1 from public.trips t where t.user_id = p.user_id and t.paid
                 and (t.travel_date is null or t.travel_date >= (now() at time zone 'America/Los_Angeles')::date))));
$$;
revoke all on function public.pet_owner_has_access(uuid) from public;
grant execute on function public.pet_owner_has_access(uuid) to anon, authenticated;
