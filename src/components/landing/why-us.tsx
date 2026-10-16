const reasons = [
  {
    title: "Personalized matching",
    body: "We consider your child\u2019s needs, personality, routines, schedule, and your family\u2019s preferences when identifying potential caregivers.",
  },
  {
    title: "Special-needs experience",
    body: "Connect with caregivers who have relevant experience supporting children with developmental, communication, behavioral, sensory, or physical support needs.",
  },
  {
    title: "You stay in control",
    body: "Meet potential caregivers, ask questions, and decide who feels right for your family. You make the final hiring decision.",
  },
  {
    title: "Local and personal",
    body: "Focused on Contra Costa County, Perla Care is building a local network designed around families and caregivers in our community.",
  },
];

/**
 * Section 3. The four reasons, and the only differentiator block on the page.
 *
 * The brainstorm offered two of these — "why families choose us" and "support
 * that fits your family". They say much the same thing, so the landing page
 * carries one and the other moves to the about page. Two versions of "someone
 * who understands your child" back to back would read as padding.
 *
 * A 2x2 grid rather than four across, because the section above it is already
 * four across with numbers on it. Same shape twice in a row would look like one
 * long list, and these are not steps — nothing here happens in order.
 *
 * No numbers and no icons. A reason is not a stage.
 *
 * The copy is the approved wording, word for word.
 */
export function WhyUs() {
  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="max-w-6xl">
        <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
          Why families choose Perla Care
        </h2>

        <p className="mt-6 max-w-2xl text-pretty text-muted-foreground">
          Finding the right caregiver is about more than availability. It&rsquo;s
          about finding someone who understands your child and feels right for
          your family.
        </p>

        <ul className="mt-16 grid gap-14 sm:grid-cols-2 sm:gap-10 lg:mt-20 lg:gap-x-16 lg:gap-y-14">
          {reasons.map((reason) => (
            <li key={reason.title} className="flex flex-col gap-3">
              <h3 className="font-heading text-xl font-medium tracking-tight text-balance">
                {reason.title}
              </h3>
              <p className="text-pretty text-muted-foreground">{reason.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
