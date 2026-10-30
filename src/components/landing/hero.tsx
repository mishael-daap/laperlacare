import Image from "next/image";

import { Action } from "./action";
import { Masthead } from "./masthead";

/**
 * The first screen.
 *
 * One photograph, full bleed behind the copy, with nothing laid over it: the
 * picture is the welcome and the words sit straight on it, low and left, in
 * forest. The masthead floats above the picture as a white pill.
 *
 * The type is the brand's ink on a photograph, so the picture is doing the
 * work a surface normally does. See the note in the change log at the top of
 * globals.css for what that costs in contrast and where the copy is safest.
 */
export function Hero() {
  return (
    <section className="hero relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-brand-sage-100 text-brand-forest">
      <Image
        src="/landing/hero-1344.jpg"
        alt=""
        fill
        preload
        sizes="100vw"
        className="photo-warm object-cover object-center"
      />

      <Masthead />

      <div className="landing-shell relative z-10 flex flex-1 flex-col justify-end pt-12 pb-16 sm:pt-16 sm:pb-20">
        <h1 className="landing-rise display-1 font-heading max-w-[20ch] text-brand-forest">
          Finding the right caregiver shouldn&rsquo;t be another challenge.
        </h1>

        <p
          className="landing-rise lead mt-6 max-w-[44ch] text-pretty text-brand-forest"
          style={{ animationDelay: "80ms" }}
        >
          Specialized caregiver matching for families of children with special
          needs. Serving Contra Costa County, California.
        </p>

        <div className="landing-rise mt-8" style={{ animationDelay: "160ms" }}>
          <Action href="/sign-up">
            Find a caregiver
          </Action>
        </div>
      </div>
    </section>
  );
}
