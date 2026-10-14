-- The avatars bucket.
--
-- Public, and deliberately so: a caregiver's photo sits on a public catalog, so
-- a signed URL would protect nothing while costing a round trip per render.
-- "Public" means anyone holding the URL can fetch the file. Paths are
-- <user_id>/<filename>, and user ids are UUIDs, so a URL is hard to find rather
-- than protected. Nothing sensitive belongs in this bucket.
--
-- No child photos are stored anywhere.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,                                            -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- The size cap and the MIME list above are the real enforcement. Client-side
-- checks exist only so the user gets a decent error message; a hand-crafted
-- request is stopped here.

create policy "avatars are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'avatars');

-- The folder check is what stops one user writing into another's directory.
-- storage.foldername(name) splits the object path, so [1] is the first segment.
-- It must equal the caller's own auth id.
create policy "a user may upload into their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "a user may replace their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Needed because replacing an avatar writes a new versioned filename, leaving
-- the old object behind. Deleting it is how that gets cleaned up.
create policy "a user may delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
