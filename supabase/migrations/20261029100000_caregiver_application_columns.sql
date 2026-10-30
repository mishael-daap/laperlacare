-- Everything a caregiver is asked, from the paper application the team already
-- sends out.
--
-- The split this migration follows: the facts that change often — rate, area,
-- languages, transport, pets, smoking — sit on the caregiver's own page and are
-- editable at any time. The facts we take down once and review — legal name,
-- experience, references, the written answers, the signature — sit on the
-- application page and lock on submission. Both sets are columns on the same
-- row, because a caregiver *is* the application; there is no anonymous
-- applicant, and the account is created before any of this is asked.
--
-- Every column is nullable or defaulted. A caregiver row is created at sign-up,
-- before any of these questions have been put to them, and a half-filled
-- application has to be storable at every point along the way.

-- ---------------------------------------------------------------------------
-- Work details
-- ---------------------------------------------------------------------------

-- Whole dollars. The form prints a $25–40 range as a hint; the bounds here are
-- only wide enough to catch a typo, not to police a price.
alter table public.caregivers add column if not exists hourly_rate integer;

-- Slugs, not labels. The lists live in src/lib/caregiver/answers.ts and the
-- allowed values are pinned by a check constraint in the next migration, once
-- private.valid_slugs exists to express it.
alter table public.caregivers add column if not exists counties text[] not null default '{}';
alter table public.caregivers add column if not exists other_county text;

alter table public.caregivers add column if not exists regional_center_worker boolean not null default false;
alter table public.caregivers add column if not exists regional_center_name text;

-- A date, not a timestamp: "when could you start" is a calendar answer.
alter table public.caregivers add column if not exists earliest_start_date date;

-- ---------------------------------------------------------------------------
-- Languages
-- ---------------------------------------------------------------------------

alter table public.caregivers add column if not exists languages text[] not null default '{}';
alter table public.caregivers add column if not exists other_language text;

-- ---------------------------------------------------------------------------
-- Transportation
-- ---------------------------------------------------------------------------

-- The driver's licence is deliberately absent. It is a credential — a file an
-- admin approves — and "can drive" is read from that document rather than typed
-- here. These three are the things no document can say.
alter table public.caregivers add column if not exists car_and_insurance boolean not null default false;
alter table public.caregivers add column if not exists willing_to_drive boolean not null default false;
alter table public.caregivers add column if not exists max_travel_miles smallint;

-- ---------------------------------------------------------------------------
-- Home environment
-- ---------------------------------------------------------------------------

alter table public.caregivers add column if not exists pets text;
alter table public.caregivers add column if not exists non_smoker boolean not null default false;

-- ---------------------------------------------------------------------------
-- Application
-- ---------------------------------------------------------------------------

-- The name on a licence or a background check, which is not the name they go by.
-- Kept apart from display_name, and prefilled from it in the app so nobody types
-- the same name twice to say it is the same name.
alter table public.caregivers add column if not exists legal_name text;

-- One block, three columns. A free-text address with city and ZIP asked beside
-- it would be the same answer collected twice.
alter table public.caregivers add column if not exists address_street text;
alter table public.caregivers add column if not exists address_city text;
alter table public.caregivers add column if not exists address_postal_code text;

alter table public.caregivers add column if not exists referral_source text;

-- What they have worked with, which is not the same question as what they will
-- do on a shift — that one is caregiver_supports, and it stays where it is.
alter table public.caregivers add column if not exists conditions text[] not null default '{}';
alter table public.caregivers add column if not exists other_condition text;

alter table public.caregivers add column if not exists why_special_needs text;
alter table public.caregivers add column if not exists difficult_moment text;

-- Consent, not evidence. The check itself is a background_check credential.
alter table public.caregivers add column if not exists background_check_agreed boolean not null default false;

-- ---------------------------------------------------------------------------
-- Signature
-- ---------------------------------------------------------------------------

-- A typed name and the server's clock, not a drawn image. The statement version
-- is stored alongside so a later rewording cannot change what somebody agreed
-- to, and the IP and user agent are the audit trail an e-signature record is
-- expected to carry.
alter table public.caregivers add column if not exists signature_name text;
alter table public.caregivers add column if not exists signed_at timestamptz;
alter table public.caregivers add column if not exists signed_statement_version text;
alter table public.caregivers add column if not exists signed_ip inet;
alter table public.caregivers add column if not exists signed_user_agent text;

-- ---------------------------------------------------------------------------
-- The application record, written by an admin
-- ---------------------------------------------------------------------------

-- What happens offline and has no document and no derivation: the interview, and
-- the TrustLine answer. Everything else on the form's review panel — received,
-- reference 1, reference 2, background check, CPR proof, published, decision —
-- is read from a row that already exists.
alter table public.caregivers add column if not exists interviewed_at timestamptz;
alter table public.caregivers add column if not exists interview_outcome text;
alter table public.caregivers add column if not exists trustline_status text;

-- The admin sending it back. `submitted_at` is still the submission; this is the
-- unlock. Locked means submitted_at is not null and returned_at is null, which
-- is why no separate "draft" status is needed.
alter table public.caregivers add column if not exists returned_at timestamptz;
alter table public.caregivers add column if not exists returned_reason text;

-- ---------------------------------------------------------------------------
-- Constraints
-- ---------------------------------------------------------------------------

-- Dropped first so this file can be re-run against a database that already has
-- an earlier version of a constraint.

alter table public.caregivers drop constraint if exists caregivers_hourly_rate_check;
alter table public.caregivers
  add constraint caregivers_hourly_rate_check
  check (hourly_rate is null or hourly_rate between 15 and 500);

alter table public.caregivers drop constraint if exists caregivers_max_travel_miles_check;
alter table public.caregivers
  add constraint caregivers_max_travel_miles_check
  check (max_travel_miles is null or max_travel_miles between 1 and 500);

-- The three shapes of home the form offers, plus "none". A null is not the
-- same answer as "none": one is unanswered, the other is a preference.
alter table public.caregivers drop constraint if exists caregivers_pets_check;
alter table public.caregivers
  add constraint caregivers_pets_check
  check (pets is null or pets in ('dogs', 'cats', 'both', 'none'));

alter table public.caregivers drop constraint if exists caregivers_interview_outcome_check;
alter table public.caregivers
  add constraint caregivers_interview_outcome_check
  check (interview_outcome is null or interview_outcome in ('pass', 'no'));

alter table public.caregivers drop constraint if exists caregivers_trustline_status_check;
alter table public.caregivers
  add constraint caregivers_trustline_status_check
  check (trustline_status is null or trustline_status in ('cleared', 'pending', 'na'));

-- Labels are short. Free-text answers are long. The limits are the same ones the
-- Zod schemas apply, so a value that reaches Postgres has already been refused
-- in the app with a sentence rather than a constraint name.
alter table public.caregivers drop constraint if exists caregivers_label_lengths_check;
alter table public.caregivers
  add constraint caregivers_label_lengths_check
  check (
    coalesce(char_length(other_county), 0) <= 200
    and coalesce(char_length(other_language), 0) <= 200
    and coalesce(char_length(other_condition), 0) <= 200
    and coalesce(char_length(regional_center_name), 0) <= 200
    and coalesce(char_length(referral_source), 0) <= 200
  );

alter table public.caregivers drop constraint if exists caregivers_answer_lengths_check;
alter table public.caregivers
  add constraint caregivers_answer_lengths_check
  check (
    coalesce(char_length(why_special_needs), 0) <= 2000
    and coalesce(char_length(difficult_moment), 0) <= 2000
    and coalesce(char_length(returned_reason), 0) <= 1000
  );

-- An "other" answer with no label is a tick that says nothing, so a tick and its
-- label travel together in both directions.
alter table public.caregivers drop constraint if exists caregivers_other_county_check;
alter table public.caregivers
  add constraint caregivers_other_county_check
  check (not ('other' = any (counties)) or nullif(btrim(coalesce(other_county, '')), '') is not null);

alter table public.caregivers drop constraint if exists caregivers_other_language_check;
alter table public.caregivers
  add constraint caregivers_other_language_check
  check (not ('other' = any (languages)) or nullif(btrim(coalesce(other_language, '')), '') is not null);

alter table public.caregivers drop constraint if exists caregivers_other_condition_check;
alter table public.caregivers
  add constraint caregivers_other_condition_check
  check (not ('other' = any (conditions)) or nullif(btrim(coalesce(other_condition, '')), '') is not null);

-- The signature is a set. Half of one is unreadable: a name with no timestamp
-- cannot be dated, and a timestamp with no name cannot be attributed. The app
-- writes all four in one statement.
alter table public.caregivers drop constraint if exists caregivers_signature_complete_check;
alter table public.caregivers
  add constraint caregivers_signature_complete_check
  check (
    (signature_name is null and signed_at is null)
    or (
      nullif(btrim(coalesce(signature_name, '')), '') is not null
      and signed_at is not null
      and signed_statement_version is not null
    )
  );
