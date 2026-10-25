import { ArrowLeftIcon, CheckIcon, ExternalLinkIcon, MinusIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cn } from "cn";

import { DocumentReview } from "@/components/admin/document-review";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/admin/format";
import { getCaregiverForReview } from "@/lib/admin/queries";
import { formatAge } from "@/lib/age";
import { DAYS } from "@/lib/caregiver/availability";
import { genderLabel } from "@/lib/caregiver/capabilities";
import { completeness } from "@/lib/caregiver/completeness";
import {
  credentialLabel,
  credentialState,
  formatExpiry,
  kindLabel,
  rejectionReasonLabel,
  shortFileName,
} from "@/lib/caregiver/credentials";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export const metadata: Metadata = {
  title: "Caregiver — Admin",
  robots: { index: false, follow: false },
};

/**
 * One caregiver, read before a decision.
 *
 * There is no Approve or Reject button for the person. The decision is per
 * document, and the badge at the top is calculated from those decisions — so the
 * screen shows the evidence with its own controls rather than a summary that
 * could contradict them.
 *
 * Documents are opened through a signed URL generated here, on the server, for an
 * hour. It is a new tab rather than an inline viewer because a PDF and an image
 * need different viewers, and the browser already has both.
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

  const { caregiver, contacts, documents, history, availability, needs, supports } = review;

  const items = completeness({
    displayName: caregiver.display_name,
    bio: caregiver.bio,
    avatarPath: caregiver.avatar_path,
    dateOfBirth: caregiver.date_of_birth,
    gender: caregiver.gender,
    workingAges: caregiver.age_min !== null && caregiver.age_max !== null,
    contactCount: contacts.length,
    needCount: caregiver.need_slugs.length,
    supportCount: caregiver.support_slugs.length,
    documentCount: documents.length,
    availabilityCount: availability.length,
  });

  const done = items.filter((item) => item.done).length;

  const avatarSrc = caregiver.avatar_path
    ? `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${caregiver.avatar_path}`
    : null;

  const name = caregiver.display_name || "No name yet";

  const caps = [
    caregiver.date_of_birth ? formatAge(caregiver.date_of_birth) : null,
    genderLabel(caregiver.gender),
    caregiver.age_min !== null && caregiver.age_max !== null
      ? `Works with ages ${caregiver.age_min}\u2013${caregiver.age_max}`
      : null,
    caregiver.date_of_birth ? `Born ${formatDate(caregiver.date_of_birth)}` : null,
  ].filter((fact): fact is string => Boolean(fact));

  const needLabels = needs.filter((need) => caregiver.need_slugs.includes(need.slug));
  const supportLabels = supports.filter((support) =>
    caregiver.support_slugs.includes(support.slug),
  );

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
        </div>

        {caps.length > 0 ? (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {caps.map((fact, index) => (
              <span key={fact} className="flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden className="text-border">
                    &middot;
                  </span>
                ) : null}
                {fact}
              </span>
            ))}
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

      <section className="flex flex-col gap-6">
        <h2 className="font-heading text-lg font-medium tracking-tight">
          What they can support
        </h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">Needs</p>
            {needLabels.length === 0 ? (
              <p className="text-sm text-muted-foreground">None ticked.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {needLabels.map((need) => (
                  <Badge key={need.slug} variant="secondary">
                    {need.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">Supports</p>
            {supportLabels.length === 0 ? (
              <p className="text-sm text-muted-foreground">None ticked.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {supportLabels.map((support) => (
                  <Badge key={support.slug} variant="outline">
                    {support.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
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
        <h2 className="font-heading text-lg font-medium tracking-tight">Credentials</h2>

        {documents.length === 0 ? (
          <p className="text-muted-foreground">
            Nothing uploaded yet. A background check is where the review usually
            starts.
          </p>
        ) : (
          <ul className="flex flex-col">
            {documents.map((document) => {
              const state = credentialState(document);

              return (
                <li
                  key={document.id}
                  className="flex flex-wrap items-start justify-between gap-4 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{kindLabel(document.kind)}</p>
                      <Badge
                        variant={
                          state === "approved"
                            ? "success"
                            : state === "rejected"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {credentialLabel(state)}
                      </Badge>
                    </div>

                    <p
                      title={document.file_name ?? undefined}
                      className="truncate text-sm text-muted-foreground"
                    >
                      {shortFileName(document.file_name ?? "Document")}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {document.expires_at
                        ? `Expires ${formatExpiry(document.expires_at)}`
                        : "No expiry date"}
                      {document.reviewed_at
                        ? ` · decided ${formatDate(document.reviewed_at)}`
                        : ""}
                    </p>

                    {document.rejection_reason ? (
                      <div className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                        <p className="font-medium">
                          {rejectionReasonLabel(document.rejection_reason)}
                        </p>
                        {document.rejection_message ? (
                          <p className="mt-1 whitespace-pre-line text-muted-foreground">
                            {document.rejection_message}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {document.url ? (
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "gap-1.5",
                        )}
                      >
                        Open
                        <ExternalLinkIcon className="size-3.5" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">Link unavailable</span>
                    )}

                    <DocumentReview
                      documentId={document.id}
                      status={document.review_status}
                      kind={document.kind}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {history.length > 0 ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-lg font-medium tracking-tight">
              Review history
            </h2>
            <p className="text-muted-foreground">
              Every decision, including ones about files that have since been
              replaced.
            </p>
          </div>

          <ul className="flex flex-col">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-1 border-b border-border py-4 first:pt-0 last:border-b-0 last:pb-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{kindLabel(entry.kind)}</p>
                  <Badge variant={entry.decision === "approved" ? "success" : "destructive"}>
                    {entry.decision === "approved" ? "Approved" : "Rejected"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    decided {formatDate(entry.reviewed_at)}
                  </span>
                </div>

                <p
                  title={entry.file_name ?? undefined}
                  className="truncate text-xs text-muted-foreground"
                >
                  {shortFileName(entry.file_name ?? "Document")}
                </p>

                {entry.reason ? (
                  <p className="text-sm">{rejectionReasonLabel(entry.reason)}</p>
                ) : null}

                {entry.message ? (
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {entry.message}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
