import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { ApplicationProgress } from "@/components/caregiver/application-progress";
import { Logo } from "@/components/brand/logo";
import { progress, sections } from "@/lib/caregiver/completeness";
import { getCaregiverProfile } from "@/lib/caregiver/get-caregiver-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Finish your profile — Perla Care",
  robots: { index: false, follow: false },
};

export const instant = false;

/**
 * Where a caregiver lands after signing up.
 *
 * Not a wizard. Each of the sixteen sections is the same component the profile
 * and the application pages render, reached by anchor — a wizard would need a
 * second copy of every form and a second place to keep the layout true, and the
 * only thing it would add over this is the feeling of being led.
 *
 * What this page does that the two pages cannot is say how much is left and in
 * what order — which is the whole point. Sixteen fieldsets with no marker is why
 * somebody fills in four and stops.
 *
 * The count is derived from the same list the other pages use, so it cannot
 * drift, and "complete" means the same thing in all three places.
 */
export default async function OnboardingPage() {
  await connection();

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;

  if (!userId) {
    redirect("/sign-in?next=/onboarding");
  }

  const profile = await getCaregiverProfile(supabase, userId);

  // A parent who lands here has no caregiver row and nothing to fill in.
  if (!profile.caregiver) {
    redirect("/household");
  }

  const { caregiver, contacts, documents, availability, experience, references } = profile;

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
  const submitted = Boolean(caregiver.submitted_at);

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16 sm:py-24">
      <div className="flex w-full max-w-2xl flex-col gap-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <Logo className="h-7" />

          <h1 className="font-heading text-3xl tracking-tight text-balance">
            {summary.complete
              ? "Your application is in."
              : submitted
                ? "We are reviewing your application."
                : "Let us get your profile finished."}
          </h1>

          <p className="max-w-md text-pretty text-muted-foreground">
            {summary.complete
              ? "You can still change your rate, your hours and your credentials whenever you like."
              : submitted
                ? "Every document is reviewed on its own, so you may hear from us more than once."
                : "Nothing here is public until we have reviewed it. You can stop at any point — your answers are saved as you go."}
          </p>
        </div>

        <ApplicationProgress
          sections={state}
          done={summary.done}
          total={summary.total}
          next={summary.next}
        />

        <p className="text-center text-sm text-muted-foreground">
          Change your mind about a section later? Everything here stays editable
          until you sign the application.
        </p>
      </div>
    </main>
  );
}
