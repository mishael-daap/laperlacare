/**
 * The vocabulary of a credential: what kinds exist, what state one is in, and
 * what the caregiver is told about it.
 *
 * Review state is stored per document now, so every label here is about one
 * row. The overall badge is not decided in this file — the database answers that
 * with `private.caregiver_status`, and this only turns the answer into words.
 */

export const DOCUMENT_KINDS = [
  { value: "background_check", label: "Background check" },
  { value: "cpr", label: "CPR" },
  { value: "drivers_licence", label: "Driver's licence" },
  { value: "certification", label: "Certification" },
  { value: "other", label: "Other" },
] as const;

export type DocumentKind = (typeof DOCUMENT_KINDS)[number]["value"];

/**
 * Why an admin refused a document.
 *
 * The slugs are duplicated from the check constraint in
 * `20261024090000_document_rejection_reasons_and_history.sql`, the same way
 * DOCUMENT_KINDS duplicates the `kind` check on the documents table. A label
 * here has to read after a colon as well as in a picker, which is why they are
 * short phrases rather than sentences.
 */
export const REJECTION_REASONS = [
  { value: "invalid_or_unreadable", label: "Invalid or unreadable" },
  { value: "not_california", label: "Not a California document" },
  { value: "expired", label: "Expired" },
  { value: "name_mismatch", label: "Name does not match the account" },
  { value: "wrong_type", label: "Wrong document type" },
  { value: "other", label: "Other" },
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number]["value"];

export function rejectionReasonLabel(reason: string | null | undefined) {
  return REJECTION_REASONS.find((entry) => entry.value === reason)?.label ?? null;
}

/**
 * "Other" is only useful with an explanation, so choosing it requires the
 * message. The other five read fine on their own.
 */
export function requiresRejectionMessage(reason: string | null | undefined) {
  return reason === "other";
}

export function kindLabel(kind: string) {
  return DOCUMENT_KINDS.find((entry) => entry.value === kind)?.label ?? "Document";
}

/**
 * The kind as it reads inside a sentence.
 *
 * `kindLabel` is a title: "Background check", "CPR". Dropping that into prose
 * with `.toLowerCase()` turns CPR into "cpr", so the sentence forms are spelled
 * out here instead.
 */
const KIND_IN_SENTENCE: Record<string, string> = {
  background_check: "background check",
  cpr: "CPR",
  drivers_licence: "driver's licence",
  certification: "certification",
  other: "document",
};

export function kindInSentence(kind: string) {
  return KIND_IN_SENTENCE[kind] ?? "document";
}

/** Longest a file name renders before it is shortened. */
export const FILE_NAME_MAX = 48;

/**
 * A scan name is not content.
 *
 * A 120-character scanner export pushes the status and the actions off the row,
 * so the display is capped while the stored name (`caregiver_documents.file_name`)
 * stays exactly as uploaded. The extension is kept because ".pdf" tells the
 * reader more than the last three characters of a serial number do.
 */
export function shortFileName(name: string, max = FILE_NAME_MAX) {
  if (name.length <= max) return name;

  const dot = name.lastIndexOf(".");
  const extension = dot > 0 && name.length - dot <= 10 ? name.slice(dot) : "";
  const stem = extension ? name.slice(0, dot) : name;
  const room = Math.max(1, max - extension.length - 1);

  return `${stem.slice(0, room).trimEnd()}…${extension}`;
}

export type CredentialState = "pending" | "approved" | "rejected" | "expired";

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Expired is not a stored status. A document keeps the decision the admin made;
 * it simply stops counting once its date has passed, which is what the caregiver
 * and the admin both need to see.
 */
export function credentialState(
  document: { review_status: string; expires_at: string | null },
  today = new Date(),
): CredentialState {
  if (document.review_status === "rejected") return "rejected";

  if (document.expires_at && document.expires_at < isoDate(today)) return "expired";

  return document.review_status === "approved" ? "approved" : "pending";
}

export function credentialLabel(state: CredentialState) {
  switch (state) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "expired":
      return "Expired";
    default:
      return "Pending review";
  }
}

/** Days a caregiver is warned before a credential stops counting. */
export const EXPIRING_SOON_DAYS = 30;

export function daysUntil(expiresAt: string, today = new Date()) {
  const target = Date.parse(`${expiresAt}T00:00:00Z`);
  const now = Date.parse(`${isoDate(today)}T00:00:00Z`);

  return Math.round((target - now) / 86_400_000);
}

/**
 * A date-only value is a calendar date, so it is formatted in UTC. Formatting it
 * in a western timezone would show the day before, which is exactly the mistake
 * `lib/age.ts` avoids for birthdays.
 */
const expiryFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatExpiry(expiresAt: string) {
  return expiryFormat.format(new Date(`${expiresAt}T00:00:00Z`));
}

/**
 * One sentence under the header, naming the thing that is actually wrong rather
 * than repeating the badge.
 *
 * Silence when there is nothing to say: a verified caregiver does not need a
 * line telling them so, and the credentials below already say it.
 */
export function statusSentence(
  status: string,
  documents: {
    kind: string;
    review_status: string;
    expires_at: string | null;
    rejection_reason?: string | null;
  }[],
) {
  const states = documents.map((document) => ({
    document,
    state: credentialState(document),
  }));

  const rejected = states.find((entry) => entry.state === "rejected");
  if (rejected) {
    // "Other" says nothing the message beside the row does not say better, so
    // the sentence falls back to the plain refusal rather than printing it.
    const reason = requiresRejectionMessage(rejected.document.rejection_reason)
      ? null
      : rejectionReasonLabel(rejected.document.rejection_reason);

    return reason
      ? `${kindLabel(rejected.document.kind)} was not accepted: ${reason}. Replace it and we will review it again.`
      : `${kindLabel(rejected.document.kind)} was not accepted. Replace it and we will review it again.`;
  }

  const expired = states.find((entry) => entry.state === "expired");
  if (expired) {
    return `Your ${kindLabel(expired.document.kind).toLowerCase()} has expired. Upload the new one to keep your profile visible.`;
  }

  if (documents.length === 0) {
    return "Add a background check and the other documents you hold. An admin reviews each one.";
  }

  const pending = states.filter((entry) => entry.state === "pending").length;
  if (pending > 0) {
    const waiting = pending === 1 ? "1 document is" : `${pending} documents are`;
    return `${waiting} waiting for review.`;
  }

  if (status === "approved") {
    return "Every document is approved, so families can see your profile.";
  }

  return null;
}
