-- Step 3. Run after step3_documents.sql. Additive only. Safe to re-run.
-- Document expiry emails are on unless the owner turns them off.
-- This is separate from marketing tips. Default is on for existing accounts.

alter table public.user_marketing
  add column if not exists document_reminders boolean not null default true;

create or replace function public.my_document_reminders() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select m.document_reminders from public.user_marketing m where m.user_id = auth.uid()), true);
$$;
revoke all on function public.my_document_reminders() from public, anon;
grant execute on function public.my_document_reminders() to authenticated;

create or replace function public.set_document_reminders(enabled boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sign in'; end if;
  insert into public.user_marketing (user_id, unsubscribe_token, document_reminders)
  values (auth.uid(), replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), coalesce(enabled, true))
  on conflict (user_id) do update set document_reminders = excluded.document_reminders;
end $$;
revoke all on function public.set_document_reminders(boolean) from public, anon;
grant execute on function public.set_document_reminders(boolean) to authenticated;

grant select on public.user_marketing to service_role;
