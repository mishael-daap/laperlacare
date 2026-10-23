import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * Everything the caregiver's own page needs, in one round of parallel reads.
 *
 * The caregiver row is fetched with `.maybeSingle()` filtered by id rather than
 * relying on the read policy, because that policy also exposes approved
 * caregivers to everyone — an approved caregiver would otherwise match several
 * rows and the call would error instead of returning their own.
 *
 * The two tag sets come back as ids and are turned into slugs here, using the
 * lists the page needs anyway. Two lists rather than a join keeps the generated
 * types doing the work.
 */
export async function getCaregiverProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const [
    caregiverResult,
    contacts,
    documents,
    availability,
    needTags,
    supportTags,
    needs,
    supports,
    status,
  ] = await Promise.all([
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
    supabase.from("caregiver_needs").select("need_id").eq("caregiver_id", userId),
    supabase.from("caregiver_supports").select("support_id").eq("caregiver_id", userId),
    supabase.from("needs").select("id, slug, label, position").order("position"),
    supabase.from("supports").select("id, slug, label, position").order("position"),
    supabase.rpc("my_caregiver_status"),
  ]);

  const needRows = needs.data ?? [];
  const supportRows = supports.data ?? [];

  const needSlugById = new Map(needRows.map((need) => [need.id, need.slug]));
  const supportSlugById = new Map(supportRows.map((support) => [support.id, support.slug]));

  return {
    caregiver: caregiverResult.data,
    contacts: contacts.data ?? [],
    documents: documents.data ?? [],
    availability: availability.data ?? [],
    needSlugs: (needTags.data ?? [])
      .map((tag) => needSlugById.get(tag.need_id))
      .filter((slug): slug is string => Boolean(slug)),
    supportSlugs: (supportTags.data ?? [])
      .map((tag) => supportSlugById.get(tag.support_id))
      .filter((slug): slug is string => Boolean(slug)),
    needs: needRows,
    supports: supportRows,
    /** Derived by the database from the documents. Never stored. */
    status: status.data ?? "pending",
  };
}

export type CaregiverProfile = Awaited<ReturnType<typeof getCaregiverProfile>>;
export type CaregiverDocument = CaregiverProfile["documents"][number];
