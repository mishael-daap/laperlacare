import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * Everything the caregiver's own page needs, in one round of parallel reads.
 *
 * The caregiver row is fetched with `.maybeSingle()` filtered by id rather than
 * relying on the read policy, because that policy also exposes approved
 * caregivers to everyone — an approved caregiver would otherwise match several
 * rows and the call would error instead of returning their own.
 */
export async function getCaregiverProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const [caregiverResult, contacts, documents, availability] = await Promise.all([
    supabase.from("caregivers").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("contacts").select("*").eq("user_id", userId).order("created_at"),
    supabase
      .from("caregiver_documents")
      .select("*")
      .eq("caregiver_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("caregiver_availability")
      .select("*")
      .eq("caregiver_id", userId)
      .order("day_of_week")
      .order("start_time"),
  ]);

  return {
    caregiver: caregiverResult.data,
    contacts: contacts.data ?? [],
    documents: documents.data ?? [],
    availability: availability.data ?? [],
  };
}

export type CaregiverProfile = Awaited<ReturnType<typeof getCaregiverProfile>>;
