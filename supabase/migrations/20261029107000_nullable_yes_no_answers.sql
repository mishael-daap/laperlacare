-- "No" and "not answered" stop being the same thing.
--
-- Four of the application's answers are yes/no, and the first version of these
-- columns defaulted them to false. That reads fine in a form and badly everywhere
-- else: a caregiver who has never been asked whether they are a non-smoker is
-- indistinguishable from one who said no, and a progress counter that cannot tell
-- the difference is telling the caregiver they answered something they did not.
--
-- Nullable is the honest shape. Null is unanswered, false is no, true is yes.
--
-- `background_check_agreed` deliberately keeps its false default. It is a
-- consent, false is the correct value for somebody who has not consented, and a
-- null there would mean the same thing while adding a third state nobody asked
-- for.

alter table public.caregivers alter column car_and_insurance      drop not null;
alter table public.caregivers alter column car_and_insurance      drop default;
alter table public.caregivers alter column willing_to_drive       drop not null;
alter table public.caregivers alter column willing_to_drive       drop default;
alter table public.caregivers alter column non_smoker             drop not null;
alter table public.caregivers alter column non_smoker             drop default;
alter table public.caregivers alter column regional_center_worker drop not null;
alter table public.caregivers alter column regional_center_worker drop default;

-- A row already carrying `false` keeps it. The seed's twenty caregivers were
-- written by a script that never asked, so their answer is "no" rather than
-- "unanswered" — wrong, but harmless, and the seed is rewritten to leave these
-- null in the same feature.

-- A Regional Center worker with no centre named is half an answer.
alter table public.caregivers drop constraint if exists caregivers_regional_center_check;
alter table public.caregivers
  add constraint caregivers_regional_center_check
  check (
    regional_center_worker is not true
    or nullif(btrim(coalesce(regional_center_name, '')), '') is not null
  );
