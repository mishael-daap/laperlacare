import { Action } from "./action";
import { Masthead } from "./masthead";

/**
 * The first screen.
 *
 * A forest field, the copy low and left, one pearl button. The masthead floats
 * above it and the type does the rest; the photograph the old page used is
 * retired.
 */
export function Hero() {
  return (
    <section className="hero relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-brand-forest text-brand-sage-100">
      <Masthead />

      <div className="landing-shell relative z-10 flex flex-1 flex-col justify-end pt-12 pb-16 sm:pt-16 sm:pb-20">
        <h1 className="landing-rise display-1 font-heading max-w-[20ch] text-brand-sage-100">
          Finding the right caregiver shouldn&rsquo;t be another challenge.
        </h1>

        <p
          className="landing-rise lead mt-6 max-w-[44ch] text-pretty text-brand-sage-300"
          style={{ animationDelay: "80ms" }}
        >
          Specialized caregiver matching for families of children with special
          needs. Serving Contra Costa County, California.
        </p>

        <div className="landing-rise mt-8" style={{ animationDelay: "160ms" }}>
          <Action href="/sign-up" tone="on-dark">
            Find a caregiver
          </Action>
        </div>
      </div>
    </section>
  );
}
