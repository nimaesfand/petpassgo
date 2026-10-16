-- Facts only after payment. Direct table reads are removed for browsers.
-- Paid owners read their trip's rows via get_trip_requirements; the free preview
-- gets non-revealing shapes via requirements_preview. Backup: /workspace/supabase_backup_overnight/.
drop policy if exists "Anyone can view requirements" on public.airline_requirements;
revoke all on public.airline_requirements from anon, authenticated;
alter table public.airline_requirements enable row level security;

create or replace function public.requirements_preview(p_airline text, p_animal text, p_role text, p_trip_types text[])
returns table (id uuid, category text, status text, destination_match text, title_len int, title text, description text)
language sql stable security definer set search_path = public as $$
  select r.id, r.category, r.status, r.destination_match, length(coalesce(r.title,''))::int,
         case when r.category = 'ELIGIBILITY NOTE' then r.title end,
         case when r.category = 'ELIGIBILITY NOTE' then r.description end
  from public.airline_requirements r
  where r.airline in (case when p_airline = 'Hawaiian Airlines' then 'Alaska Airlines' else p_airline end, 'Any')
    and r.animal_type in (p_animal, 'Any') and r.role in (p_role, 'Any') and r.trip_type = any(p_trip_types);
$$;
revoke all on function public.requirements_preview(text,text,text,text[]) from public;
grant execute on function public.requirements_preview(text,text,text,text[]) to anon, authenticated;

create or replace function public.get_trip_requirements(p_trip_id uuid, p_trip_types text[])
returns setof public.airline_requirements
language sql stable security definer set search_path = public as $$
  select r.* from public.airline_requirements r
  join public.trips t on t.id = p_trip_id and t.user_id = auth.uid() and t.paid
  where r.airline in (case when t.airline = 'Hawaiian Airlines' then 'Alaska Airlines' else t.airline end, 'Any')
    and r.animal_type in (t.animal_type, 'Any') and r.role in (t.role, 'Any') and r.trip_type = any(p_trip_types);
$$;
revoke all on function public.get_trip_requirements(uuid,text[]) from public, anon;
grant execute on function public.get_trip_requirements(uuid,text[]) to authenticated;
