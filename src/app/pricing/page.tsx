import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { Action } from "@/components/landing/action";
import { SiteFooter } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export const metadata: Metadata = {
  title: "Pricing — Perla Care",
  description:
    "Three plans for caregiver matching in Contra Costa County: Free, Essential and Premium. Every caregiver is interviewed, reference-checked and background-checked.",
};

type Plan = {
  name: string;
  description: string;
  price: string;
  period: string;
  /** The yearly line, where the plan has one. Rendered under the monthly price. */
  yearly?: { price: string; note: string };
  /** `lead` marks the "Everything in …" line, which is a heading, not a feature. */
  features: { label: string; lead?: boolean }[];
  action: string;
  featured?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    description: "Get to know La Perla Care and our caregivers.",
    price: "$0",
    period: "forever",
    features: [
      { label: "Create your family profile" },
      { label: "Browse caregiver profiles (preview)" },
      { label: "Free guide: using your Regional Center respite hours" },
      { label: "Monthly newsletter and community event invitations" },
    ],
    action: "Join for free",
  },
  {
    name: "Essential",
    description: "Everything you need to find and hire your caregiver.",
    price: "$19.99",
    period: "/ month",
    yearly: { price: "$150 / year", note: "(save 37%)" },
    features: [
      { label: "Everything in Free, plus:", lead: true },
      { label: "Full verified caregiver profiles" },
      { label: "Unlimited messages and interviews" },
      {
        label:
          "Filters by needs: autism, non-verbal, behavior support, light medical care, adults, languages",
      },
      { label: "Save your favorite caregivers, including backups" },
      { label: "Families hire and pay caregivers directly: no commission" },
      { label: "30-day satisfaction guarantee" },
    ],
    action: "Choose Essential",
    featured: true,
  },
  {
    name: "Premium",
    description:
      "Personal support from our team, for families who need more help.",
    price: "$34.99",
    period: "/ month",
    yearly: { price: "$299 / year", note: "(save 29%)" },
    features: [
      { label: "Everything in Essential, plus:", lead: true },
      {
        label:
          "Personal matching: we hand-pick 3 caregivers for you within 72 hours",
      },
      { label: "A backup caregiver plan for sick days and emergencies" },
      {
        label:
          "1-on-1 welcome call to guide you through Regional Center respite steps",
      },
      { label: "Priority booking and 20% off La Perla Care events" },
      { label: "Priority support" },
    ],
    action: "Choose Premium",
  },
];

/**
 * The plan on the card. One filled action, as everywhere else on the site: the
 * featured plan takes the gold pill, the other two take the same pill as an
 * outline, so the three cards differ by emphasis and not by button style.
 */
function PlanAction({ plan }: { plan: Plan }) {
  if (plan.featured) {
    return (
      <Action href="/sign-up" className="mt-8 w-full justify-center">
        {plan.action}
      </Action>
    );
  }

  return (
    <Button
      size="xl"
      variant="outline"
      className="mt-8 h-[3.25rem] w-full border-brand-sage-300 bg-transparent text-base text-brand-forest hover:bg-brand-sage-100"
      render={<Link href="/sign-up" />}
    >
      {plan.action}
    </Button>
  );
}

/**
 * The three plans, published at /pricing.
 *
 * The copy is the client's and is reproduced word for word, except for the
 * markup the three plans have in common: the badge on the middle card, the
 * bolded "Everything in …" line, and the bolded yearly price. The middle card
 * is marked rather than enlarged, because a taller card in a row of three
 * changes what the row means.
 *
 * The trust line runs under all three cards rather than inside any one of them:
 * it is true of every plan, and putting it in a card would make it look like a
 * feature the others lack.
 */
export default function PricingPage() {
  return (
    <>
      <main className="flex-1">
        <div className="landing-shell pt-24 pb-28 sm:pt-32 sm:pb-36">
          <header className="mx-auto max-w-[54ch]">
            <h1 className="section-head font-heading text-center text-balance">
              Choose the support that fits your family
            </h1>

            <p className="lead mt-5 text-center text-pretty text-brand-sage-700">
              Every caregiver is interviewed, reference-checked and
              background-checked.
            </p>
          </header>

          <div className="mt-16 grid gap-6 md:grid-cols-3 lg:mt-20 lg:gap-8">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-[1.75rem] bg-card p-7 ring-1 ring-inset",
                  plan.featured
                    ? "ring-brand-sage-600"
                    : "ring-brand-sage-300",
                )}
              >
                {plan.featured ? (
                  <p className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-gold px-3 py-1 text-[0.6875rem] font-bold tracking-wide text-brand-forest uppercase">
                    MOST POPULAR
                  </p>
                ) : null}

                <h2 className="font-heading text-2xl">{plan.name}</h2>

                <p className="mt-3 min-h-[3.25rem] text-pretty text-brand-sage-700">
                  {plan.description}
                </p>

                <p className="mt-4 flex items-end gap-2">
                  <span className="font-display text-4xl leading-none font-extrabold tabular-nums sm:text-5xl">
                    {plan.price}
                  </span>
                  <span className="pb-1 text-brand-sage-700">
                    {plan.period}
                  </span>
                </p>

                <p className="mt-2 min-h-[1.5rem] text-sm text-brand-sage-700">
                  {plan.yearly ? (
                    <>
                      or{" "}
                      <strong className="font-semibold text-brand-forest">
                        {plan.yearly.price}
                      </strong>{" "}
                      {plan.yearly.note}
                    </>
                  ) : null}
                </p>

                <ul className="mt-6 flex flex-1 flex-col gap-3 border-t border-brand-sage-300 pt-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex gap-2.5 text-sm text-brand-sage-700"
                    >
                      <Check
                        aria-hidden="true"
                        className="mt-1 size-3.5 shrink-0 text-brand-sage-600"
                        strokeWidth={3}
                      />
                      <span
                        className={cn(
                          "text-pretty",
                          feature.lead && "font-semibold text-brand-forest",
                        )}
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <PlanAction plan={plan} />
              </article>
            ))}
          </div>

          <p className="mx-auto mt-14 max-w-[62ch] text-center text-sm text-pretty text-brand-sage-700">
            Caregivers always join for free. La Perla Care is a matching
            platform: families hire, schedule and pay their caregiver directly.
            Cancel anytime.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
