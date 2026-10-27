import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";
import { SiteFooter } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Contact — Perla Care",
  description: "Ask about caregiver matching in your part of Contra Costa County.",
};

/**
 * The contact page.
 *
 * It exists for one question — "do you cover my area?" — so the heading answers
 * that before the form asks for anything. A form with no context is a form
 * people close.
 *
 * No pricing, no second pitch. Somebody who has landed here has a specific
 * question, and the only thing to do on the page is ask it.
 */
export default function ContactPage() {
  return (
    <>
      <main className="flex-1 px-6 pt-24 pb-28 sm:px-10 sm:pt-32 sm:pb-36 lg:px-16">
        <div className="mx-auto max-w-xl">
          <h1 className="font-heading text-3xl tracking-tight text-balance sm:text-4xl">
            Not sure if we serve your area?
          </h1>

          <p className="mt-4 text-sm text-muted-foreground">
            Contra Costa County, California
          </p>

          <p className="mt-6 text-pretty text-muted-foreground">
            Send us a request and we will let you know if caregiver matching is
            currently available near you.
          </p>

          <div className="mt-12">
            <ContactForm />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
