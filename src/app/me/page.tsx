import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AvailabilityBoard } from "@/components/caregiver/availability-board";
import { CapabilityChecklist } from "@/components/caregiver/capability-checklist";
import { ContactsSection } from "@/components/caregiver/contacts-section";
import { CredentialsSection } from "@/components/caregiver/credentials-section";
import { ProfileDraftProvider } from "@/components/caregiver/profile-draft";
import { ProfileHeader } from "@/components/caregiver/profile-header";
import { SaveBar } from "@/components/caregiver/save-bar";
import { completeness, completenessSummary } from "@/lib/caregiver/completeness";
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
 * Role-aware, and the `caregivers` row is the whole test. A parent is sent to
 * the catalogue, because there is no parent profile and inventing an empty one
 * would be a screen that exists only to say it is empty.
 *
 * The order is the order a caregiver builds the profile in: what has been
 * verified, what they can take on, when they are free, how to reach them. A
 * badge that says "pending" is answered by the credentials section immediately
 * below it rather than after three more screens of scrolling.
 *
 * The header is full-bleed so the cover can sit inset from the screen edge.
 * Everything below shares its left edge, which is why the container is not
 * centred — centring would push the body out of line with the name above it.
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

  const { caregiver, contacts, documents, availability, needs, supports, status } = profile;

  const items = completeness({
    displayName: caregiver.display_name,
    bio: caregiver.bio,
    avatarPath: caregiver.avatar_path,
    dateOfBirth: caregiver.date_of_birth,
    gender: caregiver.gender,
    workingAges: caregiver.age_min !== null && caregiver.age_max !== null,
    contactCount: contacts.length,
    needCount: profile.needSlugs.length,
    supportCount: profile.supportSlugs.length,
    documentCount: documents.length,
    availabilityCount: availability.length,
  });

  const summary = completenessSummary(items);
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
    address: contact.address ?? "",
  }));

  return (
    <ProfileDraftProvider
      userId={userId}
      initialName={caregiver.display_name}
      initialBio={caregiver.bio}
      initialDateOfBirth={caregiver.date_of_birth}
      initialGender={caregiver.gender}
      initialAgeMin={caregiver.age_min}
      initialAgeMax={caregiver.age_max}
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

        {/* pt-8 rather than py-12: the header already contributes pb-8, and the two
            together were 80px against the 64px gap-16 used between sections. Halving
            the container's top padding makes the space after the bio match the space
            between everything below it. */}
        <div className="flex max-w-3xl flex-col gap-16 px-7 pt-8 pb-12 md:px-10">
          {sentence ? (
            <p className="-mb-8 text-pretty text-sm text-muted-foreground">{sentence}</p>
          ) : null}

          <CredentialsSection documents={documents} />

          <CapabilityChecklist
            kind="needs"
            items={needs}
            title="Children you can support"
            description="The same list families tick for their child. Tick what you can take on — anything you leave blank will not be matched to you."
          />

          <CapabilityChecklist
            kind="supports"
            items={supports}
            title="What you can provide"
            description="The practical things you are willing to do on a shift."
          />

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-xl tracking-tight">
                Your weekly availability
              </h2>
              <p className="text-muted-foreground">
                Families search by the day and time they need, so this is what puts
                you in front of them.
              </p>
            </div>

            <AvailabilityBoard />
          </section>

          <section className="flex flex-col gap-6">
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
