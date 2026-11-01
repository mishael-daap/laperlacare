import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { CheckIcon, LockIcon, MinusIcon } from "lucide-react";

import { Action } from "@/components/landing/action";
import { SiteFooter } from "@/components/landing/footer";
import { SaveButton } from "@/components/matching/save-button";
import { Badge } from "@/components/ui/badge";
import { isAdmin } from "@/lib/admin/is-admin";
import { ensureHousehold } from "@/lib/auth/ensure-household";
import { isCaregiver } from "@/lib/caregiver/is-caregiver";
import { env } from "@/lib/env";
import { DEFAULT_OPTIONS, hoursLabel, parseMatchOptions, type MatchTier } from "@/lib/matching/options";
import { getMatch, getShortlist } from "@/lib/matching/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Caregiver — Perla Care",
  robots: { index: false, follow: false },
};

export const instant = false;

const TIER: Record<MatchTier, { label: string; variant: "success" | "warning" | "outline" }> = {
  great: { label: "Great fit", variant: "success" },
  good: { label: "Good fit", variant: "warning" },
  partial: { label: "Partial fit", variant: "outline" },
};

/**
 * One matched caregiver, in full.
 *
 * The contact details are the thing this page cannot show. Membership is item 8,
 * so what is here instead is the honest version of a locked door: a sentence, a
 * button to the pricing page, and no phone number anywhere in the response — the
 * match function never selects one.
 */
export default async function MatchPage(props: PageProps<"/matches/[id]">) {
  await connection();

  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const options = parseMatchOptions(searchParams);

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims?.sub) {
    redirect(`/sign-in?next=/matches/${id}`);
  }

  if (await isAdmin(supabase)) {
    redirect("/admin/caregiver");
  }

  if (await isCaregiver(supabase)) {
    redirect("/me");
  }

  const householdId = await ensureHousehold(supabase);

  // Read with the levers that found them. A deep link without them falls back to
  // the most forgiving settings, so a shared profile still opens instead of
  // claiming the caregiver does not exist.
  const [match, shortlist] = await Promise.all([
    getMatch(supabase, id, options).then(
      (found) =>
        found ??
        getMatch(supabase, id, {
          ...DEFAULT_OPTIONS,
          hours: "day",
          partial: true,
          gender: "any",
        }),
    ),
    getShortlist(supabase, householdId),
  ]);

  if (!match) notFound();

  const tier = TIER[match.tier] ?? TIER.partial;
  const avatarUrl = match.avatar_path
    ? `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${match.avatar_path}`
    : null;

  return (
    <>
      <main className="flex-1">
        <div className="landing-shell pt-24 pb-28 sm:pt-32 sm:pb-36">
          <Link
            href="/matches"
            className="text-sm text-brand-sage-700 underline underline-offset-4 hover:text-brand-forest"
          >
            ← All matches
          </Link>
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-brand-sage-100">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={96}
                  height={96}
                  className="size-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="grid size-full place-items-center font-heading text-2xl text-brand-sage-700"
                >
                  {match.display_name
                    .split(" ")
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join("")}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="section-head font-heading">{match.display_name}</h1>
                <Badge variant={tier.variant}>{tier.label}</Badge>
              </div>

              <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-brand-sage-700">
                <span className="font-semibold text-brand-forest">
                  {match.hourly_rate ? `$${match.hourly_rate}/hour` : "Rate not set"}
                </span>
                {match.age_min !== null && match.age_max !== null ? (
                  <span>
                    Ages {match.age_min}–{match.age_max}
                  </span>
                ) : null}
                {match.languages.length > 0 ? (
                  <span className="capitalize">{match.languages.join(", ")}</span>
                ) : null}
                {match.counties.length > 0 ? (
                  <span className="capitalize">
                    {match.counties.map((county) => county.replace(/_/g, " ")).join(", ")}
                  </span>
                ) : null}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <SaveButton
                  caregiverId={match.caregiver_id}
                  saved={shortlist.includes(match.caregiver_id)}
                  withLabel
                />
                <Action href="/pricing">See membership</Action>
              </div>
            </div>
          </div>

          {match.bio ? (
            <p className="mt-10 max-w-[70ch] text-pretty text-brand-sage-700">{match.bio}</p>
          ) : null}

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <section className="rounded-[1.5rem] bg-card p-6 ring-1 ring-inset ring-brand-sage-300">
              <h2 className="text-xs font-semibold tracking-wide text-brand-sage-700 uppercase">
                Why you match
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {match.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2 text-brand-forest">
                    <CheckIcon
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-success"
                      strokeWidth={3}
                    />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-[1.5rem] bg-card p-6 ring-1 ring-inset ring-brand-sage-300">
              <h2 className="text-xs font-semibold tracking-wide text-brand-sage-700 uppercase">
                {match.gaps.length > 0 ? "What is missing" : "Coverage"}
              </h2>

              {match.gaps.length > 0 ? (
                <ul className="mt-3 flex flex-col gap-2">
                  {match.gaps.map((gap) => (
                    <li key={gap} className="flex gap-2 text-brand-sage-700">
                      <MinusIcon
                        aria-hidden="true"
                        className="mt-1 size-4 shrink-0 text-destructive"
                        strokeWidth={3}
                      />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-brand-sage-700">
                  All {hoursLabel(match.overlap_minutes, match.window_minutes)} you
                  need, every week.
                </p>
              )}
            </section>
          </div>

          <section className="mt-6 rounded-[1.5rem] bg-brand-sage-100 p-6 ring-1 ring-inset ring-brand-sage-300">
            <div className="flex items-start gap-3">
              <LockIcon aria-hidden="true" className="mt-1 size-5 shrink-0 text-brand-forest" />
              <div>
                <h2 className="font-heading text-lg tracking-tight">
                  Contact details are part of membership
                </h2>
                <p className="mt-2 max-w-[56ch] text-pretty text-brand-sage-700">
                  {match.display_name} has been interviewed, reference-checked and
                  background-checked. Membership is what opens their phone number,
                  their email and messaging.
                </p>
                <Action href="/pricing" className="mt-5">
                  See membership
                </Action>
              </div>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
