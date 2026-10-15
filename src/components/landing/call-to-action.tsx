import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Section 3. The same action as the hero, so the button keeps the same words
 * rather than inventing a second label for the same destination.
 *
 * A Card, restyled rather than rebuilt: it already gives us a padded surface
 * with soft corners, and the theme tokens override its background, its ring,
 * and its spacing. The heading carries the promise, the line under it carries
 * the price. A button asking for money without naming the amount is the one
 * thing on a page like this that makes people leave.
 */
export function CallToAction() {
  return (
    <section className="px-6 py-28 sm:px-10 sm:py-36 lg:px-16">
      <Card className="mx-auto max-w-4xl items-center gap-6 rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground ring-0 sm:px-16 sm:py-20">
        <h2 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl md:text-5xl">
          Get access to the network
        </h2>

        <p className="text-lg text-primary-foreground/80">
          One membership per household. $10 a month.
        </p>

        <Button variant="contrast" size="xl" render={<Link href="/sign-up" />}>
          Join
        </Button>
      </Card>
    </section>
  );
}
