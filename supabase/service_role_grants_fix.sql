-- Fix: service_role was missing DML grants on memberships + stripe_customers,
-- so the Stripe webhook could not upsert memberships and checkout could not
-- persist the Stripe customer mapping (trips/purchases already had grants).
grant select, insert, update, delete on public.memberships to service_role;
grant select, insert, update, delete on public.stripe_customers to service_role;
