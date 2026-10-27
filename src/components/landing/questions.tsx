import { Plus } from "lucide-react";

const faqs = [
  {
    q: "How are caregivers vetted?",
    a: "Every caregiver uploads a background check, a licence, and their certifications. We review each document before their profile appears, so only verified caregivers are in the network.",
  },
  {
    q: "What does the membership include?",
    a: "One membership covers your whole household. It unlocks caregiver matching and caregiver contact details.",
  },
  {
    q: "Is this a childcare agency?",
    a: "No. We are a directory and introduction service. We connect you with caregivers \u2014 you choose who to hire and arrange everything with them directly.",
  },
  {
    q: "What if it is not right for us?",
    a: "Ask for a refund within 30 days and we will return what you paid.",
  },
  {
    q: "Where are you available?",
    a: "Across Contra Costa County, California.",
  },
];

/**
 * The questions, on native disclosures.
 *
 * `<details>` does the work, so the answers are in the document and need no
 * script to open. The first is open on arrival, because the vetting question is
 * the one that decides whether the rest of the page matters. The plus becomes
 * an x with a transform, never a width change.
 */
export function Questions() {
  return (
    <section className="bg-brand-sage-100">
      <div className="landing-shell grid gap-10 py-28 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-20 lg:py-36">
        <div className="self-start">
          <h2 className="section-head font-heading max-w-[12ch]">FAQ</h2>
        </div>

        <div className="border-t border-brand-sage-300">
          {faqs.map(({ q, a }, index) => (
            <details
              key={q}
              className="border-b border-brand-sage-300"
              open={index === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left text-lg font-semibold text-brand-forest sm:text-xl">
                {q}
                <Plus
                  className="faq-plus size-5 shrink-0 text-brand-sage-600"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-[62ch] pb-6 text-pretty text-brand-sage-700">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
