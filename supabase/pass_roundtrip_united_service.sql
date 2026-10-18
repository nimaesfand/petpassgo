-- Optional round trip, United cabin facts (united.com, checked 2026-10-18),
-- and Alaska/JetBlue service-animal ID clarification.
-- Safe to re-run: adds columns if missing, grants only the new write columns,
-- and inserts rows only when the same title is not already there.

alter table public.trips add column if not exists return_date date;
alter table public.trips add column if not exists return_flight_number text;
alter table public.trips add column if not exists return_flight_snapshot jsonb;
alter table public.trips add column if not exists service_kind text;

grant insert (
  return_date, return_flight_number, return_flight_snapshot, service_kind,
  flight_number, flight_snapshot
) on public.trips to authenticated;
grant update (
  return_date, return_flight_number, return_flight_snapshot, service_kind,
  flight_number, flight_snapshot
) on public.trips to authenticated;

-- Access anchor: return date when the traveler volunteered one, else travel date.
-- One-way trips (return_date null) stay travel_date + 7 days.
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

-- United cargo temperature: cabin only. Collapse duplicate United rows first.
delete from public.airline_cargo_temp_policies a
using public.airline_cargo_temp_policies b
where a.airline = 'United' and b.airline = 'United' and a.ctid > b.ctid;

update public.airline_cargo_temp_policies
set service_type = 'cabin_only',
    min_f = null,
    max_f = null,
    summary = 'United no longer lets general travelers check pets through PetSafe; cats and dogs fly in the cabin. Cargo is available only to certain active-duty military and State Department travelers, and United publishes no general cargo temperature limit we could verify.',
    source_url = 'https://www.united.com/en/us/fly/travel/traveling-with-pets.html',
    verified_at = '2026-10-18'
where airline = 'United';

insert into public.airline_cargo_temp_policies (airline, service_type, min_f, max_f, summary, source_url, verified_at)
select 'United', 'cabin_only', null, null,
  'United no longer lets general travelers check pets through PetSafe; cats and dogs fly in the cabin. Cargo is available only to certain active-duty military and State Department travelers, and United publishes no general cargo temperature limit we could verify.',
  'https://www.united.com/en/us/fly/travel/traveling-with-pets.html',
  '2026-10-18'
where not exists (select 1 from public.airline_cargo_temp_policies where airline = 'United');

-- Backfill the official source on United pet-fee rows. Set $150 only when the row doesn't already state it.
update public.airline_requirements
set source_url = 'https://www.united.com/en/us/fly/travel/traveling-with-pets.html',
    verified_at = '2026-10-18'
where airline = 'United' and category = 'PET FEE' and (source_url is null or btrim(source_url) = '');

update public.airline_requirements
set title = 'Cabin pet fee: $150 each way',
    description = 'United charges $150 each way for a cat or dog in the cabin (also listed as $150 per line of flight on United''s optional-service chart). Add the pet on united.com during booking or in My Trips. You cannot add a pet in the United app.',
    deadline_description = 'Pay when you add the pet',
    source_url = 'https://www.united.com/en/us/fly/travel/traveling-with-pets.html',
    verified_at = '2026-10-18',
    status = 'complete'
where airline = 'United' and role in ('Pet', 'Any') and category = 'PET FEE'
  and coalesce(title, '') not ilike '%150%';

-- United-only good-to-know rows. Not inserted for any other airline.
insert into public.airline_requirements (airline, animal_type, role, trip_type, category, title, description, deadline_description, submission_link, source_url, verified_at, destination_match, status)
select 'United', 'Any', 'Pet', 'domestic', 'BOOKING REQUIREMENT', 'You can''t add a pet in the United app',
  'United says pet tickets are added on united.com (choose Travel with a pet while booking, or use My Trips). You cannot add a pet to your trip in the United app. Good to know — this is not a separate task.',
  'When you book', '', 'https://www.united.com/en/us/fly/travel/traveling-with-pets.html', '2026-10-18', null, 'complete'
where not exists (
  select 1 from public.airline_requirements
  where airline = 'United' and title = 'You can''t add a pet in the United app'
);

insert into public.airline_requirements (airline, animal_type, role, trip_type, category, title, description, deadline_description, submission_link, source_url, verified_at, destination_match, status)
select 'United', 'Any', 'Pet', 'domestic', 'KENNEL REQUIREMENT', '737 MAX: carrier no more than 10 inches tall',
  'If the flight is on a Boeing 737 MAX, United limits the pet carrier to 10 inches tall. Other United aircraft use the published hard-sided maximum (9 x 17.5 x 12 in) or soft-sided maximum (11 x 18 x 11 in). This height limit is United''s rule for that aircraft, not a rule for other airlines. Good to know.',
  'Before you fly', '', 'https://www.united.com/en/us/fly/travel/traveling-with-pets.html', '2026-10-18', null, 'complete'
where not exists (
  select 1 from public.airline_requirements
  where airline = 'United' and title = '737 MAX: carrier no more than 10 inches tall'
);

insert into public.airline_requirements (airline, animal_type, role, trip_type, category, title, description, deadline_description, submission_link, source_url, verified_at, destination_match, status)
select 'United', 'Any', 'Pet', 'domestic', 'BOOKING REQUIREMENT', 'Two pets means two seats on United',
  'On most United flights you may bring up to 2 pets per person, and you must buy 2 adjacent seats so you can care for both. Some aircraft allow only one pet per person, including the 737 MAX 8 and MAX 9 (and the A319, A320, A321neo, 737-800 and 737-900). Confirm the aircraft when you book. This is United''s rule, not a blanket rule for other airlines. Good to know.',
  'When you book', '', 'https://www.united.com/en/us/fly/travel/traveling-with-pets.html', '2026-10-18', null, 'complete'
where not exists (
  select 1 from public.airline_requirements
  where airline = 'United' and title = 'Two pets means two seats on United'
);

insert into public.airline_requirements (airline, animal_type, role, trip_type, category, title, description, deadline_description, submission_link, source_url, verified_at, destination_match, status)
select 'United', 'Any', 'Pet', 'domestic', 'HEALTH DOCUMENTATION', 'Health certificate encouraged, not required on domestic United trips',
  'For travel within the U.S., United encourages a certificate of health from your vet (your name and phone, the pet''s description, and recent vaccines). It is not required for domestic cabin pets. International flights, including Canada and Mexico, do require a health and vaccination certificate. Good to know — not a task to mark done.',
  'Before you fly, if you want one', '', 'https://www.united.com/en/us/fly/travel/traveling-with-pets.html', '2026-10-18', null, 'complete'
where not exists (
  select 1 from public.airline_requirements
  where airline = 'United' and title = 'Health certificate encouraged, not required on domestic United trips'
);

-- Alaska and JetBlue: the Service Animal ID is issued by the airline for free.
insert into public.airline_requirements (airline, animal_type, role, trip_type, category, title, description, deadline_description, submission_link, source_url, verified_at, destination_match, status)
select 'Alaska Airlines', 'Dog', 'Service animal', 'domestic', 'GOOD TO KNOW', 'Alaska Service Animal ID is free',
  'Alaska''s Service Animal ID is issued by the airline at no charge after you submit the DOT form. It is not a credential you purchase from a third party, and you do not need a separate service-animal letter. Good to know.',
  'After you submit the DOT form', '', 'https://www.alaskaair.com/content/travel-info/accessible-services/specialservices-support-animals', '2026-10-18', null, 'complete'
where not exists (
  select 1 from public.airline_requirements
  where airline = 'Alaska Airlines' and title = 'Alaska Service Animal ID is free'
);

insert into public.airline_requirements (airline, animal_type, role, trip_type, category, title, description, deadline_description, submission_link, source_url, verified_at, destination_match, status)
select 'JetBlue', 'Dog', 'Service animal', 'domestic', 'GOOD TO KNOW', 'JetBlue Service Animal ID is free',
  'JetBlue''s Service Animal ID is issued by the airline at no charge. It is not a credential you buy, and a letter or certificate from the internet is not required. Good to know. You still use the official DOT form.',
  'After you submit the DOT form', '', 'https://www.jetblue.com/help/service-animals', '2026-10-18', null, 'complete'
where not exists (
  select 1 from public.airline_requirements
  where airline = 'JetBlue' and title = 'JetBlue Service Animal ID is free'
);

-- Service-dog pet fee is $0. Fact card, not a task.
insert into public.airline_requirements (airline, animal_type, role, trip_type, category, title, description, deadline_description, submission_link, source_url, verified_at, destination_match, status)
select 'Any', 'Dog', 'Service animal', 'domestic', 'PET FEE', '$0 pet fee for a service dog',
  'U.S. airlines do not charge a pet fee for a qualified service dog, including a psychiatric service dog (PSD). A PSD is a service dog. Emotional support animals are not service animals and pay the pet fee. Good to know — confirm the dog is accepted as a service animal when you book.',
  'When you book', '', 'https://www.transportation.gov/individuals/aviation-consumer-protection/service-animals', '2026-10-18', null, 'complete'
where not exists (
  select 1 from public.airline_requirements
  where airline = 'Any' and role = 'Service animal' and title = '$0 pet fee for a service dog'
);
