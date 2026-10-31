-- Pet profile fields, PetPassGo ID (PPG-XXX-XXXX), housing notes, public visibility,
-- community author pets, and promo-email consent. No email is sent from here.

-- ---------------------------------------------------------------------------
-- PetPassGo ID: 7 random digits, PPG-XXX-XXXX. Not sequential. Locked once set.
-- Existing values that aren't already in this shape are replaced once.
-- ---------------------------------------------------------------------------
create or replace function public.generate_pet_passport_no() returns text
language plpgsql volatile set search_path = public as $$
declare
  n int;
  candidate text;
begin
  loop
    n := floor(random() * 10000000)::int;
    candidate := 'PPG-' || lpad((n / 10000)::text, 3, '0') || '-' || lpad((n % 10000)::text, 4, '0');
    exit when not exists (select 1 from public.pets where passport_no = candidate);
  end loop;
  return candidate;
end $$;

alter table public.pets disable trigger pets_passport_no_guard;
do $$
declare r record;
begin
  for r in select id from public.pets where passport_no is null or passport_no !~ '^PPG-[0-9]{3}-[0-9]{4}$' loop
    update public.pets set passport_no = public.generate_pet_passport_no() where id = r.id;
  end loop;
end $$;
alter table public.pets enable trigger pets_passport_no_guard;

-- ---------------------------------------------------------------------------
-- Profile fields and visibility. Contact, medical, documents, housing, and
-- travel stay off the public page until the owner turns them on.
-- ---------------------------------------------------------------------------
alter table public.pets
  add column if not exists color text,
  add column if not exists allergies text,
  add column if not exists medications text,
  add column if not exists about_bio text,
  add column if not exists housing_notes text,
  add column if not exists show_medical_on_public boolean not null default false,
  add column if not exists show_documents_on_public boolean not null default false,
  add column if not exists show_housing_on_public boolean not null default false,
  add column if not exists show_travel_on_public boolean not null default false,
  add column if not exists public_slug text;

alter table public.pets drop constraint if exists pets_color_len;
alter table public.pets add constraint pets_color_len check (color is null or char_length(color) <= 80);
alter table public.pets drop constraint if exists pets_allergies_len;
alter table public.pets add constraint pets_allergies_len check (allergies is null or char_length(allergies) <= 500);
alter table public.pets drop constraint if exists pets_medications_len;
alter table public.pets add constraint pets_medications_len check (medications is null or char_length(medications) <= 500);
alter table public.pets drop constraint if exists pets_about_len;
alter table public.pets add constraint pets_about_len check (about_bio is null or char_length(about_bio) <= 1000);
alter table public.pets drop constraint if exists pets_housing_notes_len;
alter table public.pets add constraint pets_housing_notes_len check (housing_notes is null or char_length(housing_notes) <= 2000);

create or replace function public.pet_slug_base(pet_name text, pet_id uuid) returns text
language plpgsql immutable set search_path = public as $$
declare
  base text;
begin
  base := lower(regexp_replace(coalesce(pet_name, ''), '[^a-zA-Z0-9]+', '-', 'g'));
  base := trim(both '-' from base);
  if base = '' or length(base) < 2 then base := 'pet'; end if;
  return left(base, 40) || '-' || substr(replace(pet_id::text, '-', ''), 1, 6);
end $$;

create or replace function public.pets_public_slug_guard() returns trigger
language plpgsql set search_path = public as $$
declare
  candidate text;
  n int := 0;
begin
  if tg_op = 'UPDATE' and old.public_slug is not null and btrim(old.public_slug) <> '' then
    new.public_slug := old.public_slug;
    return new;
  end if;
  if new.public_slug is not null and btrim(new.public_slug) <> '' then
    new.public_slug := lower(btrim(new.public_slug));
    return new;
  end if;
  if new.id is null then new.id := gen_random_uuid(); end if;
  candidate := public.pet_slug_base(new.name, new.id);
  while exists (select 1 from public.pets where public_slug = candidate and id is distinct from new.id) loop
    n := n + 1;
    candidate := public.pet_slug_base(new.name, new.id) || '-' || n;
  end loop;
  new.public_slug := candidate;
  return new;
end $$;

drop trigger if exists pets_public_slug_guard on public.pets;
create trigger pets_public_slug_guard before insert or update on public.pets
for each row execute function public.pets_public_slug_guard();

do $$
declare r record;
begin
  for r in select id from public.pets where public_slug is null or btrim(public_slug) = '' loop
    update public.pets set name = name where id = r.id;
  end loop;
end $$;

create unique index if not exists pets_public_slug_key on public.pets (public_slug);
alter table public.pets alter column public_slug set not null;

-- ---------------------------------------------------------------------------
-- Public reads. Phone numbers stay off unless the emergency-contact toggle is on.
-- Medical, housing notes, and travel trips follow their own toggles.
-- ---------------------------------------------------------------------------
drop function if exists public.get_public_pet_id(uuid);
create function public.get_public_pet_id(pet_id uuid)
returns table (
  id uuid, name text, animal_type text, breed text, photo_path text,
  emergency_contact_name text, emergency_contact_phone text, microchipped boolean, passport_no text,
  color text, sex text, date_of_birth date, weight_lb numeric, role text, public_slug text, about_bio text,
  allergies text, medications text, vet_name text, vet_phone text, housing_notes text, handler_name text
)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.animal_type, p.breed, p.photo_url,
    case when p.show_contact_on_public_id then p.emergency_contact_name end,
    case when p.show_contact_on_public_id then p.emergency_contact_phone end,
    (p.microchip_number is not null and btrim(p.microchip_number) <> '')::boolean,
    p.passport_no,
    nullif(btrim(p.color), ''),
    nullif(btrim(p.sex), ''),
    p.date_of_birth,
    p.weight_lb,
    p.role,
    p.public_slug,
    nullif(btrim(p.about_bio), ''),
    case when p.show_medical_on_public then nullif(btrim(p.allergies), '') end,
    case when p.show_medical_on_public then nullif(btrim(p.medications), '') end,
    case when p.show_medical_on_public then nullif(btrim(p.vet_name), '') end,
    case when p.show_medical_on_public then nullif(btrim(p.vet_phone), '') end,
    case when p.show_housing_on_public then nullif(btrim(p.housing_notes), '') end,
    case when p.show_contact_on_public_id then nullif(btrim(p.handler_name), '') end
  from public.pets p where p.id = get_public_pet_id.pet_id limit 1;
$$;
revoke all on function public.get_public_pet_id(uuid) from public;
grant execute on function public.get_public_pet_id(uuid) to anon, authenticated;

drop function if exists public.get_public_pet_by_slug(text);
create function public.get_public_pet_by_slug(slug text)
returns table (
  id uuid, name text, animal_type text, breed text, photo_path text,
  emergency_contact_name text, emergency_contact_phone text, microchipped boolean, passport_no text,
  color text, sex text, date_of_birth date, weight_lb numeric, role text, public_slug text, about_bio text,
  allergies text, medications text, vet_name text, vet_phone text, housing_notes text, handler_name text
)
language sql stable security definer set search_path = public as $$
  select g.*
  from public.pets p
  cross join lateral public.get_public_pet_id(p.id) g
  where p.public_slug = lower(btrim(slug))
  limit 1;
$$;
revoke all on function public.get_public_pet_by_slug(text) from public;
grant execute on function public.get_public_pet_by_slug(text) to anon, authenticated;

create or replace function public.get_public_pet_health(pet_id uuid)
returns table (kind text, name text, expires_on date)
language sql stable security definer set search_path = public as $$
  select h.kind, h.name, h.expires_on
  from public.pet_health_records h
  join public.pets p on p.id = h.pet_id
  where p.id = get_public_pet_health.pet_id
    and p.show_medical_on_public
    and h.show_to_finder
  order by h.expires_on nulls last, h.created_at;
$$;
revoke all on function public.get_public_pet_health(uuid) from public;
grant execute on function public.get_public_pet_health(uuid) to anon, authenticated;

drop function if exists public.get_public_pet_documents(uuid);
create function public.get_public_pet_documents(pet_id uuid)
returns table (id uuid, document_type text, expires_on date)
language sql stable security definer set search_path = public as $$
  select d.id, d.document_type, d.expires_on
  from public.documents d
  join public.pets p on p.id = d.pet_id
  where p.id = get_public_pet_documents.pet_id
    and (
      (p.show_documents_on_public and d.document_type not in (
        'Landlord or HOA pet approval', 'Lease pet addendum', 'Pet references', 'Rental pet resume', 'Renter''s pet insurance'
      ))
      or
      (p.show_housing_on_public and d.document_type in (
        'Landlord or HOA pet approval', 'Lease pet addendum', 'Pet references', 'Rental pet resume', 'Renter''s pet insurance'
      ))
    )
  order by d.uploaded_at desc;
$$;
revoke all on function public.get_public_pet_documents(uuid) from public;
grant execute on function public.get_public_pet_documents(uuid) to anon, authenticated;

drop function if exists public.get_public_pet_travel(uuid);
create function public.get_public_pet_travel(pet_id uuid)
returns table (
  id uuid, origin text, destination text, travel_date date, return_date date, airline text, steps_done int
)
language sql stable security definer set search_path = public as $$
  select t.id, t.origin, t.destination, t.travel_date, t.return_date, t.airline,
    coalesce((select count(*)::int from public.trip_requirement_status s where s.trip_id = t.id and s.completed is true), 0)
  from public.trips t
  join public.pets p on p.id = t.pet_id
  where p.id = get_public_pet_travel.pet_id
    and p.show_travel_on_public
    and t.paid is true
  order by t.travel_date desc nulls last;
$$;
revoke all on function public.get_public_pet_travel(uuid) from public;
grant execute on function public.get_public_pet_travel(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Community: each post can carry the author's chosen pet. Readers only receive
-- photo / name / breed / type through community_post_pets.
-- ---------------------------------------------------------------------------
alter table public.community_posts
  add column if not exists profile_pet_id uuid references public.pets(id) on delete set null;

drop function if exists public.create_community_post(text, text, text, uuid, uuid);
drop function if exists public.create_community_post(text, text, text, uuid, uuid, text);

create function public.create_community_post(
  board text,
  body text,
  title text default null,
  parent_id uuid default null,
  pet_id uuid default null,
  post_type text default null,
  profile_pet_id uuid default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  nm text;
  b text := btrim(coalesce(body, ''));
  t text := nullif(btrim(coalesce(title, '')), '');
  pid uuid;
  ppid uuid;
  pb text;
  new_id uuid;
  prob text;
  ptype text := nullif(lower(btrim(coalesce(post_type, ''))), '');
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
  if create_community_post.profile_pet_id is not null then
    select x.id into ppid from public.pets x where x.id = create_community_post.profile_pet_id and x.user_id = uid;
  end if;
  insert into public.community_posts(board, parent_id, user_id, author_name, title, body, pet_id, post_type, profile_pet_id)
    values (board, create_community_post.parent_id, uid, nm, t, b, pid, ptype, ppid)
    returning id into new_id;
  return new_id;
end $$;
revoke all on function public.create_community_post(text, text, text, uuid, uuid, text, uuid) from public, anon;
grant execute on function public.create_community_post(text, text, text, uuid, uuid, text, uuid) to authenticated;

drop function if exists public.community_post_pets(uuid[]);
create function public.community_post_pets(ids uuid[])
returns table (post_id uuid, pet_id uuid, name text, breed text, animal_type text, has_photo boolean)
language sql stable security definer set search_path = public as $$
  select p.id,
    pet.id,
    pet.name,
    pet.breed,
    pet.animal_type,
    (pet.photo_url is not null and btrim(pet.photo_url) <> '')
  from public.community_posts p
  join lateral (
    select pt.id, pt.name, pt.breed, pt.animal_type, pt.photo_url
    from public.pets pt
    where pt.user_id = p.user_id
      and pt.id = coalesce(
        (select x.id from public.pets x where x.id = p.profile_pet_id and x.user_id = p.user_id),
        (select x.id from public.pets x where x.id = p.pet_id and x.user_id = p.user_id),
        (select x.id from public.pets x where x.user_id = p.user_id order by x.created_at asc limit 1)
      )
    limit 1
  ) pet on true
  where p.id = any(ids)
    and public.can_use_community();
$$;
revoke all on function public.community_post_pets(uuid[]) from public, anon;
grant execute on function public.community_post_pets(uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- Promo email consent. Existing accounts are not opted in. Unsubscribe is by token.
-- ---------------------------------------------------------------------------
create table if not exists public.user_marketing (
  user_id uuid primary key references auth.users(id) on delete cascade,
  marketing_opt_in boolean not null default false,
  marketing_opt_in_at timestamptz,
  marketing_opt_in_source text,
  unsubscribe_token text not null unique,
  updated_at timestamptz not null default now(),
  constraint user_marketing_source_check check (
    marketing_opt_in_source is null
    or marketing_opt_in_source in ('signup', 'join', 'checkout', 'account', 'unsubscribe')
  )
);
alter table public.user_marketing enable row level security;
revoke all on public.user_marketing from public, anon, authenticated;

insert into public.user_marketing (user_id, unsubscribe_token)
select u.id, replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
from auth.users u
where not exists (select 1 from public.user_marketing m where m.user_id = u.id);

create or replace function public.ensure_user_marketing() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_marketing (user_id, unsubscribe_token)
  values (new.id, replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_marketing on auth.users;
create trigger on_auth_user_marketing
after insert on auth.users
for each row execute function public.ensure_user_marketing();

create or replace function public.my_marketing()
returns table (
  marketing_opt_in boolean,
  marketing_opt_in_at timestamptz,
  marketing_opt_in_source text,
  unsubscribe_token text
)
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  insert into public.user_marketing (user_id, unsubscribe_token)
  values (auth.uid(), replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''))
  on conflict (user_id) do nothing;
  return query
    select m.marketing_opt_in, m.marketing_opt_in_at, m.marketing_opt_in_source, m.unsubscribe_token
    from public.user_marketing m where m.user_id = auth.uid();
end $$;
revoke all on function public.my_marketing() from public, anon;
grant execute on function public.my_marketing() to authenticated;

create or replace function public.set_marketing_opt_in(opt_in boolean, source text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if source not in ('signup', 'join', 'checkout', 'account') then raise exception 'Unknown source.'; end if;
  insert into public.user_marketing (user_id, unsubscribe_token, marketing_opt_in, marketing_opt_in_at, marketing_opt_in_source)
  values (auth.uid(), replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''), coalesce(opt_in, false), now(), source)
  on conflict (user_id) do update set
    marketing_opt_in = excluded.marketing_opt_in,
    marketing_opt_in_at = now(),
    marketing_opt_in_source = excluded.marketing_opt_in_source,
    updated_at = now();
end $$;
revoke all on function public.set_marketing_opt_in(boolean, text) from public, anon;
grant execute on function public.set_marketing_opt_in(boolean, text) to authenticated;

create or replace function public.unsubscribe_marketing(token text) returns boolean
language plpgsql security definer set search_path = public as $$
begin
  if token is null or length(btrim(token)) < 20 then return false; end if;
  update public.user_marketing
    set marketing_opt_in = false,
        marketing_opt_in_at = now(),
        marketing_opt_in_source = 'unsubscribe',
        updated_at = now()
    where unsubscribe_token = btrim(token);
  return exists (select 1 from public.user_marketing where unsubscribe_token = btrim(token));
end $$;
revoke all on function public.unsubscribe_marketing(text) from public;
grant execute on function public.unsubscribe_marketing(text) to anon, authenticated;

alter table public.guest_checkouts
  add column if not exists marketing_opt_in boolean not null default false;
