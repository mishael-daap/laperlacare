import Link from "next/link";

import { matchHref, type MatchOptions } from "@/lib/matching/options";
import { cn } from "cn";

const HOUR_OPTIONS = [
  { value: "exact", label: "Exact" },
  { value: "flexible", label: "±1 hour" },
  { value: "day", label: "Any time" },
] as const;

const GENDER_OPTIONS = [
  { value: "household", label: "As my household" },
  { value: "any", label: "Any" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
] as const;

const RATE_OPTIONS = [null, 20, 25, 30, 35] as const;

function isActive(active: boolean) {
  return active
    ? "border-brand-forest bg-brand-forest text-brand-sage-100"
    : "border-brand-sage-300 bg-brand-white text-brand-forest hover:bg-brand-sage-100";
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-32 shrink-0 text-sm font-semibold text-brand-forest">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
        isActive(active),
      )}
    >
      {children}
    </Link>
  );
}

/**
 * The four levers, as links.
 *
 * Every option is a URL, not a control: the page stays server-rendered, the back
 * button walks a parent's reasoning, and the empty state's suggestions are the
 * same hrefs in a sentence. All four are prefilled from the household, so this is
 * never a form a parent has to fill in — it is a way to argue with one.
 */
export function MatchLevers({
  options,
  caregivers,
}: {
  options: MatchOptions;
  caregivers: number;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[1.5rem] bg-brand-white p-5 ring-1 ring-inset ring-brand-sage-300 sm:p-6">
      <Row label="My hours">
        {HOUR_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            href={matchHref(options, { hours: option.value })}
            active={options.hours === option.value}
          >
            {option.label}
          </Chip>
        ))}
      </Row>

      <Row label="Coverage">
        <Chip
          href={matchHref(options, { partial: !options.partial })}
          active={options.partial}
        >
          {options.partial ? "Including partial coverage" : "Full coverage only"}
        </Chip>
      </Row>

      <Row label="Max rate">
        {RATE_OPTIONS.map((rate) => (
          <Chip
            key={rate ?? "any"}
            href={matchHref(options, { maxRate: rate })}
            active={options.maxRate === rate}
          >
            {rate === null ? "Any rate" : `Up to $${rate}`}
          </Chip>
        ))}
      </Row>

      <Row label="Caregiver">
        {GENDER_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            href={matchHref(options, { gender: option.value })}
            active={options.gender === option.value}
          >
            {option.label}
          </Chip>
        ))}
      </Row>

      {caregivers > 0 ? (
        <Row label="Shortlist">
          <Chip href={matchHref(options, { saved: !options.saved })} active={options.saved}>
            {options.saved ? "Showing saved only" : "Saved only"}
          </Chip>
        </Row>
      ) : null}
    </section>
  );
}
