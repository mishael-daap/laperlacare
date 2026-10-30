import { Action } from "./action";

/**
 * The invitation to the pricing page, where the price band used to be.
 *
 * The figure moved: it now lives on /pricing, beside the other two plans, where
 * it can be compared instead of announced. What is left on the home page is the
 * ask, on the same pearl pass the membership band used, with the trust line
 * that makes the ask worth taking. No number appears here at all — a home page
 * that quotes one price for a three-plan product is quoting the wrong one for
 * two thirds of the people reading it.
 */
export function PricingCta() {
  return (
    <section className="bg-brand-forest">
      <div className="landing-shell py-24 lg:py-32">
        <div className="on-pearl rounded-[2rem] bg-brand-pearl p-7 sm:p-10 lg:p-12">
          <h2 className="section-head font-heading max-w-[18ch]">
            Plans for your family
          </h2>

          <p className="lead mt-4 max-w-[52ch] text-pretty text-brand-sage-700">
            Every caregiver is interviewed, reference-checked and
            background-checked. Compare the three plans and see what each one
            includes.
          </p>

          <Action href="/pricing" className="mt-8">
            See pricing
          </Action>
        </div>
      </div>
    </section>
  );
}
