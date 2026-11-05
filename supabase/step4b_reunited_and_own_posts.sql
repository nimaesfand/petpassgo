-- Step 4 polish. Run in the Supabase SQL editor, top to bottom. Not applied by the app.
-- 1) Found keeps the same mark_pet_reunited(uuid) signature and marks the
--    board post reunited, without the reward or last-seen text.
-- 2) A signed-in owner can read their own community posts even without Pet Vault.

create or replace function public.mark_pet_reunited(pet_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); pname text;
begin
  select p.name into pname from public.pets p where p.id = mark_pet_reunited.pet_id and p.user_id = uid;
  if pname is null then
    raise exception 'Not your pet' using errcode = '42501';
  end if;
  update public.community_posts c
  set title = left('Reunited: ' || coalesce(nullif(btrim(regexp_replace(c.title, '^Reunited:\s*', 'i')), ''), pname), 120),
      body = pname || ' is home.',
      post_type = 'found'
  from public.pet_lost_reports r
  where r.pet_id = mark_pet_reunited.pet_id
    and r.status = 'lost'
    and c.id = r.board_post_id
    and c.user_id = uid;
  update public.pet_lost_reports set status = 'reunited', resolved_at = now(),
    last_seen_area = null, note = null, reward_text = null, trip_flight = null
  where pet_lost_reports.pet_id = mark_pet_reunited.pet_id and status = 'lost';
  delete from public.pet_scans s where s.pet_id = mark_pet_reunited.pet_id;
end $$;
revoke all on function public.mark_pet_reunited(uuid) from public;
grant execute on function public.mark_pet_reunited(uuid) to authenticated;

drop policy if exists "Owners read their own community posts" on public.community_posts;
create policy "Owners read their own community posts" on public.community_posts
  for select to authenticated
  using (user_id = auth.uid());
