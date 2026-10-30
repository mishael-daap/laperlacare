-- Approved now means background-checked.
--
-- The paper application says, in its own words, that "every Perla Care caregiver
-- completes a background check before their profile goes live". Until now the
-- badge was derived from documents in general, so a caregiver with one approved
-- CPR card and nothing else read as Approved — which is the sentence in the
-- application being false.
--
-- The change is one clause. Everything else about the rule is untouched: a
-- rejection still outranks everything, expiry is still compared against today
-- on every read, and the answer is still computed rather than stored.
--
-- A background check with an expiry is handled by the same comparison as any
-- other document, so an expired clearance drops the caregiver out of Approved
-- the moment the date passes, with no job and no stored copy to fall behind.

create or replace function private.caregiver_status(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    -- A rejection is still the one thing that cannot be argued with.
    when exists (
      select 1
      from public.caregiver_documents d
      where d.caregiver_id = p_user_id
        and d.review_status = 'rejected'
    ) then 'rejected'

    -- Every live document is approved and unexpired...
    when exists (
      select 1
      from public.caregiver_documents d
      where d.caregiver_id = p_user_id
    ) and not exists (
      select 1
      from public.caregiver_documents d
      where d.caregiver_id = p_user_id
        and (
          d.review_status <> 'approved'
          or (d.expires_at is not null and d.expires_at < current_date)
        )
    )
    -- ...and one of them is a background check. The clause above already
    -- guarantees that any background check on file is approved and unexpired,
    -- so this only has to prove one exists.
    and exists (
      select 1
      from public.caregiver_documents d
      where d.caregiver_id = p_user_id
        and d.kind = 'background_check'
    ) then 'approved'

    else 'pending'
  end;
$$;
