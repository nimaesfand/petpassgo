-- Step 3. Run in the Supabase SQL editor. Additive only. Safe to re-run.
-- Care fields stay on the owner's account. They are not added to the public pet read.

alter table public.pets
  add column if not exists food text,
  add column if not exists feeding_schedule text,
  add column if not exists temperament text;

alter table public.pets drop constraint if exists pets_food_len;
alter table public.pets add constraint pets_food_len check (food is null or char_length(food) <= 500);
alter table public.pets drop constraint if exists pets_feeding_len;
alter table public.pets add constraint pets_feeding_len check (feeding_schedule is null or char_length(feeding_schedule) <= 500);
alter table public.pets drop constraint if exists pets_temperament_len;
alter table public.pets add constraint pets_temperament_len check (temperament is null or char_length(temperament) <= 1000);

grant select (food, feeding_schedule, temperament) on public.pets to authenticated;
grant update (food, feeding_schedule, temperament) on public.pets to authenticated;

alter table public.pet_health_records
  add column if not exists dose text,
  add column if not exists timing text;

alter table public.pet_health_records drop constraint if exists pet_health_dose_len;
alter table public.pet_health_records add constraint pet_health_dose_len check (dose is null or char_length(dose) <= 120);
alter table public.pet_health_records drop constraint if exists pet_health_timing_len;
alter table public.pet_health_records add constraint pet_health_timing_len check (timing is null or char_length(timing) <= 120);
