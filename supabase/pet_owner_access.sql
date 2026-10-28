-- Does this pet's owner currently have full Pet ID access (member, or a paid trip
-- whose access window is open)? One-way trips end 7 days after travel_date.
-- When a return date is later than the outbound date, the window ends 7 days
-- after return_date. A paid trip with no dates stays open. Returns only a boolean.
-- Used when NEXT_PUBLIC_SITE_LAUNCHED=true to show a basic public page for lapsed owners.
create or replace function public.pet_owner_has_access(pet_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.pets p where p.id = pet_owner_has_access.pet_id and (
      public.is_member(p.user_id)
      or exists (
        select 1 from public.trips t
        where t.user_id = p.user_id and t.paid
          and (
            (t.travel_date is null and t.return_date is null)
            or coalesce(
              case when t.return_date is not null and (t.travel_date is null or t.return_date > t.travel_date) then t.return_date else t.travel_date end,
              t.travel_date
            ) >= ((now() at time zone 'America/Los_Angeles')::date - 7)
          )
      )
    )
  );
$$;
revoke all on function public.pet_owner_has_access(uuid) from public;
grant execute on function public.pet_owner_has_access(uuid) to anon, authenticated;
