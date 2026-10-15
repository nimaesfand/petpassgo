-- Community is members-only (plus moderators): enforced in RLS and in the write RPCs.
create or replace function public.can_use_community() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_member(auth.uid()) or exists (select 1 from public.community_moderators where user_id = auth.uid());
$$;
revoke all on function public.can_use_community() from public, anon;
grant execute on function public.can_use_community() to authenticated;

drop policy if exists "Signed-in users read visible posts" on public.community_posts;
drop policy if exists "Members read visible posts" on public.community_posts;
create policy "Members read visible posts" on public.community_posts for select to authenticated
  using (public.can_use_community() and (not is_hidden or public.is_community_moderator()));

create or replace function public.community_require_access() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if not public.can_use_community() then raise exception 'Community boards are for members.'; end if;
end $$;
revoke all on function public.community_require_access() from public, anon, authenticated;


create or replace function public.set_community_display_name(name text) returns text
language plpgsql security definer set search_path = public as $$
declare n text := btrim(coalesce(name, ''));
begin
  perform public.community_require_access();
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if n !~ '^[A-Za-z0-9][A-Za-z0-9 _.-]{2,23}$' then raise exception 'Display names are 3-24 letters, numbers, spaces, dots, dashes or underscores.'; end if;
  if n ~ '@' or public.community_text_problem(n) is not null then raise exception 'Please choose a different display name.'; end if;
  if exists (select 1 from public.community_profiles where lower(display_name) = lower(n) and user_id <> auth.uid()) then raise exception 'That display name is taken.'; end if;
  insert into public.community_profiles(user_id, display_name) values (auth.uid(), n)
    on conflict (user_id) do update set display_name = excluded.display_name;
  update public.community_posts set author_name = n where user_id = auth.uid();
  return n;
end $$;

create or replace function public.create_community_post(board text, body text, title text default null, parent_id uuid default null, pet_id uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); nm text; b text := btrim(coalesce(body,'')); t text := nullif(btrim(coalesce(title,'')), ''); pid uuid; pb text; new_id uuid; prob text;
begin
  perform public.community_require_access();
  if uid is null then raise exception 'Sign in to post.'; end if;
  select display_name into nm from public.community_profiles where user_id = uid;
  if nm is null then raise exception 'Choose a display name first.'; end if;
  if board not in ('delta','american-airlines','united','southwest','jetblue','alaska-airlines','hawaiian-airlines','frontier','allegiant','sun-country','lost-and-found') then raise exception 'Unknown board.'; end if;
  if length(b) < 2 or length(b) > 2000 then raise exception 'Posts must be 2-2000 characters.'; end if;
  if parent_id is null and (t is null or length(t) < 4 or length(t) > 120) then raise exception 'Add a title (4-120 characters).'; end if;
  prob := coalesce(public.community_text_problem(b), public.community_text_problem(t));
  if prob is not null then raise exception '%', prob; end if;
  if (select count(*) from public.community_posts p where p.user_id = uid and p.created_at > now() - interval '10 minutes') >= 5
     or (select count(*) from public.community_posts p where p.user_id = uid and p.created_at > now() - interval '1 day') >= 30 then
    raise exception 'You''re posting a lot. Please wait a few minutes.'; end if;
  if parent_id is not null then
    select p.board into pb from public.community_posts p where p.id = create_community_post.parent_id and p.parent_id is null and not p.is_hidden;
    if pb is null or pb <> board then raise exception 'That thread isn''t available.'; end if;
    t := null;
  end if;
  if pet_id is not null then
    if board <> 'lost-and-found' or create_community_post.parent_id is not null then raise exception 'Pets can only be linked in a new Lost & found post.'; end if;
    select r.pet_id into pid from public.pet_lost_reports r where r.pet_id = create_community_post.pet_id and r.user_id = uid and r.status = 'lost' limit 1;
    if pid is null then raise exception 'Mark your pet as lost first.'; end if;
  end if;
  insert into public.community_posts(board, parent_id, user_id, author_name, title, body, pet_id)
    values (board, create_community_post.parent_id, uid, nm, t, b, pid) returning id into new_id;
  return new_id;
end $$;

create or replace function public.report_community_post(post_id uuid, reason text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform public.community_require_access();
  if auth.uid() is null then raise exception 'Sign in to report.'; end if;
  if (select count(*) from public.community_reports where reporter_id = auth.uid() and created_at > now() - interval '1 day') >= 20 then raise exception 'Report limit reached for today.'; end if;
  insert into public.community_reports(post_id, reporter_id, reason) values (post_id, auth.uid(), left(reason, 300)) on conflict do nothing;
  if found then
    update public.community_posts p set report_count = p.report_count + 1,
      is_hidden = p.is_hidden or p.report_count + 1 >= 3   -- auto-hide after 3 reports, pending moderator review
      where p.id = report_community_post.post_id;
  end if;
end $$;
