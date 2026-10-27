import Image from "next/image";

/**
 * The one photograph on the page.
 *
 * A child holding a homemade kite against the sky. It is a CC0 library
 * photograph, treated warm to sit beside sage and forest. It is not a
 * testimonial and it does not stand in for a customer: it shows the register
 * the page is written in, the ordinary, unhurried business of being a child.
 *
 * It carries no copy. The page's words are the approved ones, and none of them
 * belong on a picture: this is the breath between the opening and the steps.
 */
export function PhotoStatement() {
  return (
    <section className="bg-card">
      <div className="landing-shell py-24 lg:py-32">
        <figure className="overflow-hidden rounded-[2rem] bg-brand-sage-100 ring-1 ring-inset ring-brand-forest/10">
          <Image
            src="/landing/child-playing-with-a-kite-1920.jpg"
            alt="A child seen from behind holding a homemade kite against blue sky and trees."
            width={1920}
            height={1443}
            sizes="(min-width: 1024px) 90vw, 100vw"
            className="photo-warm aspect-[16/9] w-full object-cover object-[40%_55%]"
          />
        </figure>

      </div>
    </section>
  );
}
