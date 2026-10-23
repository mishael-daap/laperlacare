import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

/**
 * The admin directory reads.
 *
 * Filtering, searching, and paging all happen in Postgres. Two reasons, and the
 * second is the one that forces it: the list has to page without loading every
 * caregiver, and the account email lives in `auth.users`, which the Data API
 * never exposes. The functions are admin-gated; a non-admin gets an error, not
 * an empty list.
 */

export const PAGE_SIZES = [10, 25, 50, 100] as const;

export const DEFAULT_PAGE_SIZE = 10;

export type PageSize = (typeof PAGE_SIZES)[number];

export type StatusBucket = "all" | "onboarding" | "pending" | "approved" | "rejected";

/**
 * The bucket the list opens on.
 *
 * Pending is the queue an admin came to work. All is one click away, but a list
 * that opens on everything buries the work under rows that need nothing.
 */
export const DEFAULT_STATUS: StatusBucket = "pending";

export const BUCKETS: { value: StatusBucket; label: string }[] = [
  { value: "all", label: "All" },
  { value: "onboarding", label: "Onboarding" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export type DirectoryRow = {
  user_id: string;
  display_name: string | null;
  email: string;
  verification_status: string;
  submitted_at: string | null;
  created_at: string;
  total_count: number;
};

export type CaregiverDetail = {
  user_id: string;
  display_name: string | null;
  email: string;
  bio: string | null;
  avatar_path: string | null;
  /** Derived from the documents by the database, never stored. */
  verification_status: string;
  date_of_birth: string | null;
  gender: string | null;
  age_min: number | null;
  age_max: number | null;
  submitted_at: string | null;
  created_at: string;
  need_slugs: string[];
  support_slugs: string[];
};

export function parseStatus(value: string | string[] | undefined): StatusBucket {
  const raw = Array.isArray(value) ? value[0] : value;
  return BUCKETS.some((bucket) => bucket.value === raw) ? (raw as StatusBucket) : DEFAULT_STATUS;
}

export function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number(raw);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

/**
 * Rows per page.
 *
 * Ten by default, and the admin can pick a larger size from the same screen.
 * The value rides in the URL so a refresh, a bookmark, or a shared link keeps
 * the view the same. Anything else in the parameter falls back to the default
 * rather than being trusted into the RPC.
 */
export function parsePageSize(value: string | string[] | undefined): PageSize {
  const raw = Array.isArray(value) ? value[0] : value;
  const size = Number(raw);
  return PAGE_SIZES.includes(size as PageSize) ? (size as PageSize) : DEFAULT_PAGE_SIZE;
}

export async function listCaregivers(
  supabase: SupabaseClient<Database>,
  input: { status: StatusBucket; query: string; page: number; pageSize: PageSize },
) {
  const { data, error } = await supabase.rpc("admin_caregiver_directory", {
    p_status: input.status,
    p_query: input.query || undefined,
    p_limit: input.pageSize,
    p_offset: (input.page - 1) * input.pageSize,
  });

  if (error) throw new Error(`Could not load caregivers: ${error.message}`);

  const rows = (data ?? []) as DirectoryRow[];

  // `total_count` rides on every row because it is a window count. An empty
  // page has no rows and therefore no total, which is correct.
  return { rows, total: rows.length > 0 ? Number(rows[0].total_count) : 0 };
}

export async function caregiverCounts(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase.rpc("admin_caregiver_counts");

  if (error) throw new Error(`Could not count caregivers: ${error.message}`);

  const row = data?.[0];

  return {
    all: Number(row?.total_count ?? 0),
    onboarding: Number(row?.onboarding_count ?? 0),
    pending: Number(row?.pending_count ?? 0),
    approved: Number(row?.approved_count ?? 0),
    rejected: Number(row?.rejected_count ?? 0),
  } satisfies Record<StatusBucket, number>;
}

/**
 * One caregiver with everything the review screen shows.
 *
 * The profile row comes from the function because it carries the account email;
 * contacts, documents, and availability come from their own tables under the
 * admin policies. Documents are signed here rather than in the component,
 * because signing needs the server client and the URLs expire.
 */
export async function getCaregiverForReview(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const [detail, contacts, documents, availability, needs, supports] = await Promise.all([
    supabase.rpc("admin_caregiver_detail", { p_user_id: userId }),
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
    supabase.from("needs").select("slug, label, position").order("position"),
    supabase.from("supports").select("slug, label, position").order("position"),
  ]);

  if (detail.error) throw new Error(`Could not load the caregiver: ${detail.error.message}`);

  const caregiver = (detail.data?.[0] ?? null) as CaregiverDetail | null;

  if (!caregiver) return null;

  const signed = await Promise.all(
    (documents.data ?? []).map(async (document) => {
      const { data } = await supabase.storage
        .from("caregiver-documents")
        .createSignedUrl(document.storage_path, 60 * 60);

      return { ...document, url: data?.signedUrl ?? null };
    }),
  );

  return {
    caregiver,
    contacts: contacts.data ?? [],
    documents: signed,
    availability: availability.data ?? [],
    needs: needs.data ?? [],
    supports: supports.data ?? [],
  };
}
