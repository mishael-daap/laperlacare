import { MapPinned, Puzzle, SlidersHorizontal, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "cn";

type Reason = {
  title: string;
  body: string;
  Icon: LucideIcon;
  span: string;
};

const reasons: Reason[] = [
  {
    title: "Personalized matching",
    body: "We consider your child\u2019s needs, personality, routines, schedule, and your family\u2019s preferences when identifying potential caregivers.",
    Icon: Sparkles,
    span: "md:col-span-7",
  },
  {
    title: "Special-needs experience",
    body: "Connect with caregivers who have relevant experience supporting children with developmental, communication, behavioral, sensory, or physical support needs.",
    Icon: Puzzle,
    span: "md:col-span-5",
  },
  {
    title: "You stay in control",
    body: "Meet potential caregivers, ask questions, and decide who feels right for your family. You make the final hiring decision.",
    Icon: SlidersHorizontal,
    span: "md:col-span-5",
  },
  {
    title: "Local and personal",
    body: "Focused on Contra Costa County, Perla Care is building a local network designed around families and caregivers in our community.",
    Icon: MapPinned,
    span: "md:col-span-7",
  },
];

/**
 * The reasons, as four warm tiles on a white band.
 *
 * The tiles are uneven (seven columns then five, five then seven) so the set
 * reads as a composition rather than four features in a row. Sage fills on
 * white, no border, no shadow: the surface is the shape. The icons sit beside
 * their titles, not in coloured coins, and nothing here reacts to the pointer
 * because nothing here is a control.
 */
export function Reasons() {
  return (
    <section className="bg-card">
      <div className="landing-shell py-28 lg:py-36">
        <div className="max-w-3xl">
          <h2 className="section-head font-heading max-w-[16ch]">
            Why families choose Perla Care
          </h2>
          <p className="lead mt-4 max-w-[46ch] text-pretty text-brand-sage-700">
            Finding the right caregiver is about more than availability.
            It&rsquo;s about finding someone who understands your child and feels
            right for your family.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-12 md:gap-5">
          {reasons.map(({ title, body, Icon, span }) => (
            <li
              key={title}
              className={cn(
                "rounded-[2rem] bg-brand-sage-100 p-7 sm:p-8 md:min-h-[13rem]",
                span,
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className="size-5 shrink-0 text-brand-sage-600"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <h3 className="font-heading text-xl sm:text-2xl">{title}</h3>
              </div>
              <p className="mt-4 max-w-[44ch] text-pretty text-brand-sage-700">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
