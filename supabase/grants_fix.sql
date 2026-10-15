-- Applied 2026-10-14 (migration grant_status_reminders).
-- trip_requirement_status / trip_reminders were created without table grants for
-- the authenticated role, so every dashboard checklist upsert failed with 403 (42501)
-- before RLS was even evaluated. RLS policies still scope rows to auth.uid().
grant select, insert, update on public.trip_requirement_status to authenticated;
grant select on public.trip_reminders to authenticated;
