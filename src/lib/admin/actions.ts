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

/**
 * The profile decision, made once.
 *
 * This is the approvaI the paper form calls "Approved": it says this person may
 * be listed, based on a cleared background check. It is not revisited when a CPR
 * card later expires — each credential answers for itself after this point, and
 * a lapsed one is a lapsed card, not a withdrawn approval.
 *
 * The background check is required by the database function rather than here, so
 * the rule holds for any caller.
 */
export async function approveCaregiverAction(userId: string): Promise<ReviewState> {
  const parsed = z.uuid({ error: "That caregiver id is not valid." }).safeParse(userId);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return { error: "Not authorized." };
  }

  const { error } = await supabase.rpc("admin_approve_caregiver", {
    p_user_id: parsed.data,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/caregiver");
  revalidatePath(`/admin/caregiver/${parsed.data}`);
  revalidatePath("/me");
  revalidatePath("/application");
  return { ok: true };
}

/** The other decision. Only possible while the profile is undecided. */
export async function declineCaregiverAction(
  _previous: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const userId = formData.get("userId");
  const reason = String(formData.get("reason") ?? "").trim();

  if (typeof userId !== "string" || !userId) {
    return { error: "That caregiver id is not valid." };
  }

  if (!reason) {
    return { error: "Say why." };
  }

  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return { error: "Not authorized." };
  }

  const { error } = await supabase.rpc("admin_decline_caregiver", {
    p_user_id: userId,
    p_reason: reason,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/caregiver");
  revalidatePath(`/admin/caregiver/${userId}`);
  return { ok: true };
}

/**
 * The interview and the TrustLine answer — the two steps of the paper form's
 * review panel that have no document and no derivation behind them.
 *
 * Everything else on that panel is read from a row: received from `submitted_at`,
 * the two references from their own rows, the background check and the CPR proof
 * from the credential decisions, published and the overall decision from
 * `private.caregiver_status`.
 */
export async function saveApplicationRecordAction(
  _previous: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const userId = formData.get("userId");
  const interviewedAt = String(formData.get("interviewedAt") ?? "").trim();
  const interviewOutcome = String(formData.get("interviewOutcome") ?? "").trim();
  const trustlineStatus = String(formData.get("trustlineStatus") ?? "").trim();

  if (typeof userId !== "string" || !userId) {
    return { error: "That caregiver id is not valid." };
  }

  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return { error: "Not authorized." };
  }

  const { error } = await supabase.rpc("admin_set_application_record", {
    p_user_id: userId,
    p_interviewed_at: interviewedAt ? new Date(`${interviewedAt}T12:00:00Z`).toISOString() : undefined,
    p_interview_outcome: interviewOutcome || undefined,
    p_trustline_status: trustlineStatus || undefined,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/caregiver/${userId}`);
  return { ok: true };
}

/** Records that a reference was spoken to, and what came of it. */
export async function checkReferenceAction(
  referenceId: string,
  outcome: "ok" | "concern",
): Promise<ReviewState> {
  const parsed = z.uuid({ error: "That reference id is not valid." }).safeParse(referenceId);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const supabase = await createClient();

  if (!(await isAdmin(supabase))) {
    return { error: "Not authorized." };
  }

  const { error } = await supabase.rpc("admin_check_reference", {
    p_reference_id: parsed.data,
    p_outcome: outcome,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/caregiver");
  return { ok: true };
}
