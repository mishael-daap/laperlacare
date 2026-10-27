import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { CareSchedule } from "@/components/household/care-schedule";
import { ChildList } from "@/components/household/child-list";
import { GenderPreference } from "@/components/household/gender-preference";
import { isAdmin } from "@/lib/admin/is-admin";
import { ensureHousehold } from "@/lib/auth/ensure-household";
import { isCaregiver } from "@/lib/caregiver/is-caregiver";
import { getHouseholdProfile } from "@/lib/household/get-household-profile";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your household — Perla Care",
  robots: { index: false, follow: false },
};

/**
 * `instant = false` because this reads the session and can never be prerendered.
 */
export const instant = false;

/**
 * The parent's home.
 *
 * The household is created here rather than at payment. Billing later attaches a
 * subscription to the household that already exists, and contact details remain
 * the thing the subscription unlocks.
 *
 * Role checks come before `ensureHousehold()` on purpose. That function will
 * create a household for any authenticated caller, and a caregiver or admin must
 * never be given one.
 */
export default async function HouseholdPage() {
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) {
    redirect("/sign-in?next=/household");
  }

  if (await isAdmin(supabase)) {
    redirect("/admin/caregiver");
  }

  if (await isCaregiver(supabase)) {
    redirect("/me");
  }

  const householdId = await ensureHousehold(supabase);
  const profile = await getHouseholdProfile(supabase, householdId);

  return (
    <main className="flex-1">
      <div className="mx-auto flex max-w-3xl flex-col gap-16 px-7 py-12 md:px-10">
        <header className="flex flex-col gap-3">
          <h1 className="font-heading text-3xl tracking-tight">
            Your household
          </h1>
          <p className="max-w-xl text-pretty text-muted-foreground">
            Tell us about your children and when you need care. We use this to
            find caregivers who fit your family.
          </p>
        </header>

        <ChildList
          childProfiles={profile.children}
          needs={profile.needs}
          supports={profile.supports}
        />

        <CareSchedule windows={profile.availability} />

        <GenderPreference value={profile.household.preferred_caregiver_gender} />
      </div>
    </main>
  );
}
