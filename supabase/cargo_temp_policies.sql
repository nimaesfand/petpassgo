-- Verified checked-pet / cargo temperature policies, read directly off each
-- airline's OWN official site on 2026-10-16 (see source_url per row).
-- Deliberately NOT airline_requirements rows: those feed the paid checklist,
-- and a temperature policy is reference data for the weather card verdict,
-- not a check-off item. Only state a limit here when the airline publishes it.
create table if not exists public.airline_cargo_temp_policies (
  airline text primary key,
  service_type text not null check (service_type in ('limits','cabin_only')),
  min_f integer,
  max_f integer,
  summary text not null,
  source_url text not null,
  verified_at date not null
);
alter table public.airline_cargo_temp_policies enable row level security;
revoke all on public.airline_cargo_temp_policies from anon;
grant select on public.airline_cargo_temp_policies to authenticated, service_role;
drop policy if exists "Cargo temp policies readable" on public.airline_cargo_temp_policies;
create policy "Cargo temp policies readable" on public.airline_cargo_temp_policies for select to authenticated using (true);
insert into public.airline_cargo_temp_policies (airline, service_type, min_f, max_f, summary, source_url, verified_at) values
('Delta','limits',20,80,'Delta does not accept pets as checked baggage; pets ship via Delta Cargo (Delta Cargo notes household-pet shipments are limited, with active-duty military / Foreign Service exceptions). Delta Cargo live-animal ground limit is 20-80°F at origin, transfer and destination; a forecast of 20-45°F requires a Certificate of Acclimation stating a minimum not below 20°F.','https://www.deltacargo.com/Cargo/catalog/temperature-guidelines','2026-10-16'),
('American Airlines','limits',45,85,'Checked pets are accepted only for active-duty U.S. military and U.S. State Department personnel on official orders; other pets ship via American PetEmbark cargo. The limit is 45-85°F at every point on the itinerary; below 20°F is never accepted, and 20-44°F requires a licensed vet acclimation letter stating the exact lowest temperature. Pets not traveling in cabin cannot travel to, through or from Phoenix, Tucson, Las Vegas or Palm Springs from May 1 to September 30.','https://www.aa.com/web/i18n/travel-info/special-assistance/pets.html','2026-10-16'),
('Alaska Airlines','limits',45,85,'Pets travel checked in the baggage compartment and as Pet Connect cargo. Alaska Cargo states pets may not be accepted when forecast temperatures are above 85°F or below 45°F at any point on the itinerary; below 45°F may be permitted with a licensed-vet certificate of acclimation issued within 10 days of travel specifying the temperatures the pet is acclimated to. Station capabilities can vary on the day of travel.','https://www.alaskacargo.com/petconnect/restrictions','2026-10-16'),
('Southwest','cabin_only',null,null,'Southwest does not transport pets in the cargo compartment. Small vaccinated cats and dogs travel in the cabin only, so checked/cargo temperature limits do not apply.','https://support.southwest.com/helpcenter/s/article/pet-policy','2026-10-16'),
('JetBlue','cabin_only',null,null,'JetBlue pets travel only in the cabin (small dogs and cats in an approved carrier); JetBlue does not accept animals as checked baggage, so checked/cargo temperature limits do not apply.','https://www.jetblue.com/help/traveling-with-pets','2026-10-16'),
('United','cabin_only',null,null,'United no longer lets general travelers check pets through PetSafe; cats and dogs fly in the cabin. Cargo is available only to certain active-duty military and State Department travelers, and United publishes no general cargo temperature limit we could verify.','https://www.united.com/en/us/fly/travel/traveling-with-pets.html','2026-10-16'),
('Frontier','cabin_only',null,null,'Frontier does not transport pets in the cargo hold and checked pets are not allowed; eligible pets travel in the cabin, so checked/cargo temperature limits do not apply.','https://faq.flyfrontier.com/help/do-you-allow-pets-on-the-plane','2026-10-16'),
('Allegiant','cabin_only',null,null,'Allegiant does not transport animals in the cargo bin; domestic dogs and cats travel in the cabin, so checked/cargo temperature limits do not apply.','https://www.allegiantair.com/traveling-with-pets','2026-10-16')
on conflict (airline) do update set service_type=excluded.service_type, min_f=excluded.min_f, max_f=excluded.max_f, summary=excluded.summary, source_url=excluded.source_url, verified_at=excluded.verified_at;
