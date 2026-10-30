/**
 * What a caregiver signs, and what they agree to about the background check.
 *
 * Versioned, and the version is stored on every signature. The record has to say
 * what the person actually read — without that, changing a sentence next year
 * would retroactively change what somebody agreed to today, and the signature
 * would mean nothing.
 *
 * Changing either text means a new `STATEMENT_VERSION`. The old signatures keep
 * pointing at the version they were given; nothing is backfilled.
 *
 * Both strings are shown verbatim on `/application` and are the same words the
 * paper form uses. Do not paraphrase them into the UI.
 */

export const STATEMENT_VERSION = "2026-10-v1";

/**
 * The paragraph above the checkbox. It is here rather than inline in the
 * component because it is part of the consent record, not decoration.
 */
export const BACKGROUND_CHECK_TEXT =
  "Every Perla Care caregiver completes a background check before their profile goes live. " +
  "The check costs about $40 and is paid by the caregiver. You will receive a separate " +
  "disclosure and authorization form from our screening partner; nothing is run until you sign it.";

/**
 * The box itself. Short because it is read twice: once in the paragraph above,
 * once as the thing being agreed to.
 */
export const BACKGROUND_CHECK_AGREEMENT =
  "I understand and agree to complete a background check, and TrustLine registration if I work with children.";

/**
 * The attestation the typed name sits under. This is the sentence the signature
 * is a signature of, so it says both that the answers are true and that the
 * platform is not an employer — the second half is the one that matters if the
 * relationship is ever questioned.
 */
export const STATEMENT_TEXT =
  "I confirm that the information in this application is true and complete. " +
  "I understand that Perla Care connects caregivers and families, that families hire and pay " +
  "caregivers directly, and that Perla Care is not my employer.";
