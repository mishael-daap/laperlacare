"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessageAction, type ContactState } from "@/lib/contact/actions";

/**
 * The contact form.
 *
 * Three fields, because a contact form is not an intake form — asking for a
 * child's age and a postcode would raise the drop-off for information we do not
 * need yet, and this page exists to answer a question about whether we cover
 * somebody's area.
 *
 * On success the form is replaced rather than cleared. Leaving an empty form on
 * screen after a message has gone gives no sign that anything happened, and
 * invites the same message twice.
 *
 * No required attribute on the fields. The server validates the same rules and
 * says so in the same words, so the browser's own bubble would only be a second
 * opinion with a different voice — one validation path, not two.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    sendContactMessageAction,
    undefined,
  );

  if (state?.ok) {
    return (
      <p role="status" className="text-pretty text-muted-foreground">
        Thank you — your message is on its way. We reply to every one, so expect
        an answer at the address you gave us.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" autoComplete="name" className="h-11" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Tell us the area you are in and what you are looking for."
        />
      </div>

      {state?.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="xl" disabled={pending} className="self-start">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
