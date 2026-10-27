import {
  HandHeart,
  MessageCircleHeart,
  SearchCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

type Step = {
  title: string;
  body: string;
  Icon: LucideIcon;
};

const steps: Step[] = [
  {
    title: "Tell us about your family",
    body: "Complete our Family Care Questionnaire and tell us about your child\u2019s needs, schedule, and the type of caregiver you\u2019re looking for.",
    Icon: MessageCircleHeart,
  },
  {
    title: "We search for your match",
    body: "Perla Care identifies and screens potential caregivers based on your family\u2019s needs and preferences.",
    Icon: SearchCheck,
  },
  {
    title: "Meet your candidates",
    body: "Meet potential matches, ask questions, and decide who feels right for your family.",
    Icon: UsersRound,
  },
  {
    title: "You choose your caregiver",
    body: "You make the final decision. Your family selects, hires, and pays the caregiver directly.",
    Icon: HandHeart,
  },
];

/**
 * The four steps, as a ledger rather than four equal cards.
 *
 * A real ordered list, because the sequence is real. The number is structural,
 * so it is set in the display face and left in its own column; the icon belongs
 * to the title, inline, never in a coloured tile. The heading stays with the
 * reader on a desktop while the four rows pass, which is enough pinning for a
 * process this short.
 */
export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 bg-brand-sage-100">
      <div className="landing-shell grid gap-12 py-28 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20 lg:py-36">
        <div className="self-start lg:sticky lg:top-16">
          <h2 className="section-head font-heading max-w-[12ch]">
            How Perla Care works
          </h2>
        </div>

        <ol className="border-t border-brand-sage-300">
          {steps.map(({ title, body, Icon }, index) => (
            <li
              key={title}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-5 border-b border-brand-sage-300 py-7 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-8 sm:py-8"
            >
              <span
                aria-hidden="true"
                className="font-display text-3xl leading-none font-extrabold text-brand-sage-600 sm:text-4xl"
              >
                {index + 1}
              </span>

              <div className="min-w-0">
                <h3 className="flex items-center gap-2.5 font-heading text-xl sm:text-2xl">
                  <Icon
                    className="size-5 shrink-0 text-brand-sage-600"
                    strokeWidth={1.75}
                    aria-hidden="true"
                  />
                  {title}
                </h3>
                <p className="mt-2 max-w-[54ch] text-pretty text-brand-sage-700">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
