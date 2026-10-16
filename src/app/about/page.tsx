import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About — Perla Care",
  description:
    "Perla Care helps families of children with special needs find caregivers in Contra Costa County, California.",
};

const support = [
  {
    title: "Play and companionship",
    body: "Play, games, creative activities, and meaningful companionship based on your child\u2019s interests.",
  },
  {
    title: "Daily routines",
    body: "Support with everyday routines such as dressing, toileting, transitions, and getting ready.",
  },
  {
    title: "Communication support",
    body: "Patient support for children who communicate through speech, gestures, AAC, or other communication methods.",
  },
];

/**
 * The about page, which is where the detail the landing page sheds ends up.
 *
 * The landing page has one job — get someone to find a caregiver — so anything
 * that explains rather than converts lives here instead. That is this whole
 * page: what support actually looks like, and where we operate.
 *
 * No hero photograph and no second calls to action. One action, at the bottom,
 * where somebody who has read all of this is ready to take it.
 *
 * The copy is the approved wording, word for word.
 */
export default function AboutPage() {
  return (
    <>
      <main className="flex-1">
        <section className="px-6 pt-24 pb-16 sm:px-10 sm:pt-32 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
              Less searching. More confidence. Better matches.
            </p>

            <h1 className="mt-6 font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl md:text-5xl">
              Your child is unique. Their care should be too.
            </h1>

            <p className="mt-8 text-lg text-pretty text-muted-foreground">
              Every child and every family is different. Perla Care helps
              families connect with caregivers who can provide non-medical
              support based on their child&rsquo;s routines, interests,
              communication style, and individual needs.
            </p>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10 sm:py-20 lg:px-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
              Support that fits your family
            </h2>

            <ul className="mt-16 grid gap-14 sm:grid-cols-3 sm:gap-10 lg:mt-20 lg:gap-16">
              {support.map((item) => (
                <li key={item.title} className="flex flex-col gap-3">
                  <h3 className="font-heading text-xl font-medium tracking-tight text-balance">
                    {item.title}
                  </h3>
                  <p className="text-pretty text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-6 pt-16 pb-28 sm:px-10 sm:pt-20 sm:pb-36 lg:px-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-8">
            <div className="flex max-w-3xl flex-col gap-6">
              <h2 className="font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">
                Proudly serving Contra Costa County
              </h2>

              <p className="text-pretty text-muted-foreground">
                Perla Care helps families connect with caregivers in communities
                throughout Contra Costa County.
              </p>

              <p className="text-pretty text-muted-foreground">
                Pittsburg &bull; Antioch &bull; Bay Point &bull; Brentwood
                &bull; Oakley &bull; Concord &bull; Pleasant Hill &bull; Martinez
                &amp; surrounding areas
              </p>

              {/* A link rather than a dead end. The contact page answers this
                  exact question, which is why it exists. */}
              <p className="text-pretty text-muted-foreground">
                Not sure if we serve your area?{" "}
                <Link
                  href="/contact"
                  className="text-foreground underline underline-offset-4"
                >
                  Send us a request
                </Link>{" "}
                and we will let you know if caregiver matching is currently
                available near you.
              </p>
            </div>

            <Button
              variant="contrast"
              size="xl"
              className="self-start"
              render={<Link href="/sign-up" />}
            >
              Find my caregiver
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
