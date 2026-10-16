import "server-only";

import { z } from "zod";

/**
 * Server-only configuration.
 *
 * Kept apart from `src/lib/env.ts` on purpose. That module is imported by the
 * browser Supabase client, so anything added to it is compiled into the client
 * bundle — a secret there would ship to every visitor. `server-only` makes an
 * accidental import from a client component a build error rather than a leak.
 *
 * Validated lazily, unlike the Supabase config. A missing Supabase URL breaks
 * every page, so failing at boot is right. A missing Resend key breaks one form
 * on one page, and failing the whole build over it would mean the contact page
 * cannot ship until an email account is ready.
 */

const schema = z.object({
  RESEND_API_KEY: z
    .string({ error: "Missing. Resend > API Keys." })
    .min(1, { error: "Missing. Resend > API Keys." }),
  /** Must be an address on a domain verified in Resend. */
  CONTACT_FROM_EMAIL: z
    .string({ error: "Missing. The address contact mail is sent from." })
    .min(1, { error: "Missing. The address contact mail is sent from." }),
  /** Where contact mail is delivered. */
  CONTACT_TO_EMAIL: z
    .string({ error: "Missing. The inbox that reads contact mail." })
    .min(1, { error: "Missing. The inbox that reads contact mail." }),
});

let cached: z.infer<typeof schema> | null = null;

/** Throws with a readable message the first time it is called without full config. */
export function serverEnv() {
  if (cached) return cached;

  const parsed = schema.safeParse({
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid server environment. Fix the following:\n\n${z.prettifyError(parsed.error)}\n`,
    );
  }

  cached = parsed.data;
  return cached;
}
