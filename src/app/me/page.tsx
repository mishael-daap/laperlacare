import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { AvailabilityBoard } from "@/components/caregiver/availability-board";
import { ContactsSection } from "@/components/caregiver/contacts-section";
import { DocumentsSection } from "@/components/caregiver/documents-section";
import { ProfileDraftProvider } from "@/components/caregiver/profile-draft";
import { ProfileHeader } from "@/components/caregiver/profile-header";
import { SaveBar } from "@/components/caregiver/save-bar";
import { completeness, completenessSummary } from "@/lib/caregiver/completeness";
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
 * Everything editable lives on this page now — the onboarding dialog is gone.
 * It existed to walk somebody through a form they can see in front of them, and
 * it turned every small edit into a three-step ritual.
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

  const { caregiver, contacts, documents, availability } = profile;

  const items = completeness({
    displayName: caregiver.display_name,
    bio: caregiver.bio,
    avatarPath: caregiver.avatar_path,
    contactCount: contacts.length,
    backgroundCheckCount: documents.filter((d) => d.kind === "background_check").length,
    availabilityCount: availability.length,
  });

  const summary = completenessSummary(items);

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

  const initialDocuments = documents.map((document) => ({
    id: document.id,
    kind: document.kind,
    fileName: document.file_name,
  }));

  return (
    <ProfileDraftProvider
      userId={userId}
      initialName={caregiver.display_name}
      initialBio={caregiver.bio}
      initialContacts={initialContacts}
      initialDocuments={initialDocuments}
      initialBlocks={availability}
    >
      <main className="flex-1">
        <ProfileHeader
          avatarSrc={avatarSrc}
          status={caregiver.verification_status}
          done={summary.done}
          total={summary.total}
        />

        {/* pt-8 rather than py-12: the header already contributes pb-8, and the two
            together were 80px against the 64px gap-16 used between sections. Halving
            the container's top padding makes the space after the bio match the space
            between everything below it. */}
        <div className="flex max-w-3xl flex-col gap-16 px-7 pt-8 pb-12 md:px-10">
          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-xl font-medium tracking-tight">
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
            <h2 className="font-heading text-xl font-medium tracking-tight">
              Contact details
            </h2>
            <ContactsSection />
          </section>

          <section className="flex flex-col gap-6">
            <h2 className="font-heading text-xl font-medium tracking-tight">
              Your background check
            </h2>
            <DocumentsSection />
          </section>

        </div>
      </main>

      <SaveBar />
    </ProfileDraftProvider>
  );
}
