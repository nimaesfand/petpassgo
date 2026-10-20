-- Oct 20 owner feedback (migration "account_feedback_oct20"). Additive only.
-- 1) Pet ID card fields (owner-declared).
alter table public.pets
  add column if not exists handler_name text check (char_length(handler_name) <= 80),
  add column if not exists trained boolean;

-- 2) Lost reports: location for the local board, a link to the board post, and a
--    'cancelled' status so a report can be turned off without calling it reunited.
alter table public.pet_lost_reports
  add column if not exists state text check (char_length(state) <= 40),
  add column if not exists city text check (char_length(city) <= 80),
  add column if not exists board_post_id uuid references public.community_posts(id) on delete set null;
alter table public.pet_lost_reports drop constraint if exists pet_lost_reports_status_check;
alter table public.pet_lost_reports add constraint pet_lost_reports_status_check check (status in ('lost','reunited','cancelled'));

-- 3) Community posts: optional location (Lost & found) and a 'lost' post type.
alter table public.community_posts
  add column if not exists lost_state text check (char_length(lost_state) <= 40),
  add column if not exists lost_city text check (char_length(lost_city) <= 80);
alter table public.community_posts drop constraint if exists community_posts_post_type_check;
alter table public.community_posts add constraint community_posts_post_type_check check (post_type is null or post_type in ('tip','experience','question','lost','found'));
create index if not exists community_posts_board_loc on public.community_posts(board, lost_state, lost_city, created_at desc);

-- Normalizes "los angeles " -> "Los Angeles"
create or replace function public.ppg_clean_place(v text, maxlen int) returns text language sql immutable as $$
  select nullif(left(initcap(regexp_replace(btrim(coalesce(v,'')), '\s+', ' ', 'g')), maxlen), '')
$$;

-- State is stored as the 2-letter code, upper-cased.
create or replace function public.ppg_clean_state(v text) returns text language sql immutable as $$
  select nullif(left(upper(btrim(coalesce(v,''))), 40), '')
$$;

-- 4) Publish a lost report and (optionally) its local Lost & found board post, in one step.
create or replace function public.publish_lost_report(
  p_pet_id uuid, p_area text, p_date date default null, p_note text default null,
  p_state text default null, p_city text default null,
  p_trip_airline text default null, p_trip_destination text default null, p_trip_flight text default null,
  p_post_board boolean default true)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); pname text; rid uuid; nm text; st text; ct text; body text; post_id uuid; n text;
begin
  if uid is null then raise exception 'Sign in first.' using errcode = '42501'; end if;
  select name into pname from public.pets where id = p_pet_id and user_id = uid;
  if pname is null then raise exception 'Not your pet' using errcode = '42501'; end if;
  if exists (select 1 from public.pet_lost_reports where pet_id = p_pet_id and status = 'lost') then
    raise exception 'A lost report is already live for this pet.'; end if;
  st := public.ppg_clean_state(p_state); ct := public.ppg_clean_place(p_city, 80);
  n := nullif(btrim(coalesce(p_note,'')), '');
  insert into public.pet_lost_reports(pet_id, user_id, last_seen_area, last_seen_date, note, state, city, trip_airline, trip_destination, trip_flight)
    values (p_pet_id, uid, left(nullif(btrim(coalesce(p_area,'')), ''), 120), p_date, left(n, 500), st, ct,
            left(p_trip_airline, 60), left(p_trip_destination, 120), left(nullif(btrim(coalesce(p_trip_flight,'')), ''), 20))
    returning id into rid;
  if p_post_board then
    select display_name into nm from public.community_profiles where user_id = uid;
    nm := coalesce(nm, left(pname, 18) || '''s family');
    body := 'Last seen' || coalesce(' near ' || case when public.community_text_problem(p_area) is null then nullif(btrim(coalesce(p_area,'')), '') end, '')
      || coalesce(case when ct is not null and btrim(coalesce(p_area,'')) ilike '%' || ct || '%'
                       then case when st is not null and btrim(p_area) !~* ('\m' || st || '\M') then ', ' || st end
                       else ' (' || nullif(concat_ws(', ', ct, st), '') || ')' end, '')
      || coalesce(' on ' || to_char(p_date, 'Mon FMDD, YYYY'), '') || '.';
    if n is not null and public.community_text_problem(n) is null then body := body || E'\n\n' || left(n, 1500); end if;
    body := body || E'\n\nOpen the poster to message the owner privately.';
    insert into public.community_posts(board, user_id, author_name, title, body, pet_id, post_type, lost_state, lost_city)
      values ('lost-and-found', uid, nm, left(pname || ' lost, help locate ' || pname, 120), body, p_pet_id, 'lost', st, ct)
      returning id into post_id;
    update public.pet_lost_reports set board_post_id = post_id where id = rid;
  end if;
  return rid;
end $$;
revoke all on function public.publish_lost_report(uuid, text, date, text, text, text, text, text, text, boolean) from public;
grant execute on function public.publish_lost_report(uuid, text, date, text, text, text, text, text, text, boolean) to authenticated;

-- 5) Turn a report off without calling it reunited (e.g. made by mistake). Removes its
--    board post and scan locations.
create or replace function public.cancel_lost_report(p_pet_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if not exists (select 1 from public.pets p where p.id = p_pet_id and p.user_id = uid) then
    raise exception 'Not your pet' using errcode = '42501'; end if;
  delete from public.community_posts c using public.pet_lost_reports r
    where r.pet_id = p_pet_id and r.status = 'lost' and c.id = r.board_post_id and c.user_id = uid;
  update public.pet_lost_reports set status = 'cancelled', resolved_at = now(), last_seen_area = null, note = null, trip_flight = null, board_post_id = null
    where pet_id = p_pet_id and status = 'lost';
  delete from public.pet_scans s where s.pet_id = p_pet_id;
end $$;
revoke all on function public.cancel_lost_report(uuid) from public;
grant execute on function public.cancel_lost_report(uuid) to authenticated;

-- 6) Lost & found posts written by hand can carry a location too (separate name so
--    existing create_community_post calls stay unambiguous).
create or replace function public.create_community_post_local(board text, body text, title text, post_type text, lost_state text, lost_city text, pet_id uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if board <> 'lost-and-found' then raise exception 'Location is only for Lost & found posts.'; end if;
  if post_type not in ('tip','experience','question','lost','found') then raise exception 'Choose a post type.'; end if;
  new_id := public.create_community_post(board, body, title, null::uuid, pet_id, case when post_type in ('lost','found') then 'tip' else post_type end);
  update public.community_posts set post_type = create_community_post_local.post_type,
    lost_state = public.ppg_clean_state(create_community_post_local.lost_state),
    lost_city = public.ppg_clean_place(create_community_post_local.lost_city, 80)
    where id = new_id and user_id = auth.uid();
  return new_id;
end $$;
revoke all on function public.create_community_post_local(text, text, text, text, text, text, uuid) from public;
grant execute on function public.create_community_post_local(text, text, text, text, text, text, uuid) to authenticated;

-- 7) Public Pet ID card: only safe fields. Chip = last 4 only; handler and emergency
--    contact only when the owner opted in; age (not birth date); rabies expiry from the
--    owner's vault record; service animal and training are owner-declared.
create or replace function public.get_public_pet_card(pet_id uuid)
returns table(id uuid, name text, animal_type text, breed text, sex text, age_months int, role text, trained boolean,
  handler_name text, emergency_contact_name text, emergency_contact_phone text, chip_last4 text, passport_no text,
  photo_path text, rabies_expires date)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.animal_type, p.breed, p.sex,
    case when p.date_of_birth is not null then ((extract(year from age(current_date, p.date_of_birth)) * 12) + extract(month from age(current_date, p.date_of_birth)))::int end,
    p.role, p.trained,
    case when p.show_contact_on_public_id then p.handler_name end,
    case when p.show_contact_on_public_id then p.emergency_contact_name end,
    case when p.show_contact_on_public_id then p.emergency_contact_phone end,
    nullif(right(regexp_replace(coalesce(p.microchip_number,''), '[^0-9A-Za-z]', '', 'g'), 4), ''),
    p.passport_no, p.photo_url,
    (select max(h.expires_on) from public.pet_health_records h where h.pet_id = p.id and h.kind = 'vaccine' and h.name ilike '%rabies%')
  from public.pets p where p.id = get_public_pet_card.pet_id limit 1;
$$;
revoke all on function public.get_public_pet_card(uuid) from public;
grant execute on function public.get_public_pet_card(uuid) to anon, authenticated;

-- 8) community_posts uses column-level read grants (user_id stays hidden); expose the location columns.
grant select (lost_state, lost_city) on public.community_posts to authenticated;
