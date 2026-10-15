const benefits = [
  {
    title: "Browse caregivers",
    body: "Filter by gender, qualifications, and availability, so you find exactly who you need — not whoever happens to be nearby.",
  },
  {
    title: "Community",
    body: "Meet other families, mums, and kids near you. Share what you know, and lean on people in the same situation.",
  },
  {
    title: "Events",
    body: "Outings, sleepovers, and birthday parties nearby, so your child socialises and you get some time back.",
  },
];

/**
 * Section 2. Three benefits, nothing else.
 *
 * No cards and no icons. Three bordered boxes would add chrome to six short
 * lines and compete with the hero; the space between them does the separating,
 * which is the same job for less.
 *
 * The items are a list because that is what they are. Headings descend
 * h1 (hero) to h2 (Features) to h3 (each item), with no level skipped.
 */
export function Benefits() {
  return (
    <section className="px-6 py-24 sm:px-10 sm:py-32 lg:px-16">
      <div className="max-w-6xl">
        <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
          Features
        </h2>

        <ul className="mt-16 grid gap-14 sm:grid-cols-3 sm:gap-10 lg:mt-20 lg:gap-16">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="flex flex-col gap-3">
              <h3 className="font-heading text-xl font-medium tracking-tight text-balance">
                {benefit.title}
              </h3>
              <p className="text-pretty text-muted-foreground">{benefit.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
