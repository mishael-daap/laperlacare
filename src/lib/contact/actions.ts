"use server";

import { Resend } from "resend";
import { z } from "zod";

import { serverEnv } from "@/lib/env.server";

export type ContactState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  name: z.string().trim().min(1, { error: "Tell us your name." }),
  email: z.email({ error: "Enter an email address we can reply to." }),
  message: z
    .string()
    .trim()
    .min(10, { error: "Tell us a little more so we can point you the right way." }),
});

/**
 * Sends a contact message to our own inbox.
 *
 * `from` has to sit on the verified domain — Resend refuses anything else — so
 * the visitor is not the sender on the envelope. They are the `replyTo`
 * instead, which is what makes hitting Reply in the inbox answer them rather
 * than us, and their address is written into the body as well so it is readable
 * without opening the reply.
 *
 * No database row. A message that is also an email does not need storing, and
 * there is no admin screen to read a stored one from.
 */
export async function sendContactMessageAction(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const { name, email, message } = parsed.data;
  const env = serverEnv();
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from: env.CONTACT_FROM_EMAIL,
    to: env.CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `Contact form: ${name}`,
    text: [`Name: ${name}`, `Email: ${email}`, "", message].join("\n"),
  });

  if (error) {
    // The visitor gets something they can act on. The reason is not repeated
    // back, because "domain not verified" or an internal id means nothing to
    // them and says something about our setup that is not theirs to read.
    return { error: "We could not send your message just now. Please try again." };
  }

  return { ok: true };
}
