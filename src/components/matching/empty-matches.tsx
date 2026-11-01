import Link from "next/link";

import { matchHref, type MatchOptions } from "@/lib/matching/options";

/**
 * Nothing matched.
 *
 * A dead end is the thing a filter-first catalogue is worst at, so this is never
 * just "no results": it names the lever most likely to be responsible and offers
 * one press that changes only that lever. The parent keeps every other decision
 * they made.
 */
export function EmptyMatches({
  options,
  householdHasChildren,
  householdHasWindows,
}: {
  options: MatchOptions;
  householdHasChildren: boolean;
  householdHasWindows: boolean;
}) {
  if (!householdHasChildren || !householdHasWindows) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-brand-sage-300 px-6 py-12 text-center">
        <h2 className="font-heading text-xl tracking-tight">
          {householdHasChildren
            ? "Add the days and hours you need care"
            : "Tell us about your child first"}
        </h2>
        <p className="mx-auto mt-2 max-w-[46ch] text-pretty text-brand-sage-700">
          Matching reads your household, so it needs one. Everything you enter
          there is what decides who appears here.
        </p>
        <Link
          href="/household"
          className="landing-action mt-6 inline-flex items-center px-6 text-sm font-semibold"
        >
          Go to your household
        </Link>
      </div>
    );
  }

  const suggestions: { href: string; label: string }[] = [];

  if (options.hours === "exact") {
    suggestions.push({
      href: matchHref(options, { hours: "flexible" }),
      label: "Give or take an hour either side",
    });
  } else if (options.hours === "flexible") {
    suggestions.push({
      href: matchHref(options, { hours: "day" }),
      label: "Any time on those days",
    });
  }

  if (!options.partial) {
    suggestions.push({
      href: matchHref(options, { partial: true }),
      label: "Include caregivers who cover part of the week",
    });
  }

  if (options.maxRate !== null) {
    suggestions.push({
      href: matchHref(options, { maxRate: null }),
      label: "Remove the rate limit",
    });
  }

  if (options.gender !== "household") {
    suggestions.push({
      href: matchHref(options, { gender: "household" }),
      label: "Use your household's gender preference",
    });
  }

  if (options.saved) {
    suggestions.push({
      href: matchHref(options, { saved: false }),
      label: "Look at every match again, not just your shortlist",
    });
  }

  return (
    <div className="rounded-[1.5rem] border border-dashed border-brand-sage-300 px-6 py-12 text-center">
      <h2 className="font-heading text-xl tracking-tight">
        {options.saved
          ? "Nothing saved yet"
          : "Nobody matches every part of that"}
      </h2>
      <p className="mx-auto mt-2 max-w-[46ch] text-pretty text-brand-sage-700">
        {options.saved
          ? "Press the bookmark on a caregiver to keep them here."
          : "Something below is narrowing the list. Each one changes a single thing and keeps the rest of your household as it is."}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => (
          <Link
            key={suggestion.href}
            href={suggestion.href}
            className="rounded-full border border-brand-sage-300 bg-brand-white px-4 py-2 text-sm text-brand-forest transition-colors hover:bg-brand-sage-100"
          >
            {suggestion.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
