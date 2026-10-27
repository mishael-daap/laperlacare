import { Smile } from "@/components/brand/smile";

import { Action } from "./action";

/**
 * The close: the action once more, with the smile above it and nothing else.
 *
 * The price already had its section. This one does not say it again; it says
 * what happens next, which is the only thing left to decide. The small smile is
 * the hero's mark returning at the other end of the page, without its pearl,
 * because the pearl belonged to the opening.
 */
export function Closing() {
  return (
    <section className="bg-card">
      <div className="landing-shell flex flex-col items-center py-28 text-center lg:py-40">
        <Smile
          className="h-12 w-56 text-brand-sage-300"
          pearl={false}
          strokeWidth={6}
        />

        <h2 className="display-s font-heading mt-8 max-w-[22ch]">
          Ready to find your caregiver
        </h2>

        <p className="lead mt-5 max-w-[48ch] text-pretty text-brand-sage-700">
          Tell us about your child, your family&rsquo;s needs, and the kind of
          support you are looking for. Perla Care will help you connect with
          caregivers who may be a good fit for your family.
        </p>

        <p className="mt-4 text-brand-sage-700">
          $10 a month, with 30 days to change your mind.
        </p>

        <Action href="/sign-up" className="mt-8">
          Find your caregiver
        </Action>
      </div>
    </section>
  );
}
