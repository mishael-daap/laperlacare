import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { ApplicationProgress } from "@/components/caregiver/application-progress";
import { ApplicationDraftProvider } from "@/components/caregiver/application-draft";
import {
  ConditionsSection,
  PersonalDetailsSection,
  QuestionsSection,
} from "@/components/caregiver/application-sections";
import { ApplicationSignature } from "@/components/caregiver/application-signature";
import { CredentialsSection } from "@/components/caregiver/credentials-section";
import { ExperienceEditor } from "@/components/caregiver/experience-editor";
import { ReferencesEditor } from "@/components/caregiver/references-editor";
import { ApplicationSaveBar } from "@/components/caregiver/application-save-bar";
import { progress, sections } from "@/lib/caregiver/completeness";
import { getCaregiverProfile } from "@/lib/caregiver/get-caregiver-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your application — Perla Care",
  robots: { index: false, follow: false },
};

export const instant = false;

/**
 * The once-only half of the paperwork.
 *
 * Everything here is taken down once and reviewed: who they legally are, what
 * they have done, who can vouch for them, what they have sworn to. It locks on
 * submission, which is what makes an admin's decision mean something — a form
 * that could change after the fact is a form that was never really reviewed.
 *
 * Credentials sit at the end of the written sections and are the exception: they
 * stay editable forever, because a rejected or expiring document has to be
 * replaceable and the caregiver's badge depends on it.
 */
export default async function ApplicationPage() {
  await connection();

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) {
    redirect("/sign-in?next=/application");
  }

  const profile = await getCaregiverProfile(supabase, userId);

  if (!profile.caregiver) {
    redirect("/caregivers");
  }

  const { caregiver, documents, availability, experience, references } = profile;

  const state = sections({
    displayName: caregiver.display_name,
    bio: caregiver.bio,
    dateOfBirth: caregiver.date_of_birth,
    gender: caregiver.gender,
    hourlyRate: caregiver.hourly_rate,
    counties: caregiver.counties ?? [],
    ageMin: caregiver.age_min,
    ageMax: caregiver.age_max,
    languages: caregiver.languages ?? [],
    carAndInsurance: caregiver.car_and_insurance,
    willingToDrive: caregiver.willing_to_drive,
    maxTravelMiles: caregiver.max_travel_miles,
    pets: caregiver.pets,
    nonSmoker: caregiver.non_smoker,
    needCount: profile.needSlugs.length,
    supportCount: profile.supportSlugs.length,
    availabilityCount: availability.length,
    contactCount: profile.contacts.length,
    legalName: caregiver.legal_name,
    addressStreet: caregiver.address_street,
    addressCity: caregiver.address_city,
    addressPostalCode: caregiver.address_postal_code,
    experienceCount: experience.length,
    conditions: caregiver.conditions ?? [],
    referenceCount: references.length,
    whySpecialNeeds: caregiver.why_special_needs,
    difficultMoment: caregiver.difficult_moment,
    credentialCount: documents.length,
    backgroundCheckAgreed: caregiver.background_check_agreed,
    signatureName: caregiver.signature_name,
  });

  const summary = progress(state);

  /**
   * Nothing is locked any more. The application is editable forever, and an
   * edit clears the signature — which is what the banner below is for.
   */
  const needsSignature =
    Boolean(caregiver.submitted_at) && !caregiver.signed_at;
  const editedSinceSigning = Boolean(caregiver.submitted_at) === false && Boolean(caregiver.approved_at);

  const initialReferences = [0, 1].map((index) => {
    const row = references[index];

    return {
      fullName: row?.full_name ?? "",
      relationship: row?.relationship ?? "",
      organisation: row?.organisation ?? "",
      phone: row?.phone ?? "",
      email: row?.email ?? "",
      knownFor: row?.known_for ?? "",
    };
  });

  return (
    <ApplicationDraftProvider
      locked={false}
      initial={{
        legalName: caregiver.legal_name,
        addressStreet: caregiver.address_street,
        addressCity: caregiver.address_city,
        addressPostalCode: caregiver.address_postal_code,
        referralSource: caregiver.referral_source,
        conditions: caregiver.conditions ?? [],
        otherCondition: caregiver.other_condition,
        whySpecialNeeds: caregiver.why_special_needs,
        difficultMoment: caregiver.difficult_moment,
        experience: experience.map((row) => ({
          employer: row.employer,
          role: row.role,
          startedOn: row.started_on.slice(0, 7),
          // A role with no end date is the one still running.
          endedOn: row.ended_on ? row.ended_on.slice(0, 7) : "present",
          agesAndNeeds: row.ages_and_needs ?? "",
        })),
        references: initialReferences,
      }}
    >
      <main className="flex-1">
        <div className="mx-auto flex max-w-3xl flex-col gap-16 px-7 py-12 md:px-10">
          <header className="flex flex-col gap-3">
            <h1 className="font-heading text-3xl tracking-tight">
              Your application
            </h1>
            <p className="max-w-xl text-pretty text-muted-foreground">
              Fill this in once. It is read by a person, and it locks when you
              sign it — the parts of your profile that change, like your rate and
              your hours, stay on your profile page.
            </p>
          </header>

          {caregiver.submitted_at && caregiver.signed_at ? (
            <p className="rounded-xl border border-border bg-muted/40 px-5 py-4 text-sm">
              You signed this on {new Date(caregiver.signed_at).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: "America/Los_Angeles",
              })}. You can change any answer — signing again after a change is
              all we need.
            </p>
          ) : null}

          {needsSignature || editedSinceSigning ? (
            <div className="rounded-xl border border-warning bg-muted/40 px-5 py-4 text-sm">
              <p className="font-semibold">This has changed since you signed it.</p>
              <p className="mt-1 text-muted-foreground">
                Your answers are saved. Sign at the bottom and we will pick it up
                from the current version.
              </p>
            </div>
          ) : null}

          {caregiver.declined_at ? (
            <div className="rounded-xl border border-destructive bg-muted/40 px-5 py-4 text-sm">
              <p className="font-semibold">We could not accept this application.</p>
              {caregiver.declined_reason ? (
                <p className="mt-1 text-muted-foreground">{caregiver.declined_reason}</p>
              ) : null}
              <p className="mt-2 text-muted-foreground">
                Fix what it asks for, sign, and we will look again.
              </p>
            </div>
          ) : null}

          <ApplicationProgress
            sections={state}
            done={summary.done}
            total={summary.total}
            next={summary.next}
            compact
          />

          <PersonalDetailsSection />
          <ExperienceEditor />
          <ConditionsSection />
          <ReferencesEditor />
          <QuestionsSection />
          <CredentialsSection documents={documents} userId={userId} />
          <ApplicationSignature
            legalName={caregiver.legal_name ?? ""}
            signedAt={caregiver.signed_at}
            signedVersion={caregiver.signed_statement_version}
            submittedAt={caregiver.submitted_at}
          />
        </div>
      </main>

      <ApplicationSaveBar />
    </ApplicationDraftProvider>
  );
}
