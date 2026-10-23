-- Closes a hole in the document insert policy.
--
-- The policy only checked that the row belonged to the caller. It did not check
-- the review columns, and PostgREST will happily insert any column the caller
-- names, so a caregiver could upload a file and mark it approved in the same
-- request. Under the old model that was already wrong; now that the caregiver's
-- badge is derived from the documents, it is a way to verify yourself.
--
-- The check is written into the policy rather than a trigger because it is a
-- statement about which rows may be created, which is what a with-check is for.

drop policy "a caregiver may add their own documents" on public.caregiver_documents;

create policy "a caregiver may add their own documents"
  on public.caregiver_documents for insert
  to authenticated
  with check (
    caregiver_id = (select auth.uid())
    and review_status = 'pending'
    and reviewed_by is null
    and reviewed_at is null
  );
