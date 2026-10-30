"use client";

import { CheckIcon, MinusIcon, PhoneIcon } from "lucide-react";
import { useActionState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  approveCaregiverAction,
  checkReferenceAction,
  declineCaregiverAction,
  saveApplicationRecordAction,
  type ReviewState,
} from "@/lib/admin/actions";
import { formatDate } from "@/lib/admin/format";
import {
  CONDITIONS,
  COUNTIES,
  LANGUAGES,
  PETS,
  labelFor,
  labelsFor,
} from "@/lib/caregiver/answers";
import type { CaregiverDetail } from "@/lib/admin/queries";

type ExperienceRow = {
  id: string;
  employer: string;
  role: string;
  started_on: string;
  ended_on: string | null;
  ages_and_needs: string | null;
};

type ReferenceRow = {
  id: string;
  full_name: string;
  relationship: string;
  organisation: string | null;
  phone: string | null;
  email: string | null;
  known_for: string | null;
  checked_at: string | null;
  checked_outcome: string | null;
};

const month = (value: string | null) =>
  value
    ? new Date(`${value}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "now";

/**
 * The application, as a reviewer reads it.
 *
 * Read-only, and deliberately so: an admin decides about documents, not about a
 * person. The only writes on this panel are the three facts that happen offline —
 * the interview, the TrustLine answer, and whether a reference was actually
 * spoken to.
 *
 * Everything else on the paper form's "For Perla Care use only" table is derived
 * and shown with a tick or a dash, so a reviewer can see at a glance what is
 * still outstanding without cross-referencing four other sections.
 */
export function ApplicationPanel({
  caregiver,
  experience,
  references,
}: {
  caregiver: CaregiverDetail;
  experience: ExperienceRow[];
  references: ReferenceRow[];
}) {
  const [recordState, saveRecord, savingRecord] = useActionState<ReviewState, FormData>(
    saveApplicationRecordAction,
    undefined,
  );
  const [declineState, doDecline, declining] = useActionState<ReviewState, FormData>(
    declineCaregiverAction,
    undefined,
  );
  const [pending, startTransition] = useTransition();

  const yesNo = (value: boolean | null) =>
    value === null ? "Not answered" : value ? "Yes" : "No";

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg tracking-tight">Application</h2>

        <div className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <Fact label="Legal name" value={caregiver.legal_name} />
          <Fact label="Referral" value={caregiver.referral_source} />
          <Fact
            label="Home address"
            value={[
              caregiver.address_street,
              caregiver.address_city,
              caregiver.address_postal_code,
            ]
              .filter(Boolean)
              .join(", ")}
          />
          <Fact
            label="Regional Center"
            value={
              caregiver.regional_center_worker === true
                ? (caregiver.regional_center_name ?? "Yes")
                : caregiver.regional_center_worker === false
                  ? "No"
                  : null
            }
          />
          <Fact label="Rate" value={caregiver.hourly_rate ? `$${caregiver.hourly_rate}/hour` : null} />
          <Fact
            label="Travel"
            value={caregiver.max_travel_miles ? `${caregiver.max_travel_miles} miles` : null}
          />
          <Fact
            label="Earliest start"
            value={caregiver.earliest_start_date ? formatDate(caregiver.earliest_start_date) : null}
          />
          <Fact
            label="Pets"
            value={labelFor(PETS, caregiver.pets) ?? "Not answered"}
          />
          <Fact label="Car and insurance" value={yesNo(caregiver.car_and_insurance)} />
          <Fact label="Willing to drive" value={yesNo(caregiver.willing_to_drive)} />
          <Fact label="Non-smoker" value={yesNo(caregiver.non_smoker)} />
          <Fact
            label="Counties"
            value={labelsFor(COUNTIES, caregiver.counties).join(", ") || null}
          />
          <Fact
            label="Languages"
            value={labelsFor(LANGUAGES, caregiver.languages).join(", ") || null}
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground">Areas worked with</p>
          {labelsFor(CONDITIONS, caregiver.conditions).length === 0 ? (
            <p className="text-sm text-muted-foreground">None ticked.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {labelsFor(CONDITIONS, caregiver.conditions).map((label) => (
                <Badge key={label} variant="secondary">
                  {label}
                </Badge>
              ))}
            </div>
          )}
          {caregiver.other_condition ? (
            <p className="text-sm text-muted-foreground">
              Other: {caregiver.other_condition}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground">Experience</p>
          {experience.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing added.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {experience.map((row) => (
                <li key={row.id} className="rounded-lg border border-border px-4 py-3">
                  <p className="text-sm font-semibold">
                    {row.role} · {row.employer}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {month(row.started_on)} – {month(row.ended_on)}
                  </p>
                  {row.ages_and_needs ? (
                    <p className="mt-1 text-sm text-muted-foreground">{row.ages_and_needs}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground">Their answers</p>
          <div className="flex flex-col gap-3">
            <Answer
              question="Why do you want to work with people with special needs?"
              value={caregiver.why_special_needs}
            />
            <Answer
              question="A difficult moment, and how they handled it"
              value={caregiver.difficult_moment}
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg tracking-tight">References</h2>

        {references.length === 0 ? (
          <p className="text-muted-foreground">Nothing added.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {references.map((reference) => (
              <li
                key={reference.id}
                className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{reference.full_name}</p>
                  <Badge variant="outline">{reference.relationship}</Badge>

                  {reference.checked_outcome ? (
                    <Badge
                      variant={reference.checked_outcome === "ok" ? "success" : "destructive"}
                    >
                      {reference.checked_outcome === "ok" ? "Checked" : "Concern"}
                    </Badge>
                  ) : (
                    <Badge variant="warning">Not checked</Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {[reference.organisation, reference.known_for]
                    .filter(Boolean)
                    .join(" · ")}
                </p>

                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  {reference.phone ? (
                    <span className="flex items-center gap-1.5">
                      <PhoneIcon className="size-3.5" />
                      {reference.phone}
                    </span>
                  ) : null}
                  {reference.email ? <span>{reference.email}</span> : null}
                </p>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await checkReferenceAction(reference.id, "ok");
                      })
                    }
                  >
                    <CheckIcon />
                    Checked
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await checkReferenceAction(reference.id, "concern");
                      })
                    }
                  >
                    <MinusIcon />
                    Concern
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg tracking-tight">Application record</h2>

        <ul className="flex flex-col gap-2 text-sm">
          <Derived label="Application received" done={Boolean(caregiver.submitted_at)} value={formatDate(caregiver.submitted_at)} />
          <Derived label="Reference 1 checked" done={Boolean(references[0]?.checked_at)} />
          <Derived label="Reference 2 checked" done={Boolean(references[1]?.checked_at)} />
          <Derived
            label="Background check"
            done={caregiver.verification_status === "approved"}
          />
          <Derived label="Signed" done={Boolean(caregiver.signed_at)} value={formatDate(caregiver.signed_at)} />
          <Derived label="Profile published" done={caregiver.verification_status === "approved"} />
        </ul>

        <form action={saveRecord} className="flex flex-col gap-4 rounded-xl border border-border px-5 py-5">
          <input type="hidden" name="userId" value={caregiver.user_id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="interviewedAt">Video interview</Label>
              <Input
                id="interviewedAt"
                name="interviewedAt"
                type="date"
                defaultValue={
                  caregiver.interviewed_at
                    ? new Date(caregiver.interviewed_at).toISOString().slice(0, 10)
                    : ""
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="interviewOutcome">Outcome</Label>
              <select
                id="interviewOutcome"
                name="interviewOutcome"
                defaultValue={caregiver.interview_outcome ?? ""}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="">Not decided</option>
                <option value="pass">Pass</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="trustlineStatus">TrustLine</Label>
              <select
                id="trustlineStatus"
                name="trustlineStatus"
                defaultValue={caregiver.trustline_status ?? ""}
                className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="">Not recorded</option>
                <option value="cleared">Cleared</option>
                <option value="pending">Pending</option>
                <option value="na">Not applicable</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={savingRecord}>
              {savingRecord ? "Saving…" : "Save record"}
            </Button>
            {recordState?.error ? (
              <p className="text-sm text-destructive">{recordState.error}</p>
            ) : null}
            {recordState?.ok ? (
              <p className="text-sm text-success">Saved.</p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg tracking-tight">The decision</h2>

        {caregiver.approved_at ? (
          <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
            <span className="font-semibold">Approved</span> on{" "}
            {formatDate(caregiver.approved_at)}. From here each credential is
            approved or rejected on its own, and one falling out of date does not
            withdraw the approval.
          </p>
        ) : caregiver.declined_at ? (
          <p className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
            <span className="font-semibold">Declined</span> on{" "}
            {formatDate(caregiver.declined_at)} — {caregiver.declined_reason}
          </p>
        ) : (
          <p className="text-muted-foreground">
            Not decided yet. Approving the profile needs a cleared background
            check.
          </p>
        )}

        {!caregiver.approved_at && !caregiver.declined_at ? (
          <div className="flex flex-wrap items-start gap-6">
            <Button
              type="button"
              size="sm"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await approveCaregiverAction(caregiver.user_id);
                })
              }
            >
              <CheckIcon />
              Approve profile
            </Button>

            <form action={doDecline} className="flex flex-1 flex-col gap-2">
              <input type="hidden" name="userId" value={caregiver.user_id} />
              <Textarea
                name="reason"
                rows={2}
                placeholder="Why not? The caregiver sees this word for word."
              />
              <div className="flex items-center gap-3">
                <Button type="submit" size="sm" variant="outline" disabled={declining}>
                  {declining ? "Declining…" : "Decline"}
                </Button>
                {declineState?.error ? (
                  <p className="text-sm text-destructive">{declineState.error}</p>
                ) : null}
                {declineState?.ok ? <p className="text-sm text-success">Declined.</p> : null}
              </div>
            </form>
          </div>
        ) : null}
      </section>

    </div>
  );
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p>{value ? value : <span className="text-muted-foreground">Not answered</span>}</p>
    </div>
  );
}

function Answer({ question, value }: { question: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-xs text-muted-foreground">{question}</p>
      <p className="mt-1 text-sm whitespace-pre-line">
        {value ? value : <span className="text-muted-foreground">Not answered</span>}
      </p>
    </div>
  );
}

function Derived({
  label,
  done,
  value,
}: {
  label: string;
  done: boolean;
  value?: string | null;
}) {
  return (
    <li className="flex items-center gap-2">
      {done ? (
        <CheckIcon className="size-3.5 text-success" />
      ) : (
        <MinusIcon className="size-3.5 text-muted-foreground" />
      )}
      <span className={done ? "" : "text-muted-foreground"}>{label}</span>
      {value ? <span className="text-muted-foreground">· {value}</span> : null}
    </li>
  );
}
