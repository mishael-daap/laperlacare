/**
 * Section 4. The objection handler, sitting between the two calls to action.
 *
 * Deliberately quiet. It follows a saturated blue card and precedes the final
 * ask, so it reads as a plain statement of fact rather than a third pitch —
 * no panel, no icon, no badge. The heading is a step smaller than the section
 * headings around it, which is what keeps it feeling like a footnote to the
 * offer rather than another headline.
 */
export function Guarantee() {
  return (
    <section className="px-6 py-20 sm:px-10 sm:py-24 lg:px-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-balance sm:text-3xl">
          Money back within 30 days
        </h2>

        <p className="text-pretty text-muted-foreground">
          If the network is not useful to you, ask for a refund within 30 days
          and we will return what you paid.
        </p>
      </div>
    </section>
  );
}
