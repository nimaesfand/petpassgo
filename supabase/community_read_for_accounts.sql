-- Any signed-in account can READ visible community posts.
-- Posting, replies, display name, and reports stay members-only (can_use_community).

alter table public.community_posts
  add column if not exists post_type text;

alter table public.community_posts
  drop constraint if exists community_posts_post_type_check;

alter table public.community_posts
  add constraint community_posts_post_type_check
  check (post_type is null or post_type in ('tip','experience','question'));

grant select (id, board, parent_id, author_name, title, body, pet_id, is_hidden, created_at, post_type)
  on public.community_posts to authenticated;

-- Read: any authenticated user (hidden only for mods)
drop policy if exists "Members read visible posts" on public.community_posts;
drop policy if exists "Signed-in users read visible posts" on public.community_posts;
create policy "Signed-in users read visible posts" on public.community_posts
  for select to authenticated
  using (
    auth.uid() is not null
    and (not is_hidden or public.is_community_moderator())
  );

-- can_use_community stays members-only (used by write RPCs)
create or replace function public.can_use_community() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_member(auth.uid()) or exists (select 1 from public.community_moderators where user_id = auth.uid());
$$;
revoke all on function public.can_use_community() from public, anon;
grant execute on function public.can_use_community() to authenticated;

-- Writers still require membership
create or replace function public.community_require_access() returns void
language plpgsql stable security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if not public.can_use_community() then raise exception 'Join as a member to post in the community.'; end if;
end $$;
revoke all on function public.community_require_access() from public, anon, authenticated;

-- create_community_post accepts optional post_type for top-level posts
create or replace function public.create_community_post(
  board text,
  body text,
  title text default null,
  parent_id uuid default null,
  pet_id uuid default null,
  post_type text default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  nm text;
  b text := btrim(coalesce(body,''));
  t text := nullif(btrim(coalesce(title,'')), '');
  pid uuid;
  pb text;
  new_id uuid;
  prob text;
  ptype text := nullif(lower(btrim(coalesce(post_type,''))), '');
begin
  perform public.community_require_access();
  if uid is null then raise exception 'Sign in to post.'; end if;
  select display_name into nm from public.community_profiles where user_id = uid;
  if nm is null then raise exception 'Choose a display name first.'; end if;
  if board not in ('delta','american-airlines','united','southwest','jetblue','alaska-airlines','hawaiian-airlines','frontier','allegiant','sun-country','aeromexico','volaris','viva-aerobus','lost-and-found') then
    raise exception 'Unknown board.';
  end if;
  if length(b) < 2 or length(b) > 2000 then raise exception 'Posts must be 2-2000 characters.'; end if;
  if parent_id is null and (t is null or length(t) < 4 or length(t) > 120) then
    raise exception 'Add a title (4-120 characters).';
  end if;
  if parent_id is null then
    if ptype is null or ptype not in ('tip','experience','question') then
      raise exception 'Choose a post type: Tip, Experience, or Question.';
    end if;
  else
    ptype := null;
  end if;
  prob := coalesce(public.community_text_problem(b), public.community_text_problem(t));
  if prob is not null then raise exception '%', prob; end if;
  if (select count(*) from public.community_posts p where p.user_id = uid and p.created_at > now() - interval '10 minutes') >= 5
     or (select count(*) from public.community_posts p where p.user_id = uid and p.created_at > now() - interval '1 day') >= 30 then
    raise exception 'You''re posting a lot. Please wait a few minutes.';
  end if;
  if parent_id is not null then
    select p.board into pb from public.community_posts p
      where p.id = create_community_post.parent_id and p.parent_id is null and not p.is_hidden;
    if pb is null or pb <> board then raise exception 'That thread isn''t available.'; end if;
    t := null;
  end if;
  if pet_id is not null then
    if board <> 'lost-and-found' or create_community_post.parent_id is not null then
      raise exception 'Pets can only be linked in a new Lost & found post.';
    end if;
    select r.pet_id into pid from public.pet_lost_reports r
      where r.pet_id = create_community_post.pet_id and r.user_id = uid and r.status = 'lost' limit 1;
    if pid is null then raise exception 'Mark your pet as lost first.'; end if;
  end if;
  insert into public.community_posts(board, parent_id, user_id, author_name, title, body, pet_id, post_type)
    values (board, create_community_post.parent_id, uid, nm, t, b, pid, ptype)
    returning id into new_id;
  return new_id;
end $$;
