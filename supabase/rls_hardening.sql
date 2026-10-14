-- PetPassGo RLS hardening (NOT APPLIED). Review, then run in the Supabase SQL Editor.
-- Audit 2026-10-14: RLS is ON for pets, documents, pet_measurements, trips,
-- trip_requirement_status; every SELECT/INSERT/UPDATE/DELETE policy is scoped to
-- auth.uid() = user_id. Gaps found:
--   1) UPDATE policies have USING but no WITH CHECK, so an owner could change
--      user_id on their own row to someone else's id (reassign/plant rows).
--   2) INSERT checks only user_id, not that pet_id / trip_id belong to the caller,
--      so a user could attach rows to another user's pet/trip id (they still
--      can't read them, but it pollutes data).
--   3) No UPDATE policy on documents / pet_measurements (fine: app doesn't update them).
--   4) Policies apply to role "public"; scoping to "authenticated" is tidier (anon has no auth.uid() anyway).

-- 1) Add WITH CHECK to UPDATE policies
alter policy "Users can update their own pets" on public.pets
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
alter policy "Users can update their own trips" on public.trips
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
alter policy "Users can update their own requirement status" on public.trip_requirement_status
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2) Ownership of referenced pet / trip on insert
alter policy "Users can insert their own documents" on public.documents
  with check (auth.uid() = user_id
    and (pet_id is null or exists (select 1 from public.pets p where p.id = pet_id and p.user_id = auth.uid()))
    and (trip_id is null or exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())));
alter policy "Users can insert their own pet measurements" on public.pet_measurements
  with check (auth.uid() = user_id
    and exists (select 1 from public.pets p where p.id = pet_id and p.user_id = auth.uid()));
-- trip_requirement_status: check its trip column name before enabling, e.g.
-- alter policy "Users can insert their own requirement status" on public.trip_requirement_status
--   with check (auth.uid() = user_id and exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()));
