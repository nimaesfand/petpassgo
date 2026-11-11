-- Per-flight rules. Apply in the Supabase SQL editor. Do not run from the app.
--
-- Adds trips.segments (jsonb). Null keeps today's one-flight trip.
-- A connection with a stop city stores two legs: origin, destination, date, airline, mode.
-- get_trip_requirements keeps returning the trip airline and the second airline,
-- and also any airline named on a segment. The paid pass then keeps each flight's rules apart.
--
-- Backout: re-apply the previous get_trip_requirements from your last backup
-- (it must still include second_airline), then:
--   alter table public.trips drop column if exists segments;

alter table public.trips add column if not exists segments jsonb;

comment on column public.trips.segments is
  'Optional legs: origin, destination, date, airline, mode cabin or hold. Null keeps the one-airline trip.';

create or replace function public.get_trip_requirements(p_trip_id uuid, p_trip_types text[])
returns setof public.airline_requirements
language sql stable security definer set search_path = public as $$
  select distinct r.*
  from public.airline_requirements r
  join public.trips t on t.id = p_trip_id and t.user_id = auth.uid() and t.paid
  where r.animal_type in (t.animal_type, 'Any')
    and r.role in (t.role, 'Any')
    and r.trip_type = any(p_trip_types)
    and (
      r.airline = 'Any'
      or r.airline in (
        select case when name = 'Hawaiian Airlines' then 'Alaska Airlines' else name end
        from (
          select t.airline as name
          union select t.second_airline
          union select leg->>'airline'
          from jsonb_array_elements(coalesce(t.segments, '[]'::jsonb)) leg
        ) names
        where name is not null and name <> ''
      )
    );
$$;

revoke all on function public.get_trip_requirements(uuid, text[]) from public, anon;
grant execute on function public.get_trip_requirements(uuid, text[]) to authenticated;
