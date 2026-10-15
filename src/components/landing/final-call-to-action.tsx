import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * Section 6. The last ask.
 *
 * Not a second blue card. Section 3 already made that gesture, and repeating it
 * would read as two competing offers rather than one decision made twice. This
 * one is plain, and leans on the guarantee above it: the price and the 30 days
 * sit with the heading.
 *
 * Copy left, button right, on one line. The last thing on the page is a
 * decision, so the two are in the same eyeline rather than stacked down the
 * middle of the screen.
 */
export function FinalCallToAction() {
  return (
    <section className="px-6 py-28 sm:px-10 sm:py-36 lg:px-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-16">
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl md:text-5xl">
            Join the network
          </h2>

          <p className="text-lg text-pretty text-muted-foreground">
            One membership per household. $10 a month, with 30 days to change
            your mind.
          </p>
        </div>

        <Button
          variant="contrast"
          size="xl"
          className="shrink-0"
          render={<Link href="/sign-up" />}
        >
          Start for $10
        </Button>
      </div>
    </section>
  );
}
