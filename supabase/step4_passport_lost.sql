-- Step 4. Run in the Supabase SQL editor, top to bottom. Not applied by the app.
-- Additive: a public reward line on a lost report, a reader for that line,
-- and a publish function that stores it. Existing publish_lost_report stays.
-- get_public_pet_id is unchanged.

alter table public.pet_lost_reports
  add column if not exists reward_text text check (char_length(reward_text) <= 160);

-- Public reward text only while the report is lost. Empty when there is none.
create or replace function public.get_public_lost_reward(pet_id uuid)
returns text
language sql stable security definer set search_path = public as $$
  select nullif(left(btrim(coalesce(l.reward_text, '')), 160), '')
  from public.pet_lost_reports l
  where l.pet_id = get_public_lost_reward.pet_id and l.status = 'lost'
  limit 1;
$$;
revoke all on function public.get_public_lost_reward(uuid) from public;
grant execute on function public.get_public_lost_reward(uuid) to anon, authenticated;

-- Same steps as publish_lost_report, plus the owner's reward text.
-- The board post includes that text only when the owner also ticks the board.
create or replace function public.publish_lost_with_reward(
  p_pet_id uuid, p_area text, p_date date default null, p_note text default null,
  p_state text default null, p_city text default null,
  p_trip_airline text default null, p_trip_destination text default null, p_trip_flight text default null,
  p_post_board boolean default false, p_reward text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); pname text; rid uuid; nm text; st text; ct text; body text; post_id uuid; n text; reward text;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  select name into pname from public.pets where id = p_pet_id and user_id = uid;
  if pname is null then raise exception 'Not your pet' using errcode = '42501'; end if;
  if exists (select 1 from public.pet_lost_reports where pet_id = p_pet_id and status = 'lost') then
    raise exception 'A lost report is already live for this pet.'; end if;
  st := public.ppg_clean_state(p_state); ct := public.ppg_clean_place(p_city, 80);
  n := nullif(btrim(coalesce(p_note, '')), '');
  reward := nullif(left(btrim(coalesce(p_reward, '')), 160), '');
  insert into public.pet_lost_reports(pet_id, user_id, last_seen_area, last_seen_date, note, reward_text, state, city, trip_airline, trip_destination, trip_flight)
    values (p_pet_id, uid, left(nullif(btrim(coalesce(p_area, '')), ''), 120), p_date, left(n, 500), reward, st, ct,
            left(p_trip_airline, 60), left(p_trip_destination, 120), left(nullif(btrim(coalesce(p_trip_flight, '')), ''), 20))
    returning id into rid;
  if p_post_board then
    select display_name into nm from public.community_profiles where user_id = uid;
    nm := coalesce(nm, left(pname, 18) || '''s family');
    body := 'Last seen' || coalesce(' near ' || case when public.community_text_problem(p_area) is null then nullif(btrim(coalesce(p_area, '')), '') end, '')
      || coalesce(case when ct is not null and btrim(coalesce(p_area, '')) ilike '%' || ct || '%'
                       then case when st is not null and btrim(p_area) !~* ('\m' || st || '\M') then ', ' || st end
                       else ' (' || nullif(concat_ws(', ', ct, st), '') || ')' end, '')
      || coalesce(' on ' || to_char(p_date, 'Mon FMDD, YYYY'), '') || '.';
    if n is not null and public.community_text_problem(n) is null then body := body || E'\n\n' || left(n, 1500); end if;
    if reward is not null and public.community_text_problem(reward) is null then body := body || E'\n\nReward: ' || reward; end if;
    body := body || E'\n\nOpen the poster to message the owner privately.';
    insert into public.community_posts(board, user_id, author_name, title, body, pet_id, post_type, lost_state, lost_city)
      values ('lost-and-found', uid, nm, left(pname || ' lost, help locate ' || pname, 120), body, p_pet_id, 'lost', st, ct)
      returning id into post_id;
    update public.pet_lost_reports set board_post_id = post_id where id = rid;
  end if;
  return rid;
end $$;
revoke all on function public.publish_lost_with_reward(uuid, text, date, text, text, text, text, text, text, boolean, text) from public;
grant execute on function public.publish_lost_with_reward(uuid, text, date, text, text, text, text, text, text, boolean, text) to authenticated;

-- Found: same close as before, and clear the reward line.
create or replace function public.mark_pet_reunited(pet_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.pets p where p.id = mark_pet_reunited.pet_id and p.user_id = auth.uid()) then
    raise exception 'Not your pet' using errcode = '42501';
  end if;
  update public.pet_lost_reports set status = 'reunited', resolved_at = now(),
    last_seen_area = null, note = null, reward_text = null, trip_flight = null
  where pet_lost_reports.pet_id = mark_pet_reunited.pet_id and status = 'lost';
  delete from public.pet_scans s where s.pet_id = mark_pet_reunited.pet_id;
end $$;
revoke all on function public.mark_pet_reunited(uuid) from public;
grant execute on function public.mark_pet_reunited(uuid) to authenticated;

create or replace function public.cancel_lost_report(p_pet_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if not exists (select 1 from public.pets p where p.id = p_pet_id and p.user_id = uid) then
    raise exception 'Not your pet' using errcode = '42501'; end if;
  delete from public.community_posts c using public.pet_lost_reports r
    where r.pet_id = p_pet_id and r.status = 'lost' and c.id = r.board_post_id and c.user_id = uid;
  update public.pet_lost_reports set status = 'cancelled', resolved_at = now(),
    last_seen_area = null, note = null, reward_text = null, trip_flight = null, board_post_id = null
    where pet_id = p_pet_id and status = 'lost';
  delete from public.pet_scans s where s.pet_id = p_pet_id;
end $$;
revoke all on function public.cancel_lost_report(uuid) from public;
grant execute on function public.cancel_lost_report(uuid) to authenticated;
