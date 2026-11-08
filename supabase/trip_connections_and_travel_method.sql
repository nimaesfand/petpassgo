-- Applied 2026-11-08: trip shape (connecting, second airline, cabin vs hold).
alter table public.trips add column if not exists connecting boolean not null default false;
alter table public.trips add column if not exists second_airline text;
alter table public.trips add column if not exists pet_travel text;
alter table public.trips add constraint trips_pet_travel_check check (pet_travel is null or pet_travel in ('cabin','hold','unsure'));
-- get_trip_requirements now also returns the second airline's rows;
-- requirements_preview gained a 5th arg p_second_airline and returns the airline column.
-- rule_source_snapshots: monthly official-page snapshots for change alerts (RLS on, no policies).
