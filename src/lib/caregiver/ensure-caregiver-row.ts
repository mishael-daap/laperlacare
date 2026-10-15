import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * Marks a signed-in person as a caregiver.
 *
 * A `caregivers` row is what makes somebody a caregiver — there is no role
 * column anywhere, so the presence of this row is the entire test. It is
 * created at sign-up rather than on the first visit to `/me`, so a caregiver
 * who signs up and never comes back is still recognisably a caregiver rather
 * than being indistinguishable from a parent.
 *
 * Idempotent: `ignoreDuplicates` means signing up twice, or arriving through a
 * callback after the row already exists, creates nothing.
 */
export async function ensureCaregiverRow(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { error } = await supabase
    .from("caregivers")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });

  if (error) {
    throw new Error(`Could not set up the caregiver profile: ${error.message}`);
  }
}
