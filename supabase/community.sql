-- Community MVP. All writes go through SECURITY DEFINER RPCs that enforce
-- auth, rate limits, length, link/contact and profanity filters.
-- Clients never receive user ids or emails: only display names.
create table if not exists public.community_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);
create unique index if not exists community_profiles_name_ci on public.community_profiles (lower(display_name));
alter table public.community_profiles enable row level security;
revoke all on public.community_profiles from anon, authenticated;
grant select (display_name) on public.community_profiles to authenticated;
drop policy if exists "Read own community profile" on public.community_profiles;
create policy "Read own community profile" on public.community_profiles for select to authenticated using (auth.uid() = user_id);

create table if not exists public.community_moderators (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.community_moderators enable row level security;
revoke all on public.community_moderators from anon, authenticated;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  board text not null,
  parent_id uuid references public.community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  title text,
  body text not null,
  pet_id uuid references public.pets(id) on delete set null,
  is_hidden boolean not null default false,
  report_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists community_posts_board on public.community_posts (board, created_at desc);
create index if not exists community_posts_user on public.community_posts (user_id, created_at desc);
alter table public.community_posts enable row level security;
revoke all on public.community_posts from anon, authenticated;
-- Column-level grant: user_id and report_count are never readable by clients.
grant select (id, board, parent_id, author_name, title, body, pet_id, is_hidden, created_at) on public.community_posts to authenticated;

create or replace function public.is_community_moderator() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.community_moderators where user_id = auth.uid());
$$;
revoke all on function public.is_community_moderator() from public, anon;
grant execute on function public.is_community_moderator() to authenticated;

drop policy if exists "Signed-in users read visible posts" on public.community_posts;
create policy "Signed-in users read visible posts" on public.community_posts for select to authenticated
  using (not is_hidden or public.is_community_moderator());

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);
alter table public.community_reports enable row level security;
revoke all on public.community_reports from anon, authenticated;

create or replace function public.community_text_problem(t text) returns text
language plpgsql immutable as $$
begin
  if t is null then return null; end if;
  if t ~* '(https?://|www\.|[a-z0-9-]+\.(com|net|org|io|co|ly|me|gg|xyz|info|biz|app|link|site|shop|us|ca)\M)' then return 'Links aren''t allowed in community posts.'; end if;
  if t ~* '[a-z0-9._%+-]+@[a-z0-9.-]+' then return 'Please don''t post email addresses. Use the Pet ID message button instead.'; end if;
  if t ~ '(\+?1[ .-]?)?\(?\d{3}\)?[ .-]?\d{3}[ .-]?\d{4}' then return 'Please don''t post phone numbers. Use the Pet ID message button instead.'; end if;
  if t ~* '\m(fuck\w*|shit\w*|bitch\w*|cunt\w*|asshole\w*|dick(head)?s?|bastard\w*|motherf\w*|nigg\w*|fag(got)?s?|retard\w*|slut\w*|whore\w*)\M' then return 'Please keep it friendly: that language isn''t allowed.'; end if;
  return null;
end $$;

create or replace function public.set_community_display_name(name text) returns text
language plpgsql security definer set search_path = public as $$
declare n text := btrim(coalesce(name, ''));
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if n !~ '^[A-Za-z0-9][A-Za-z0-9 _.-]{2,23}$' then raise exception 'Display names are 3-24 letters, numbers, spaces, dots, dashes or underscores.'; end if;
  if n ~ '@' or public.community_text_problem(n) is not null then raise exception 'Please choose a different display name.'; end if;
  if exists (select 1 from public.community_profiles where lower(display_name) = lower(n) and user_id <> auth.uid()) then raise exception 'That display name is taken.'; end if;
  insert into public.community_profiles(user_id, display_name) values (auth.uid(), n)
    on conflict (user_id) do update set display_name = excluded.display_name;
  update public.community_posts set author_name = n where user_id = auth.uid();
  return n;
end $$;
revoke all on function public.set_community_display_name(text) from public, anon;
grant execute on function public.set_community_display_name(text) to authenticated;

create or replace function public.create_community_post(board text, body text, title text default null, parent_id uuid default null, pet_id uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); nm text; b text := btrim(coalesce(body,'')); t text := nullif(btrim(coalesce(title,'')), ''); pid uuid; pb text; new_id uuid; prob text;
begin
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
revoke all on function public.create_community_post(text, text, text, uuid, uuid) from public, anon;
grant execute on function public.create_community_post(text, text, text, uuid, uuid) to authenticated;

create or replace function public.report_community_post(post_id uuid, reason text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in to report.'; end if;
  if (select count(*) from public.community_reports where reporter_id = auth.uid() and created_at > now() - interval '1 day') >= 20 then raise exception 'Report limit reached for today.'; end if;
  insert into public.community_reports(post_id, reporter_id, reason) values (post_id, auth.uid(), left(reason, 300)) on conflict do nothing;
  if found then
    update public.community_posts p set report_count = p.report_count + 1,
      is_hidden = p.is_hidden or p.report_count + 1 >= 3   -- auto-hide after 3 reports, pending moderator review
      where p.id = report_community_post.post_id;
  end if;
end $$;
revoke all on function public.report_community_post(uuid, text) from public, anon;
grant execute on function public.report_community_post(uuid, text) to authenticated;

create or replace function public.moderate_community_post(post_id uuid, action text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_community_moderator() then raise exception 'Not allowed.'; end if;
  if action = 'hide' then update public.community_posts set is_hidden = true where id = post_id;
  elsif action = 'unhide' then update public.community_posts set is_hidden = false, report_count = 0 where id = post_id;
  elsif action = 'delete' then delete from public.community_posts where id = post_id;
  else raise exception 'Unknown action.'; end if;
end $$;
revoke all on function public.moderate_community_post(uuid, text) from public, anon;
grant execute on function public.moderate_community_post(uuid, text) to authenticated;

-- Authors can delete their own posts (no user ids are exposed to do this).
create or replace function public.delete_my_community_post(post_id uuid) returns void
language sql security definer set search_path = public as $$
  delete from public.community_posts where id = post_id and user_id = auth.uid();
$$;
revoke all on function public.delete_my_community_post(uuid) from public, anon;
grant execute on function public.delete_my_community_post(uuid) to authenticated;

-- Which of these posts are mine (returns post ids only).
create or replace function public.my_community_post_ids(ids uuid[]) returns setof uuid
language sql stable security definer set search_path = public as $$
  select id from public.community_posts where id = any(ids) and user_id = auth.uid();
$$;
revoke all on function public.my_community_post_ids(uuid[]) from public, anon;
grant execute on function public.my_community_post_ids(uuid[]) to authenticated;

-- Lost & found: is the linked pet still lost? (true/false only)
create or replace function public.community_pets_still_lost(ids uuid[]) returns setof uuid
language sql stable security definer set search_path = public as $$
  select distinct pet_id from public.pet_lost_reports where pet_id = any(ids) and status = 'lost';
$$;
revoke all on function public.community_pets_still_lost(uuid[]) from public;
grant execute on function public.community_pets_still_lost(uuid[]) to authenticated;

-- LAUNCH (public read for SEO) — run when going public:
--   grant select (id, board, parent_id, author_name, title, body, pet_id, is_hidden, created_at) on public.community_posts to anon;
--   create policy "Public reads visible posts" on public.community_posts for select to anon using (not is_hidden);
--   grant execute on function public.community_pets_still_lost(uuid[]) to anon;
