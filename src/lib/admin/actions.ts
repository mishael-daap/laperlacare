"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { isAdmin } from "@/lib/admin/is-admin";
import { REJECTION_REASONS, requiresRejectionMessage } from "@/lib/caregiver/credentials";
import { sendDocumentRejectionEmail } from "@/lib/email/document-rejection";
import { createClient } from "@/lib/supabase/server";

export type ReviewState =
  | { error?: string; ok?: boolean; warning?: string }
  | undefined;

const schema = z
  .object({
    documentId: z.uuid({ error: "That document id is not valid." }),
    status: z.enum(["approved", "rejected"], {
      error: "A decision is either approved or rejected.",
    }),
    reason: z.string().trim().optional(),
    message: z
      .string()
      .trim()
      .max(1000, "Keep the message under 1000 characters.")
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.status === "approved") return;

    const reason = REJECTION_REASONS.find((entry) => entry.value === value.reason);

    if (!reason) {
      ctx.addIssue({
        code: "custom",
        path: ["reason"],
        message: "Choose a reason.",
      });
      return;
    }

    // "Other" is the one reason that has to be explained; on its own it tells
    // the caregiver nothing they can act on.
    if (requiresRejectionMessage(reason.value) && !value.message) {
      ctx.addIssue({
        code: "custom",
        path: ["message"],
        message: "Say what is wrong with the document.",
      });
    }
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
 * A rejection carries a reason, and the caregiver is emailed it. The write is
 * the record and happens first; the email is a courtesy, so a failed send is
 * reported as a warning and never rolls the decision back.
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
    reason: formData.get("reason") ?? undefined,
    message: formData.get("message") ?? undefined,
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
  const rejected = parsed.data.status === "rejected";

  // Approving clears both rejection columns. The scope check on the table
  // refuses an approval that leaves a reason behind, so this is not optional.
  const { data, error } = await supabase
    .from("caregiver_documents")
    .update({
      review_status: parsed.data.status,
      rejection_reason: rejected ? parsed.data.reason ?? null : null,
      rejection_message: rejected ? parsed.data.message || null : null,
      reviewed_by: reviewer ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.documentId)
    .select("caregiver_id, kind")
    .maybeSingle();

  if (error) {
    return { error: error.message };
  }

  if (!data) {
    return { error: "That document no longer exists." };
  }

  let warning: string | undefined;

  if (rejected) {
    warning = await notifyRejection(supabase, {
      caregiverId: data.caregiver_id,
      kind: data.kind,
      reason: parsed.data.reason ?? "",
      message: parsed.data.message || null,
    });
  }

  revalidatePath("/admin/caregiver");
  revalidatePath(`/admin/caregiver/${data.caregiver_id}`);
  revalidatePath("/me");

  return warning ? { ok: true, warning } : { ok: true };
}

/**
 * Looks the caregiver up through the admin RPC, because their account email
 * lives in `auth.users` and the Data API never exposes it.
 *
 * Every failure here is a warning: the decision is already committed, and
 * telling the admin to try again would invite a duplicate rejection.
 */
async function notifyRejection(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    caregiverId: string;
    kind: string;
    reason: string;
    message: string | null;
  },
) {
  const { data: detail, error } = await supabase.rpc("admin_caregiver_detail", {
    p_user_id: input.caregiverId,
  });

  const caregiver = detail?.[0];

  if (error || !caregiver?.email) {
    return "Decision saved, but the email could not be sent.";
  }

  try {
    const sent = await sendDocumentRejectionEmail({
      to: caregiver.email,
      name: caregiver.display_name,
      kind: input.kind,
      reason: input.reason,
      message: input.message,
    });

    return "error" in sent
      ? "Decision saved, but the email could not be sent."
      : undefined;
  } catch {
    return "Decision saved, but the email could not be sent.";
  }
}
