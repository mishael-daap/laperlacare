import { Action } from "./action";

/**
 * The offer, as a membership pass rather than a price band.
 *
 * A cream card on the forest field, with the pearl in the corner and a
 * perforated seam between the price and the terms. The price is the largest
 * thing on the page after the hero because it is the decision; the refund sits
 * beside it as the second half of the same promise, not as a separate section
 * with a heading of its own. The dashed rule is the only line on the card, and
 * it is the line a pass would have.
 */
export function Membership() {
  return (
    <section id="membership" className="scroll-mt-24 bg-brand-forest">
      <div className="landing-shell py-24 lg:py-32">
        <div className="on-pearl relative overflow-hidden rounded-[2rem] bg-brand-pearl p-7 sm:p-10 lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 lg:p-12">
          <span
            aria-hidden="true"
            className="absolute top-7 right-7 hidden size-10 rounded-full bg-brand-gold sm:block"
          >
            <span className="absolute top-2.5 left-2.5 size-2.5 rounded-full bg-brand-pearl" />
          </span>

          <div>
            <h2 className="section-head font-heading max-w-[14ch]">
              Get access to the network
            </h2>
            <p className="mt-4 text-brand-sage-700">One membership per household.</p>

            <p className="mt-8 flex items-end gap-2">
              <span className="font-display text-6xl leading-none font-extrabold tabular-nums sm:text-7xl lg:text-8xl">
                $10
              </span>
              <span className="pb-2 text-brand-sage-700">a month</span>
            </p>
          </div>

          <div className="mt-8 flex flex-col justify-end border-t border-dashed border-brand-sage-300 pt-8 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
            <p className="font-semibold text-brand-forest">
              Money back within 30 days
            </p>
            <p className="mt-2 max-w-[38ch] text-pretty text-brand-sage-700">
              If the network is not useful to you, ask for a refund within 30
              days and we will return what you paid.
            </p>

            <Action href="/sign-up" className="mt-6 self-start">
              Join
            </Action>
          </div>
        </div>
      </div>
    </section>
  );
}
