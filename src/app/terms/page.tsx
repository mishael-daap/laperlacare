import type { Metadata } from "next";

import { Logo } from "@/components/brand/logo";
import { SiteFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Terms & Conditions — Perla Care",
  description:
    "The terms that govern use of the Perla Care website, caregiver referral, and matching services.",
};

/**
 * The terms and conditions, published at /terms.
 *
 * The wording is supplied legal copy and is reproduced verbatim. Formatting is
 * deliberately plain: numbered section headings, a readable measure, and no
 * extra call to action. This is a document, not a marketing page.
 */
export default function TermsPage() {
  return (
    <>
      <main className="flex-1 px-6 pt-24 pb-28 sm:px-10 sm:pt-32 sm:pb-36 lg:px-16">
        <article className="mx-auto max-w-3xl">
          {/* The name above the document is the mark, not a tracked-caps
              label: a legal page is the one place a masthead belongs. */}
          <Logo className="h-7" />

          <h1 className="mt-6 font-heading text-3xl tracking-tight text-balance sm:text-4xl">
            Terms &amp; Conditions
          </h1>

          <p className="mt-4 text-sm text-muted-foreground">
            Last Updated: October 17, 2026
          </p>

          <p className="mt-10 text-pretty text-muted-foreground">
            Welcome to Perla Care. These Terms and Conditions (&ldquo;Terms&rdquo;)
            govern your use of the Perla Care website and caregiver referral and
            matching services. By using our website, submitting a family request,
            joining our caregiver network, or otherwise using our services, you
            agree to these Terms.
          </p>

          <div className="mt-14 flex flex-col gap-12">
            <section id="about" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                1. About Perla Care
              </h2>

              <p className="text-pretty text-muted-foreground">
                Perla Care provides a platform and referral service designed to
                help families seeking non-medical respite care and caregiving
                support connect with independent caregivers.
              </p>

              <p className="text-pretty text-muted-foreground">
                Unless expressly stated otherwise in a separate written agreement,
                Perla Care does not employ caregivers and does not provide
                medical, nursing, therapeutic, or emergency services.
              </p>

              <p className="text-pretty text-muted-foreground">
                Caregivers and families are responsible for determining whether
                they wish to work with one another and for establishing the terms
                of their caregiving arrangement.
              </p>
            </section>

            <section id="for-families" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                2. For Families
              </h2>

              <p className="text-pretty text-muted-foreground">
                Families may submit information about their caregiving needs so
                that Perla Care can identify potential caregivers who may meet
                their preferences.
              </p>

              <p className="text-pretty text-muted-foreground">
                Submitting a request does not guarantee that a suitable caregiver
                will be available or that a successful match will be made.
              </p>

              <p className="text-pretty text-muted-foreground">
                Families are responsible for interviewing caregivers, determining
                whether a caregiver is appropriate for their child or family
                member, and making their own final caregiver selection.
              </p>
            </section>

            <section id="for-caregivers" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                3. For Caregivers
              </h2>

              <p className="text-pretty text-muted-foreground">
                Caregivers may submit information to be considered for inclusion
                in the Perla Care caregiver network.
              </p>

              <p className="text-pretty text-muted-foreground">
                Submitting an application or profile does not create an
                employment relationship with Perla Care and does not guarantee
                referrals, clients, hours, assignments, or income.
              </p>

              <p className="text-pretty text-muted-foreground">
                Caregivers must provide accurate and truthful information about
                their identity, experience, qualifications, certifications,
                availability, and background.
              </p>
            </section>

            <section id="independent-relationship" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                4. Independent Relationship
              </h2>

              <p className="text-pretty text-muted-foreground">
                Unless otherwise specified in a separate written agreement, Perla
                Care acts as a referral and matching service.
              </p>

              <p className="text-pretty text-muted-foreground">
                Perla Care does not employ, supervise, direct, or control
                caregivers in the performance of services arranged directly
                between a family and caregiver.
              </p>

              <p className="text-pretty text-muted-foreground">
                Families and caregivers are responsible for establishing their own
                caregiving arrangement, including schedules, duties,
                compensation, cancellations, and other applicable terms.
              </p>
            </section>

            <section id="background-checks" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                5. Background Checks and Qualifications
              </h2>

              <p className="text-pretty text-muted-foreground">
                Perla Care may require or facilitate identity verification,
                reference checks, background checks, certification verification,
                or other screening measures.
              </p>

              <p className="text-pretty text-muted-foreground">
                However, no screening process can guarantee a person&apos;s future
                conduct, suitability, reliability, or safety.
              </p>

              <p className="text-pretty text-muted-foreground">
                Families should conduct their own interviews and due diligence
                before engaging a caregiver.
              </p>
            </section>

            <section id="non-medical-services" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                6. Non-Medical Services
              </h2>

              <p className="text-pretty text-muted-foreground">
                Perla Care is intended to facilitate non-medical caregiving and
                respite care services.
              </p>

              <p className="text-pretty text-muted-foreground">
                Caregivers should not perform medical, nursing, therapeutic, or
                other licensed professional services unless they are
                appropriately licensed or authorized to perform those services
                and the arrangement complies with applicable law.
              </p>

              <p className="text-pretty text-muted-foreground">
                Perla Care is not an emergency service. In an emergency, call 911
                or the appropriate emergency service.
              </p>
            </section>

            <section id="information-you-provide" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                7. Information You Provide
              </h2>

              <p className="text-pretty text-muted-foreground">
                You agree to provide accurate, current, and complete information
                when using Perla Care.
              </p>

              <p className="text-pretty text-muted-foreground">
                Families are responsible for providing caregivers with information
                reasonably necessary to safely care for their child or family
                member, including relevant routines, support needs, allergies,
                behavioral considerations, emergency contacts, and safety
                instructions.
              </p>
            </section>

            <section id="privacy" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                8. Privacy
              </h2>

              <p className="text-pretty text-muted-foreground">
                Information submitted through our website will be handled in
                accordance with the Perla Care Privacy Policy.
              </p>

              <p className="text-pretty text-muted-foreground">
                Because some information submitted by families may concern
                children or individuals with disabilities, users should provide
                only information reasonably necessary for Perla Care to assist
                with caregiver matching.
              </p>
            </section>

            <section id="payments" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                9. Payments
              </h2>

              <p className="text-pretty text-muted-foreground">
                Unless Perla Care expressly offers a different arrangement in
                writing, families and caregivers arrange and handle caregiver
                compensation directly between themselves.
              </p>

              <p className="text-pretty text-muted-foreground">
                Perla Care is not responsible for unpaid compensation, payment
                disputes, tax obligations, or other financial arrangements between
                families and caregivers.
              </p>

              <p className="text-pretty text-muted-foreground">
                Any separate fees charged by Perla Care for referral or matching
                services will be disclosed before the applicable service is
                purchased.
              </p>
            </section>

            <section id="user-conduct" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                10. User Conduct
              </h2>

              <p className="text-pretty text-muted-foreground">
                Users may not use Perla Care to provide false information,
                impersonate another person, engage in harassment or discrimination
                prohibited by law, violate another person&apos;s rights, engage in
                unlawful conduct, or place a child or other person at risk.
              </p>

              <p className="text-pretty text-muted-foreground">
                Perla Care may restrict or discontinue access to its services when
                reasonably necessary to protect users, comply with law, or enforce
                these Terms.
              </p>
            </section>

            <section id="no-guarantee" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                11. No Guarantee of Matching or Services
              </h2>

              <p className="text-pretty text-muted-foreground">
                Perla Care does not guarantee the availability of caregivers, that
                a particular caregiver will accept a family&apos;s request, that a
                family will select a particular caregiver, or that any caregiving
                relationship will continue for a particular period.
              </p>
            </section>

            <section id="limitation-of-responsibility" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                12. Limitation of Responsibility
              </h2>

              <p className="text-pretty text-muted-foreground">
                To the extent permitted by applicable law, Perla Care is not
                responsible for the independent acts or omissions of families or
                caregivers or for disputes arising from arrangements made directly
                between them.
              </p>

              <p className="text-pretty text-muted-foreground">
                Nothing in these Terms excludes or limits liability that cannot
                legally be excluded or limited.
              </p>
            </section>

            <section id="termination" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                13. Termination of Access
              </h2>

              <p className="text-pretty text-muted-foreground">
                Perla Care may suspend or terminate access to its referral network
                or website for violations of these Terms, suspected fraud, safety
                concerns, inappropriate conduct, or other legitimate business or
                legal reasons.
              </p>

              <p className="text-pretty text-muted-foreground">
                Families and caregivers may stop using the service at any time,
                subject to any separate agreements they have entered into.
              </p>
            </section>

            <section id="changes" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                14. Changes to These Terms
              </h2>

              <p className="text-pretty text-muted-foreground">
                Perla Care may update these Terms periodically. When material
                changes are made, the &ldquo;Last Updated&rdquo; date will be
                revised.
              </p>

              <p className="text-pretty text-muted-foreground">
                Continued use of the service after updated Terms become effective
                constitutes acceptance of the revised Terms to the extent
                permitted by law.
              </p>
            </section>

            <section id="governing-law" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                15. Governing Law
              </h2>

              <p className="text-pretty text-muted-foreground">
                These Terms are governed by the laws of the State of California,
                without regard to conflict-of-law principles, except where
                applicable law requires otherwise.
              </p>
            </section>

            <section id="contact" className="flex flex-col gap-4">
              <h2 className="font-heading text-xl tracking-tight">
                16. Contact Us
              </h2>

              <p className="text-pretty text-muted-foreground">
                Questions about these Terms may be sent to:
              </p>

              <address className="flex flex-col gap-1 text-sm text-muted-foreground not-italic">
                <span>Perla Care</span>
                <span>California, United States</span>
                <span>
                  Email:{" "}
                  <a
                    href="mailto:hello@laperlacare.com"
                    className="text-foreground underline underline-offset-4"
                  >
                    hello@laperlacare.com
                  </a>
                </span>
              </address>
            </section>
          </div>
        </article>
      </main>

      <SiteFooter />
    </>
  );
}
