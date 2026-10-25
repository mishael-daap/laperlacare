import "server-only";

import { Resend } from "resend";

import { kindInSentence, kindLabel, rejectionReasonLabel } from "@/lib/caregiver/credentials";
import { env } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";

/**
 * Tells a caregiver that one document was not accepted, and why.
 *
 * A courtesy, not the record. The decision and its reason are stored in
 * `caregiver_document_reviews` and shown on `/me`; this email exists so they do
 * not have to open the app to find out. A failed send must therefore never be
 * treated as a failed rejection, which is why the caller reports it as a
 * warning rather than an error.
 *
 * Plain text, like the contact form. There is nothing here worth the weight of
 * an HTML template, and plain text is what survives every client.
 *
 * The message is the admin's own words and is included verbatim. It is optional
 * except for the `other` reason, which the action refuses without it.
 */
export async function sendDocumentRejectionEmail(input: {
  to: string;
  /** The caregiver's display name. Null for an account that has not set one. */
  name: string | null;
  kind: string;
  reason: string;
  message: string | null;
}) {
  const server = serverEnv();
  const resend = new Resend(server.RESEND_API_KEY);

  // A legacy rejection has no reason. It cannot trigger this email, but the
  // fallback keeps the type honest rather than printing "null".
  const reason = rejectionReasonLabel(input.reason) ?? "Not accepted";
  const greeting = input.name?.trim() ? `Hi ${input.name.trim()},` : "Hi there,";

  const lines = [
    greeting,
    "",
    `We reviewed the ${kindInSentence(input.kind)} you uploaded and could not accept it.`,
    "",
    `Reason: ${reason}`,
  ];

  if (input.message) {
    lines.push("", input.message);
  }

  lines.push(
    "",
    `Replace it here: ${env.NEXT_PUBLIC_SITE_URL}/me`,
    "",
    "Uploading a new file puts it back in the review queue. Every document is reviewed on its own.",
    "",
    "— Perla Care",
  );

  const { error } = await resend.emails.send({
    // Resend refuses a sender that is not on a verified domain, so the envelope
    // stays ours. Replies go to the monitored inbox rather than nowhere.
    from: `Perla Care <${server.CONTACT_FROM_EMAIL}>`,
    to: input.to,
    replyTo: server.CONTACT_FROM_EMAIL,
    subject: `${kindLabel(input.kind)} not accepted`,
    text: lines.join("\n"),
  });

  return error ? { error: error.message } : { ok: true as const };
}
