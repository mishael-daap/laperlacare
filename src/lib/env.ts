import { z } from "zod";

/**
 * Supabase configuration.
 *
 * Importing this module validates the config immediately, so a misconfigured
 * deploy fails at boot with a readable message rather than failing later at the
 * first query.
 *
 * These are all NEXT_PUBLIC_* values, which Next.js inlines at build time, so
 * this module is safe to import from client and server code alike. Secrets are
 * deliberately absent: nothing in the app needs one yet.
 */

// Supabase is retiring the anon / service_role JWTs by the end of 2026. A long
// "eyJ..." value is a legacy key, and pasting the wrong one is a common mistake
// that fails confusingly, so it is rejected here with an explanation.
const notLegacyJwt = (value: string) => !value.startsWith("eyJ");

const legacyKeyMessage =
  "This looks like a legacy anon key. Copy the sb_publishable_ key from Supabase > Settings > API Keys instead.";

const publishableKeyMessage = "Missing. Supabase > Settings > API Keys > publishable key.";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url({
    error: "Must be the full project URL, e.g. https://<ref>.supabase.co",
  }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string({ error: publishableKeyMessage })
    .min(1, { error: publishableKeyMessage })
    .refine(notLegacyJwt, { error: legacyKeyMessage }),
  NEXT_PUBLIC_SITE_URL: z.url({
    error: "Must include the scheme, e.g. http://localhost:3000",
  }),
});

const parsed = schema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
  throw new Error(
    `Invalid environment. Fix the following before starting:\n\n${z.prettifyError(parsed.error)}\n`,
  );
}

/** Validated Supabase configuration. Safe to read from client and server code. */
export const env = parsed.data;
