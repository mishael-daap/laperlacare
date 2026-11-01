import Image from "next/image";
import Link from "next/link";
import { CheckIcon, MinusIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  hoursLabel,
  matchProfileHref,
  type MatchOptions,
  type MatchRow,
  type MatchTier,
} from "@/lib/matching/options";

import { SaveButton } from "./save-button";

const TIER: Record<MatchTier, { label: string; variant: "success" | "warning" | "outline" }> = {
  great: { label: "Great fit", variant: "success" },
  good: { label: "Good fit", variant: "warning" },
  partial: { label: "Partial fit", variant: "outline" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * One caregiver, scored.
 *
 * The reasons and the gaps sit in the same block on purpose: a card that lists
 * only what matches reads as a promise, and the honest thing is a card that says
 * *covers 6 of 8 hours* next to *no cover for Thursday afternoon*. Both sentences
 * are written by the database from the household's own rows.
 */
export function MatchCard({
  match,
  options,
  saved,
  avatarUrl,
}: {
  match: MatchRow;
  options: MatchOptions;
  saved: boolean;
  avatarUrl: string | null;
}) {
  const tier = TIER[match.tier] ?? TIER.partial;
  const gaps = [
    ...match.gaps,
    ...match.missing_supports.map((label) => `Cannot provide ${label.toLowerCase()}`),
  ];

  return (
    <article className="flex flex-col rounded-[1.5rem] bg-card p-6 ring-1 ring-inset ring-brand-sage-300">
      <div className="flex items-start gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-brand-sage-100">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt=""
              width={56}
              height={56}
              className="size-full object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="grid size-full place-items-center font-heading text-lg text-brand-sage-700"
            >
              {initials(match.display_name)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-xl tracking-tight">
              <Link
                href={matchProfileHref(options, match.caregiver_id)}
                className="underline-offset-4 hover:underline"
              >
                {match.display_name}
              </Link>
            </h2>
            <Badge variant={tier.variant}>{tier.label}</Badge>
          </div>

          <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-brand-sage-700">
            <span>
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
          </p>
        </div>

        <SaveButton caregiverId={match.caregiver_id} saved={saved} />
      </div>

      {match.bio ? (
        <p className="mt-4 line-clamp-3 text-pretty text-brand-sage-700">{match.bio}</p>
      ) : null}

      <dl className="mt-5 grid gap-4 border-t border-brand-sage-300 pt-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-brand-sage-700 uppercase">
            Why you match
          </dt>
          <dd>
            <ul className="mt-2 flex flex-col gap-1.5">
              {match.reasons.map((reason) => (
                <li key={reason} className="flex gap-2 text-sm text-brand-forest">
                  <CheckIcon
                    aria-hidden="true"
                    className="mt-1 size-3.5 shrink-0 text-success"
                    strokeWidth={3}
                  />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </dd>
        </div>

        <div>
          <dt className="text-xs font-semibold tracking-wide text-brand-sage-700 uppercase">
            {gaps.length > 0 ? "What is missing" : "Hours covered"}
          </dt>
          <dd>
            {gaps.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1.5">
                {gaps.map((gap) => (
                  <li key={gap} className="flex gap-2 text-sm text-brand-sage-700">
                    <MinusIcon
                      aria-hidden="true"
                      className="mt-1 size-3.5 shrink-0 text-destructive"
                      strokeWidth={3}
                    />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-brand-sage-700">
                All {hoursLabel(match.overlap_minutes, match.window_minutes)} you
                need.
              </p>
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
}
