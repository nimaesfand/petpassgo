-- Run in the Supabase SQL Editor ONLY AFTER the "private documents" PR is merged
-- and deployed. Before that, the live site still uses public URLs.

-- 1) Make the bucket private (public URLs stop working; app uses signed URLs).
update storage.buckets set public = false where id = 'pet-documents';

-- 2) Ownership policies. These already exist in production (checked 2026-10-14):
--    SELECT / INSERT / DELETE where (storage.foldername(name))[1] = auth.uid()::text
--    Paths are "<userId>/<petId>/<file>", so users only reach their own folder.
--    Re-create them only if missing:
-- create policy "Users can view their own pet documents" on storage.objects
--   for select to authenticated
--   using (bucket_id = 'pet-documents' and (storage.foldername(name))[1] = auth.uid()::text);
-- create policy "Users can upload their own pet documents" on storage.objects
--   for insert to authenticated
--   with check (bucket_id = 'pet-documents' and (storage.foldername(name))[1] = auth.uid()::text);
-- create policy "Users can delete their own pet documents" on storage.objects
--   for delete to authenticated
--   using (bucket_id = 'pet-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Rollback: update storage.buckets set public = true where id = 'pet-documents';
