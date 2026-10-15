-- Lost-pet MVP (applied via migration "lost_pet_mvp").
create table if not exists public.pet_lost_reports (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  user_id uuid not null,
  status text not null default 'lost' check (status in ('lost','reunited')),
  last_seen_area text check (char_length(last_seen_area) <= 120),
  last_seen_date date,
  note text check (char_length(note) <= 500),
  trip_airline text check (char_length(trip_airline) <= 60),
  trip_flight text check (char_length(trip_flight) <= 20),
  trip_destination text check (char_length(trip_destination) <= 120),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create unique index if not exists pet_lost_one_active on public.pet_lost_reports(pet_id) where status = 'lost';
alter table public.pet_lost_reports enable row level security;
create policy "Owner reads own lost reports" on public.pet_lost_reports for select to authenticated using (auth.uid() = user_id);
create policy "Owner creates lost report for own pet" on public.pet_lost_reports for insert to authenticated
  with check (auth.uid() = user_id and exists (select 1 from public.pets p where p.id = pet_id and p.user_id = auth.uid()));
create policy "Owner updates own lost report" on public.pet_lost_reports for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.pet_lost_reports to authenticated;

-- Finder -> owner messages. Anyone may insert (RLS + trigger limits); only the pet's owner may read/delete.
create table if not exists public.finder_messages (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  message text not null check (char_length(message) between 2 and 1000),
  finder_contact text check (char_length(finder_contact) <= 200),
  sender_hash text check (char_length(sender_hash) <= 64),
  created_at timestamptz not null default now()
);
create index if not exists finder_messages_pet_time on public.finder_messages(pet_id, created_at desc);
alter table public.finder_messages enable row level security;
create policy "Anyone can message an existing pet" on public.finder_messages for insert to anon, authenticated
  with check (exists (select 1 from public.pets p where p.id = pet_id));
create policy "Owner reads messages for own pets" on public.finder_messages for select to authenticated
  using (exists (select 1 from public.pets p where p.id = pet_id and p.user_id = auth.uid()));
create policy "Owner deletes messages for own pets" on public.finder_messages for delete to authenticated
  using (exists (select 1 from public.pets p where p.id = pet_id and p.user_id = auth.uid()));
grant insert on public.finder_messages to anon, authenticated;
grant select, delete on public.finder_messages to authenticated;

create or replace function public.finder_message_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.created_at := now();
  new.message := btrim(new.message);
  -- basic spam: at most 2 links
  if (select count(*) from regexp_matches(new.message, 'https?://|www\.', 'gi')) > 2 then
    raise exception 'Message looks like spam' using errcode = 'P0001';
  end if;
  if (select count(*) from public.finder_messages where pet_id = new.pet_id and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'Too many messages for this pet, try again later' using errcode = 'P0001';
  end if;
  if new.sender_hash is not null and (select count(*) from public.finder_messages
      where sender_hash = new.sender_hash and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'Too many messages, try again later' using errcode = 'P0001';
  end if;
  return new;
end $$;
drop trigger if exists finder_message_guard on public.finder_messages;
create trigger finder_message_guard before insert on public.finder_messages for each row execute function public.finder_message_guard();

-- Scan log while lost: coarse city/region only.
create table if not exists public.pet_scans (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  report_id uuid references public.pet_lost_reports(id) on delete cascade,
  area text check (char_length(area) <= 120),
  scanned_at timestamptz not null default now()
);
alter table public.pet_scans enable row level security;
create policy "Owner reads scans of own pets" on public.pet_scans for select to authenticated
  using (exists (select 1 from public.pets p where p.id = pet_id and p.user_id = auth.uid()));
grant select on public.pet_scans to authenticated;

create or replace function public.log_pet_scan(pet_id uuid, area text default null) returns void
language plpgsql security definer set search_path = public as $$
declare r uuid;
begin
  select id into r from public.pet_lost_reports l where l.pet_id = log_pet_scan.pet_id and l.status = 'lost';
  if r is null then return; end if;  -- only log while lost
  if (select count(*) from public.pet_scans s where s.report_id = r and s.scanned_at > now() - interval '1 hour') >= 60 then return; end if;
  insert into public.pet_scans(pet_id, report_id, area) values (log_pet_scan.pet_id, r, left(nullif(btrim(area), ''), 120));
end $$;
revoke all on function public.log_pet_scan(uuid, text) from public;
grant execute on function public.log_pet_scan(uuid, text) to anon, authenticated;

-- Public lost info for the poster (only while lost).
create or replace function public.get_public_lost_report(pet_id uuid)
returns table(last_seen_area text, last_seen_date date, note text, trip_airline text, trip_flight text, trip_destination text, reported_at timestamptz)
language sql stable security definer set search_path = public as $$
  select l.last_seen_area, l.last_seen_date, l.note, l.trip_airline, l.trip_flight, l.trip_destination, l.created_at
  from public.pet_lost_reports l where l.pet_id = get_public_lost_report.pet_id and l.status = 'lost' limit 1;
$$;
grant execute on function public.get_public_lost_report(uuid) to anon, authenticated;

-- Reunited: close the case and clean up location data.
create or replace function public.mark_pet_reunited(pet_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.pets p where p.id = mark_pet_reunited.pet_id and p.user_id = auth.uid()) then
    raise exception 'Not your pet' using errcode = '42501';
  end if;
  update public.pet_lost_reports set status = 'reunited', resolved_at = now(),
    last_seen_area = null, note = null, trip_flight = null
  where pet_lost_reports.pet_id = mark_pet_reunited.pet_id and status = 'lost';
  delete from public.pet_scans s where s.pet_id = mark_pet_reunited.pet_id;
end $$;
revoke all on function public.mark_pet_reunited(uuid) from public;
grant execute on function public.mark_pet_reunited(uuid) to authenticated;

-- Follow-up migration "finder_messages_pet_exists": anon can't read pets under RLS,
-- so the insert check uses a SECURITY DEFINER existence helper.
create or replace function public.pet_exists(pid uuid) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.pets where id = pid) $$;
revoke all on function public.pet_exists(uuid) from public;
grant execute on function public.pet_exists(uuid) to anon, authenticated;
alter policy "Anyone can message an existing pet" on public.finder_messages with check (public.pet_exists(pet_id));
