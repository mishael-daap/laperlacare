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

export function kindLabel(kind: string) {
  return DOCUMENT_KINDS.find((entry) => entry.value === kind)?.label ?? "Document";
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
  documents: { kind: string; review_status: string; expires_at: string | null }[],
) {
  const states = documents.map((document) => ({
    document,
    state: credentialState(document),
  }));

  const rejected = states.find((entry) => entry.state === "rejected");
  if (rejected) {
    return `${kindLabel(rejected.document.kind)} was not accepted. Replace it and we will review it again.`;
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
