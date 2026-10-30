-- The counties, languages and conditions lists, and the check that keeps them
-- honest without six tables.
--
-- These three are multi-select answers with fixed vocabularies. The obvious
-- shape is a reference table plus a join table each, which is what `needs` and
-- `supports` have. They are not that here, for four reasons:
--
--   1. Nothing joins on them. No row in either list carries an attribute beyond
--      a slug and a position.
--   2. They are shared by nothing. `needs` is a table because both a child and a
--      caregiver point at the same rows; these are asked of a caregiver only.
--   3. The labels are product copy, not data. They live in
--      `src/lib/caregiver/answers.ts` beside `DOCUMENT_KINDS`, which is where
--      every other closed set in this app already lives.
--   4. A filter over them is `counties && array['contra_costa']`, which a GIN
--      index answers exactly as well as a join would.
--
-- The cost of dropping the tables is that a foreign key can no longer reject a
-- typo. That is what this predicate is for.

-- ---------------------------------------------------------------------------
-- The predicate
-- ---------------------------------------------------------------------------

-- `immutable`, because a check constraint may only call a function that is. It
-- reads nothing, so the claim is true: the same two arrays always give the same
-- answer.
--
-- An empty array is valid, and so is a null, which a `coalesce` turns into an
-- empty array. `bool_and` over no rows returns null, which is why the
-- `coalesce` outside it is doing real work rather than decorating.
create or replace function private.valid_slugs(p_values text[], p_allowed text[])
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(bool_and(v = any (p_allowed)), true)
  from unnest(coalesce(p_values, '{}')) as v;
$$;

-- No revoke here, unlike the helpers in the policy migration. This one runs as
-- the calling role inside a check constraint, so `authenticated` genuinely needs
-- EXECUTE or every write to these columns fails with permission denied. It
-- returns one boolean and reads no data, so there is nothing behind it to
-- protect.
grant execute on function private.valid_slugs(text[], text[]) to authenticated;

-- ---------------------------------------------------------------------------
-- The allowed values
-- ---------------------------------------------------------------------------

-- The six counties the form names, plus `other`. Written inline in each
-- constraint rather than passed in, because that is what keeps the function
-- immutable and the check legal.
--
-- Adding a county is a migration. That is the trade: a migration when the list
-- changes, instead of a join on every read.

alter table public.caregivers drop constraint if exists caregivers_counties_check;
alter table public.caregivers
  add constraint caregivers_counties_check
  check (
    private.valid_slugs(
      counties,
      array['san_francisco', 'san_mateo', 'santa_clara', 'alameda', 'contra_costa', 'marin', 'other']
    )
  );

alter table public.caregivers drop constraint if exists caregivers_languages_check;
alter table public.caregivers
  add constraint caregivers_languages_check
  check (
    private.valid_slugs(
      languages,
      array['english', 'spanish', 'mandarin', 'cantonese', 'vietnamese', 'tagalog', 'other']
    )
  );

-- The fifteen areas on the form. Seven of them rhyme with an entry in `needs` or
-- `supports` — feeding, toileting, transfers, medication, communication,
-- behaviour, sensory — and they are kept anyway, because the paper form is the
-- source of truth and because they answer a different question: a condition is
-- what a caregiver has worked with, a support is what they will do on a shift.
alter table public.caregivers drop constraint if exists caregivers_conditions_check;
alter table public.caregivers
  add constraint caregivers_conditions_check
  check (
    private.valid_slugs(
      conditions,
      array[
        'autism',
        'down_syndrome',
        'cerebral_palsy',
        'intellectual_disability',
        'adhd',
        'epilepsy',
        'non_verbal_communication',
        'challenging_behaviours',
        'sensory_processing',
        'feeding_support',
        'toileting_personal_care',
        'lifting_transfers',
        'medication_reminders',
        'behaviour_plan_aba',
        'other'
      ]
    )
  );
