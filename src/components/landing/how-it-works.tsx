const steps = [
  {
    title: "Tell us about your family",
    body: "Complete our Family Care Questionnaire and tell us about your child\u2019s needs, schedule, and the type of caregiver you\u2019re looking for.",
  },
  {
    title: "We search for your match",
    body: "Perla Care identifies and screens potential caregivers based on your family\u2019s needs and preferences.",
  },
  {
    title: "Meet your candidates",
    body: "Meet potential matches, ask questions, and decide who feels right for your family.",
  },
  {
    title: "You choose your caregiver",
    body: "You make the final decision. Your family selects, hires, and pays the caregiver directly.",
  },
];

/**
 * Section 2. The four steps, replacing the old three benefits.
 *
 * The pitch is matching, so the page has to say what matching actually involves
 * before it asks for money. Four short steps do that; a list of features would
 * describe the product instead of the experience of using it.
 *
 * An ordered list because it genuinely is a sequence, and the numbers do the
 * work of showing that. No connecting line, no cards, no icons — the same
 * argument the benefits section made: the space between the items separates
 * them for less than chrome would.
 *
 * The copy is the approved wording, word for word. Step two says "identifies
 * and screens potential caregivers", which is stronger than what the
 * architecture otherwise claims — the platform reviews the documents a
 * caregiver supplies, it does not run the checks itself. Worth revisiting if
 * the legal review lands differently.
 */
export function HowItWorks() {
  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="max-w-6xl">
        <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
          How Perla Care works
        </h2>

        <ol className="mt-16 grid gap-14 sm:grid-cols-2 sm:gap-10 lg:mt-20 lg:grid-cols-4 lg:gap-12">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3">
              <span className="font-mono text-sm text-muted-foreground">
                {index + 1}
              </span>
              <h3 className="font-heading text-xl font-medium tracking-tight text-balance">
                {step.title}
              </h3>
              <p className="text-pretty text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
