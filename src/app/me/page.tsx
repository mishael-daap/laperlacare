import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { ApplicationProgress } from "@/components/caregiver/application-progress";
import { AvailabilityBoard } from "@/components/caregiver/availability-board";
import { CapabilityChecklist } from "@/components/caregiver/capability-checklist";
import { ContactsSection } from "@/components/caregiver/contacts-section";
import { HomeEnvironmentSection } from "@/components/caregiver/home-environment-section";
import { LanguagesSection } from "@/components/caregiver/languages-section";
import { ProfileDraftProvider, type DraftWork } from "@/components/caregiver/profile-draft";
import { ProfileHeader } from "@/components/caregiver/profile-header";
import { SaveBar } from "@/components/caregiver/save-bar";
import { TransportationSection } from "@/components/caregiver/transportation-section";
import { WorkDetailsSection } from "@/components/caregiver/work-details-section";
import { progress, sections } from "@/lib/caregiver/completeness";
import { statusSentence } from "@/lib/caregiver/credentials";
import { getCaregiverProfile } from "@/lib/caregiver/get-caregiver-profile";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your profile — Perla Care",
};

/**
 * `instant = false` because this reads the session and can never be prerendered.
 */
export const instant = false;

/**
 * The signed-in person's own page.
 *
 * Role-aware, and the `caregivers` row is the whole test. A parent is sent to the
 * catalogue, because there is no parent profile and inventing an empty one
 * would be a screen that exists only to say it is empty.
 *
 * What lives here is what changes: who they are, what they charge, where they
 * will go, when they are free, and how to reach them. The vetting facts — legal
 * name, experience, references, the signature — live on `/application`, and the
 * credentials went with them. The split is the whole design: a caregiver edits
 * this page whenever their life changes, and signs the other one once.
 *
 * The progress rail sits above everything because the page has nine sections and
 * a caregiver arriving from a half-finished application needs to know which ones
 * still matter, without scrolling for it.
 */
export default async function MePage() {
  await connection();

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) {
    redirect("/sign-in?next=/me");
  }

  const profile = await getCaregiverProfile(supabase, userId);

  if (!profile.caregiver) {
    redirect("/caregivers");
  }

  const {
    caregiver,
    contacts,
    documents,
    availability,
    experience,
    references,
    needs,
    supports,
    status,
  } = profile;

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
    contactCount: contacts.length,
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
  const sentence = statusSentence(status, documents);

  // Built by hand rather than through the storage client, which is browser-side.
  // The bucket is public, so the object is readable at a fixed URL.
  const avatarSrc = caregiver.avatar_path
    ? `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${caregiver.avatar_path}`
    : null;

  const initialContacts = contacts.map((contact) => ({
    id: contact.id,
    label: contact.label,
    phone: contact.phone ?? "",
    email: contact.email ?? "",
    preferredContactMethod: contact.preferred_contact_method,
  }));

  /**
   * Three-state booleans become strings here, because an input holds what a
   * person typed and null is not a thing a checkbox can show.
   */
  const yesNo = (value: boolean | null) => (value === null ? "" : value ? "yes" : "no");

  const initialWork: DraftWork = {
    hourlyRate: caregiver.hourly_rate === null ? "" : String(caregiver.hourly_rate),
    counties: caregiver.counties ?? [],
    otherCounty: caregiver.other_county ?? "",
    regionalCenterWorker: yesNo(caregiver.regional_center_worker),
    regionalCenterName: caregiver.regional_center_name ?? "",
    earliestStartDate: caregiver.earliest_start_date ?? "",
    languages: caregiver.languages ?? [],
    otherLanguage: caregiver.other_language ?? "",
    carAndInsurance: yesNo(caregiver.car_and_insurance),
    willingToDrive: yesNo(caregiver.willing_to_drive),
    maxTravelMiles:
      caregiver.max_travel_miles === null ? "" : String(caregiver.max_travel_miles),
    pets: caregiver.pets ?? "",
    nonSmoker: yesNo(caregiver.non_smoker),
  };

  const hoursPerWeek = availability.reduce((total, block) => {
    const from = Number(block.start_time.slice(0, 2));
    const to = Number(block.end_time.slice(0, 2));
    return total + Math.max(0, to - from);
  }, 0);

  return (
    <ProfileDraftProvider
      userId={userId}
      initialName={caregiver.display_name}
      initialBio={caregiver.bio}
      initialDateOfBirth={caregiver.date_of_birth}
      initialGender={caregiver.gender}
      initialAgeMin={caregiver.age_min}
      initialAgeMax={caregiver.age_max}
      initialWork={initialWork}
      initialNeedSlugs={profile.needSlugs}
      initialSupportSlugs={profile.supportSlugs}
      initialContacts={initialContacts}
      initialBlocks={availability}
    >
      <main className="flex-1">
        <ProfileHeader
          avatarSrc={avatarSrc}
          status={status}
          done={summary.done}
          total={summary.total}
        />

        <div className="flex max-w-3xl flex-col gap-16 px-7 pt-8 pb-12 md:px-10">
          {sentence ? (
            <p className="-mb-8 text-pretty text-sm text-muted-foreground">{sentence}</p>
          ) : null}

          <ApplicationProgress
            sections={state}
            done={summary.done}
            total={summary.total}
            next={summary.next}
          />

          <WorkDetailsSection />

          <LanguagesSection />

          <TransportationSection />

          <HomeEnvironmentSection />

          <div id="needs" className="scroll-mt-24">
            <CapabilityChecklist
              kind="needs"
              items={needs}
              title="Children you can support"
              description="The same list families tick for their child. Tick what you can take on — anything you leave blank will not be matched to you."
            />
          </div>

          <div id="supports" className="scroll-mt-24">
            <CapabilityChecklist
              kind="supports"
              items={supports}
              title="What you can provide"
              description="The practical things you are willing to do on a shift."
            />
          </div>

          <section id="availability" className="flex scroll-mt-24 flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-xl tracking-tight">
                Your weekly availability
              </h2>
              <p className="text-muted-foreground">
                Families search by the day and time they need, so this is what puts
                you in front of them.
              </p>

              <p className="text-sm text-muted-foreground tabular-nums">
                {hoursPerWeek === 0
                  ? "No hours set yet."
                  : `That is about ${hoursPerWeek} hours a week.`}
              </p>
            </div>

            <AvailabilityBoard />
          </section>

          <section id="contacts" className="flex scroll-mt-24 flex-col gap-6">
            <h2 className="font-heading text-xl tracking-tight">
              Contact details
            </h2>
            <ContactsSection />
          </section>
        </div>
      </main>

      <SaveBar />
    </ProfileDraftProvider>
  );
}
