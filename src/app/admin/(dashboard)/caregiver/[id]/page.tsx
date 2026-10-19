import { ArrowLeftIcon, CheckIcon, ExternalLinkIcon, MinusIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cn } from "cn";

import { ReviewActions } from "@/components/admin/review-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/admin/format";
import { getCaregiverForReview } from "@/lib/admin/queries";
import { DAYS } from "@/lib/caregiver/availability";
import { completeness } from "@/lib/caregiver/completeness";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export const metadata: Metadata = {
  title: "Caregiver — Admin",
  robots: { index: false, follow: false },
};

const DOCUMENT_KINDS: Record<string, string> = {
  background_check: "Background check",
  certification: "Certification",
  other: "Other",
};

/**
 * One caregiver, read before a decision.
 *
 * The screen is ordered the way the decision is made: who they are and what they
 * put on their profile, how to reach them, the document the review is about,
 * then what they can work. Approve and Reject sit at the top because they are
 * the reason the page exists; the rest is evidence.
 *
 * The background check is opened through a signed URL generated here, on the
 * server, for an hour. It is a new tab rather than an inline viewer because a
 * PDF and an image need different viewers, and the browser already has both.
 */
export default async function AdminCaregiverPage(
  props: PageProps<"/admin/caregiver/[id]">,
) {
  await connection();

  const { id } = await props.params;
  const supabase = await createClient();
  const review = await getCaregiverForReview(supabase, id);

  if (!review) {
    notFound();
  }

  const { caregiver, contacts, documents, availability } = review;

  const items = completeness({
    displayName: caregiver.display_name,
    bio: caregiver.bio,
    avatarPath: caregiver.avatar_path,
    contactCount: contacts.length,
    backgroundCheckCount: documents.filter((document) => document.kind === "background_check")
      .length,
    availabilityCount: availability.length,
  });

  const done = items.filter((item) => item.done).length;

  const avatarSrc = caregiver.avatar_path
    ? `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${caregiver.avatar_path}`
    : null;

  const name = caregiver.display_name || "No name yet";

  return (
    <div className="flex max-w-3xl flex-col gap-12">
      <div className="flex flex-col gap-6">
        <Link
          href="/admin/caregiver"
          className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          <ArrowLeftIcon className="size-3.5" />
          Caregivers
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt=""
                width={64}
                height={64}
                className="size-16 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="grid size-16 place-items-center rounded-full border border-border bg-muted font-heading text-xl text-muted-foreground">
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-2xl font-medium tracking-tight">{name}</h1>
              <p className="text-muted-foreground">{caregiver.email}</p>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <StatusBadge
                  status={caregiver.verification_status}
                  submitted={Boolean(caregiver.submitted_at)}
                />
                <span className="text-xs text-muted-foreground">
                  {caregiver.submitted_at
                    ? `Submitted ${formatDate(caregiver.submitted_at)}`
                    : "Still onboarding"}
                </span>
              </div>
            </div>
          </div>

          <ReviewActions
            caregiverId={caregiver.user_id}
            status={caregiver.verification_status}
          />
        </div>

        {caregiver.reviewed_at ? (
          <p className="text-sm text-muted-foreground">
            Last decided {formatDate(caregiver.reviewed_at)}.
          </p>
        ) : null}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-medium tracking-tight">Profile</h2>

        {caregiver.bio ? (
          <p className="text-pretty text-muted-foreground">{caregiver.bio}</p>
        ) : (
          <p className="text-muted-foreground">No bio yet.</p>
        )}

        <div className="rounded-lg border border-border px-4 py-3">
          <p className="text-sm font-medium">
            {done} of {items.length} complete
          </p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {items.map((item) => (
              <li
                key={item.key}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                {item.done ? (
                  <CheckIcon className="size-3.5 text-success" />
                ) : (
                  <MinusIcon className="size-3.5" />
                )}
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-medium tracking-tight">Contact details</h2>

        {contacts.length === 0 ? (
          <p className="text-muted-foreground">No contact details yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {contacts.map((contact) => (
              <li
                key={contact.id}
                className="flex flex-col gap-1 rounded-lg border border-border px-4 py-3"
              >
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {contact.label}
                </p>
                {contact.phone ? <p className="font-medium">{contact.phone}</p> : null}
                {contact.email ? (
                  <p className="text-sm text-muted-foreground">{contact.email}</p>
                ) : null}
                {contact.address ? (
                  <p className="text-sm text-muted-foreground">{contact.address}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-medium tracking-tight">Documents</h2>

        {documents.length === 0 ? (
          <p className="text-muted-foreground">
            Nothing uploaded yet. The background check is what the review is for.
          </p>
        ) : (
          <ul className="flex flex-col">
            {documents.map((document) => (
              <li
                key={document.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {document.file_name ?? "Document"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {DOCUMENT_KINDS[document.kind] ?? document.kind}
                    {formatDate(document.created_at)
                      ? ` · ${formatDate(document.created_at)}`
                      : ""}
                  </p>
                </div>

                {document.url ? (
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
                  >
                    Open
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">Link unavailable</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-medium tracking-tight">
          Weekly availability
        </h2>

        {availability.length === 0 ? (
          <p className="text-muted-foreground">No availability set.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {DAYS.map((day) => {
              const blocks = availability.filter((block) => block.day_of_week === day.value);

              if (blocks.length === 0) return null;

              return (
                <li key={day.value} className="flex gap-6 text-sm">
                  <span className="w-20 shrink-0 text-muted-foreground">{day.long}</span>
                  <span>
                    {blocks
                      .map(
                        (block) =>
                          `${formatTime(block.start_time)}–${formatTime(block.end_time)}`,
                      )
                      .join(", ")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
