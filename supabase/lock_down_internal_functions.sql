-- Applied 2026-11-08. Trigger/event-trigger functions are fired by Postgres itself;
-- nobody needs to call them over the API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
revoke execute on function public.enforce_pet_limit() from public, anon, authenticated;
revoke execute on function public.finder_message_guard() from public, anon, authenticated;
revoke execute on function public.ensure_user_marketing() from public, anon, authenticated;
alter function public.community_text_problem set search_path = public, pg_temp;
alter function public.ppg_clean_place set search_path = public, pg_temp;
alter function public.ppg_clean_state set search_path = public, pg_temp;
