-- Three small changes that all come from the same place: the application page
-- needs a way to be reached, and contact details stop carrying an address.
--
-- Run order: the contact columns, the document kinds, then the grants.

-- ---------------------------------------------------------------------------
-- Contact details
-- ---------------------------------------------------------------------------

-- The home address moves to the application, where it is asked once as one
-- block of street, city and ZIP. `contacts` is shared by parents and caregivers,
-- and leaving a second address column here would mean two places to keep one
-- answer — the exact duplication this feature removes.
--
-- Dropping it loses nothing: no parent-facing screen ever read it, and the
-- caregiver screen that did is replaced by the application page.
alter table public.contacts drop column if exists address;

-- How a caregiver wants to be reached. The form asks it, and it is a fact about
-- the contact rather than about the person, so it sits on the row it describes.
-- Defaulted to phone because that is what the form's own checkbox order implies
-- and because a null would render as an unanswered question nobody asked twice.
alter table public.contacts
  add column if not exists preferred_contact_method text not null default 'phone';

alter table public.contacts drop constraint if exists contacts_preferred_contact_method_check;
alter table public.contacts
  add constraint contacts_preferred_contact_method_check
  check (preferred_contact_method in ('phone', 'text', 'email'));

-- ---------------------------------------------------------------------------
-- Document kinds
-- ---------------------------------------------------------------------------

-- A licence and a CPR card are no longer "certifications" with a document
-- attached — every one of them is now a credential in its own right, because a
-- credential is what the app reads to answer questions like "can this person
-- drive". The list widens from five to eight to name the ones the form asks
-- about.
--
-- `certification` is folded into `other` rather than kept as a ninth value. It
-- was a catch-all from before the kinds were named individually, and leaving it
-- would let a CPR card be filed under a kind that means nothing.
update public.caregiver_documents set kind = 'other' where kind = 'certification';

alter table public.caregiver_documents drop constraint if exists caregiver_documents_kind_check;
alter table public.caregiver_documents
  add constraint caregiver_documents_kind_check
  check (
    kind in (
      'background_check',
      'cpr',
      'first_aid',
      'rbt',
      'cna_nursing',
      'trustline',
      'drivers_licence',
      'other'
    )
  );
