-- Applied 2026-11-08. Additive only.
alter table public.pets add column if not exists passport_issued_at timestamptz;
comment on column public.pets.passport_issued_at is 'Set once, the first time the owner sees the passport-issue moment after the profile is complete.';
