-- Step 3. Run after step3_pet_care.sql. Additive only. Safe to re-run.
-- Issue date and a note on private documents. Owners can replace a file (update).
-- Storage policies are created only when missing, so existing production policies stay.

alter table public.documents
  add column if not exists issued_on date,
  add column if not exists note text;

alter table public.documents drop constraint if exists documents_note_len;
alter table public.documents add constraint documents_note_len check (note is null or char_length(note) <= 500);

grant select (issued_on, note) on public.documents to authenticated;
grant insert (issued_on, note) on public.documents to authenticated;
grant update (issued_on, note, file_url, document_type, expires_on) on public.documents to authenticated;

drop policy if exists "Owner updates own documents" on public.documents;
create policy "Owner updates own documents" on public.documents
  for update to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (pet_id is null or exists (select 1 from public.pets p where p.id = pet_id and p.user_id = auth.uid()))
  );

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can view their own pet documents'
  ) then
    create policy "Users can view their own pet documents" on storage.objects
      for select to authenticated
      using (bucket_id = 'pet-documents' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can upload their own pet documents'
  ) then
    create policy "Users can upload their own pet documents" on storage.objects
      for insert to authenticated
      with check (bucket_id = 'pet-documents' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can delete their own pet documents'
  ) then
    create policy "Users can delete their own pet documents" on storage.objects
      for delete to authenticated
      using (bucket_id = 'pet-documents' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can replace their own pet documents'
  ) then
    create policy "Users can replace their own pet documents" on storage.objects
      for update to authenticated
      using (bucket_id = 'pet-documents' and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id = 'pet-documents' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;
