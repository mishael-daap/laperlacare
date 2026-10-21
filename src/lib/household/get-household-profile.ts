import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * Everything the household page needs.
 *
 * The tags are fetched in a second round because the generated types only carry
 * the foreign keys that point out of each table, not the ones pointing in. Two
 * small rounds are cheaper than an untyped nested select, and the lists are
 * needed to turn ids back into slugs anyway.
 */
export async function getHouseholdProfile(
  supabase: SupabaseClient<Database>,
  householdId: string,
) {
  const [household, children, needs, supports, availability] = await Promise.all([
    supabase
      .from("households")
      .select("id, preferred_caregiver_gender")
      .eq("id", householdId)
      .single(),
    supabase
      .from("children")
      .select("id, full_name, date_of_birth, notes, created_at")
      .eq("household_id", householdId)
      .order("created_at"),
    supabase.from("needs").select("id, slug, label, position").order("position"),
    supabase.from("supports").select("id, slug, label, position").order("position"),
    supabase
      .from("household_availability")
      .select("id, day_of_week, start_time, end_time")
      .eq("household_id", householdId)
      .order("day_of_week")
      .order("start_time"),
  ]);

  if (household.error || !household.data) {
    throw new Error(`Could not load your household: ${household.error?.message ?? "not found"}`);
  }

  if (children.error) throw new Error(children.error.message);
  if (needs.error) throw new Error(needs.error.message);
  if (supports.error) throw new Error(supports.error.message);
  if (availability.error) throw new Error(availability.error.message);

  const childRows = children.data ?? [];
  const needRows = needs.data ?? [];
  const supportRows = supports.data ?? [];

  const childIds = childRows.map((child) => child.id);

  let childNeeds: { child_id: string; need_id: string }[] = [];
  let childSupports: { child_id: string; support_id: string }[] = [];

  if (childIds.length > 0) {
    const [needsResult, supportsResult] = await Promise.all([
      supabase
        .from("child_needs")
        .select("child_id, need_id")
        .in("child_id", childIds),
      supabase
        .from("child_supports")
        .select("child_id, support_id")
        .in("child_id", childIds),
    ]);

    if (needsResult.error) throw new Error(needsResult.error.message);
    if (supportsResult.error) throw new Error(supportsResult.error.message);

    childNeeds = needsResult.data ?? [];
    childSupports = supportsResult.data ?? [];
  }

  const needSlugById = new Map(needRows.map((need) => [need.id, need.slug]));
  const supportSlugById = new Map(supportRows.map((support) => [support.id, support.slug]));

  return {
    household: household.data,
    needs: needRows,
    supports: supportRows,
    availability: availability.data ?? [],
    children: childRows.map((child) => ({
      id: child.id,
      fullName: child.full_name,
      dateOfBirth: child.date_of_birth,
      notes: child.notes,
      needSlugs: childNeeds
        .filter((row) => row.child_id === child.id)
        .map((row) => needSlugById.get(row.need_id))
        .filter((slug): slug is string => Boolean(slug)),
      supportSlugs: childSupports
        .filter((row) => row.child_id === child.id)
        .map((row) => supportSlugById.get(row.support_id))
        .filter((slug): slug is string => Boolean(slug)),
    })),
  };
}

export type HouseholdProfile = Awaited<ReturnType<typeof getHouseholdProfile>>;
export type HouseholdChild = HouseholdProfile["children"][number];
export type HouseholdList = HouseholdProfile["needs"];
export type HouseholdWindow = HouseholdProfile["availability"][number];
