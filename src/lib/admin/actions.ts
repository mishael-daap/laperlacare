"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAdmin } from "@/lib/admin/is-admin";
import { createClient } from "@/lib/supabase/server";

export type ReviewState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  documentId: z.uuid({ error: "That document id is not valid." }),
  status: z.enum(["approved", "rejected"], {
    error: "A decision is either approved or rejected.",
  }),
});

/**
 * The one write an admin makes.
 *
 * A decision is now about a document, not about a person. Approving a
 * background check says nothing about the CPR card beside it, which is the
 * whole point: a caregiver's badge is derived from what is actually approved,
 * so an admin setting it by hand would be a second, contradicting answer.
 *
 * There is no "pending" decision. Undoing an approval means rejecting it, or
 * waiting for the caregiver to replace the file, which puts the replacement
 * back to pending on its own.
 *
 * RLS already refuses a non-admin, but the check is repeated here so the action
 * says "not authorized" instead of returning a database error the page would
 * have to translate.
 *
 * `reviewed_by` is the caller from the session, never a value from the form.
 * The time is set here rather than defaulted in Postgres so the audit row and
 * the decision are unambiguously the same write.
 */
export async function reviewDocumentAction(
  _previous: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const parsed = schema.safeParse({
    documentId: formData.get("documentId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return { error: "Not authorized." };
  }

  const { data: claims } = await supabase.auth.getClaims();
  const reviewer = claims?.claims?.sub;

  const { data, error } = await supabase
    .from("caregiver_documents")
    .update({
      review_status: parsed.data.status,
      reviewed_by: reviewer ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.documentId)
    .select("caregiver_id")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "That document no longer exists." };
  }

  revalidatePath("/admin/caregiver");
  revalidatePath(`/admin/caregiver/${data.caregiver_id}`);
  revalidatePath("/me");

  return { ok: true };
}
