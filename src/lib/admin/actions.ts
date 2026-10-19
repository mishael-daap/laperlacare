"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAdmin } from "@/lib/admin/is-admin";
import { createClient } from "@/lib/supabase/server";

export type ReviewState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  caregiverId: z.uuid({ error: "That caregiver id is not valid." }),
  status: z.enum(["approved", "rejected"], {
    error: "A decision is either approved or rejected.",
  }),
});

/**
 * The only write an admin makes.
 *
 * RLS already refuses a non-admin, and the guard trigger refuses a non-admin
 * changing `verification_status`, but the check is repeated here so the action
 * says "not authorized" instead of returning a database error the page would
 * have to translate.
 *
 * `reviewed_by` is the caller from the session, never a value from the form.
 * The time is set here rather than defaulted in Postgres so the audit row and
 * the status change are unambiguously the same write.
 *
 * Documents are not touched. The admin approves the caregiver; per-document
 * review stays unused.
 */
export async function setVerificationStatusAction(
  _previous: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const parsed = schema.safeParse({
    caregiverId: formData.get("caregiverId"),
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

  const { error, count } = await supabase
    .from("caregivers")
    .update(
      {
        verification_status: parsed.data.status,
        reviewed_by: reviewer ?? null,
        reviewed_at: new Date().toISOString(),
      },
      { count: "exact" },
    )
    .eq("user_id", parsed.data.caregiverId);

  if (error) {
    return { error: error.message };
  }

  if (count === 0) {
    return { error: "That caregiver no longer exists." };
  }

  revalidatePath("/admin/caregiver");
  revalidatePath(`/admin/caregiver/${parsed.data.caregiverId}`);
  revalidatePath("/me");

  return { ok: true };
}
