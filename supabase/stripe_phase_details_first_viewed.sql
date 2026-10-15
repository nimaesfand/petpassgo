-- PLAN ONLY (Stripe phase). Not applied. Back up trips before applying.
-- Refund policy: full refund within 7 days only if paid Travel Pass details were never opened.
-- Record the first time the owner opens paid details. Must be set server-side
-- (definer RPC or API route), only once, and not writable by the client.
alter table public.trips add column if not exists details_first_viewed_at timestamptz null;

-- Suggested setter (call after verifying the trip is paid and owned by auth.uid()):
-- create or replace function public.mark_trip_details_viewed(trip_id uuid) returns void
-- language sql security definer set search_path = public as $$
--   update public.trips set details_first_viewed_at = now()
--   where id = trip_id and user_id = auth.uid() and paid and details_first_viewed_at is null;
-- $$;
-- Prerequisite: trips.paid must be set by the Stripe webhook, not the client (see launch blockers).
