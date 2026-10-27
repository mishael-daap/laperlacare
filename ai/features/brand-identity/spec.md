# Feature: Brand identity and site redesign

## Purpose
The product carries the identity the designers delivered: the pearl-in-a-smile-arc mark, the sage and forest palette, and Bricolage Grotesque on the words that should stand out over Poppins for everything else. The landing page is recomposed around the copy that is already there, because the copy does not change.

## User Flow
1. A parent opens `/` and meets one photograph, one headline, one line and one action, all in the brand.
2. Scrolling, they read the four steps, the four reasons, the price, the guarantee, the five questions and the last ask. Same words as today; the composition is new.
3. A caregiver opening `/me` and an admin opening `/admin/caregiver` meet the same system: same palette, same faces, same controls, and their own logo in the header.
4. On a 320px phone nothing scrolls sideways, every control is reachable with a thumb, and the headline still reads.

## Rules

### What does not move
- **Copy is verbatim.** Every heading, sentence, label, button word, price, FAQ answer and legal line stays exactly as it is today. Nothing is reworded, cut, shortened or added, including the marketing claims, which are the owner's to make. Hallmark stamp: `copy: verbatim`.
- **Wiring is untouched.** Every `href`, form action, field `name`, server action, redirect, route, `id` and test hook survives the redesign and points at the same thing.
- **No new facts.** No testimonial, customer count, logo wall, award, rating or metric appears that the page does not already state.
- **Light only.** There is no dark mode. The pinned `dark` variant in `globals.css` stays, so the inert `dark:` classes in shadcn's components stay inert.
- **The page's jobs stay.** The hero's one action, the price, the 30-day guarantee and the "not a childcare agency" answer keep their place in the argument.

### What does move
- The system: colour, type, radius, shadow, motion, focus treatment.
- The landing page composition: order, scale, grouping, divider language, where the photograph sits.
- Class names throughout, which is how the system reaches a screen.
- Logo placement, the favicon, and the removal of what the gates name (see below).

### The brand
- **Six core colours**, declared once: very light sage `#D4E2CF`, soft sage `#9DB89A`, sage text `#4F6E55`, forest `#2E4636`, gold `#E0A93B`, pearl `#F5E6C6`. White is the sixth surface the brand book names.
- **Extensions are allowed** where a screen needs something the kit does not carry: a darker sage for muted text on sage surfaces, a derived red, green and amber for states, and an on-dark wordmark. Each extension is declared as a token and listed in the handoff so the designers can bless it.
- **Gold is decoration only.** It never sets text, a link, a border that carries meaning, or a focus ring. It appears at most once per screen.
- **The mark keeps its rules:** clear space of one pearl radius, minimum 120px for either wordmark and 24px for the icon, never on a busy photograph, never recoloured except the documented on-dark variant, never stretched or rotated.
- **Logo placement:** `logo-horizontal` on the auth screens and the admin header, `icon-light` in the footer, `icon-forest` on `/me`, the mark alone as the favicon tile, and no logo on the landing hero.

### Type
- **Bricolage Grotesque is the display face:** `h1`, `h2`, `h3`, the hero headline, section heads, and figures set at graphic scale. Weight 800, letter-spacing `-0.01em`, line-height 1.1 to 1.15.
- **Poppins is the body face:** paragraphs, labels, buttons, forms, tables, navigation, captions. 16px minimum, line-height 1.6.
- **Mono is not a costume.** It is used only for a file name, an id or a timestamp, and never for a label.
- **Two faces plus one outlier.** Playfair Display and Great Vibes leave the system. The cursive word inside the hero headline goes with them: one word in a different face inside a heading is a Floor gate, and the headline is set whole.

### Composition (landing page)
- **Shape: Marquee Hero.** The first screen is the photograph and the headline; below it the page changes register and becomes the argument, in the order it is argued today.
- **One primary action per screen**, the same button style everywhere, fully rounded.
- **Divider language is the mark's arc**: one curve, drawn from the logo's geometry, used at seams. It is a divider, never a status indicator.
- **No eyebrow above any heading**, no tracked capitals, no middle-dot meta strings.

### Mobile
- Tested at 320, 390, 768 and 1280. No horizontal scrolling on any route.
- Single column below 640px; type fluid between the brand book's steps rather than jumping at breakpoints.
- Every interactive element is at least 44px tall where it is touched, and the primary action is reachable with a thumb.
- The hero's existing two crops stay: the wide and mobile cut-outs are different images, and only one is ever downloaded.

### Access and states
- Every interactive element has a visible `:focus-visible` ring, appearing instantly, in sage text on light surfaces.
- Body text meets 4.5:1. Where a brand pairing does not (sage text on very light sage is 4.22:1), the darker sage extension is used.
- Every animation has a `prefers-reduced-motion: reduce` fallback.
- Loading, empty and error states keep the treatment the design doc requires; no screen is left with a spinner.

## Acceptance Criteria
- [ ] The six brand colours are declared once in `globals.css`; no semantic token resolves to a stock framework colour, and no literal colour appears outside the token block.
- [ ] `--primary` is forest. No blue remains anywhere a button, link or input is coloured by a token.
- [ ] Bricolage Grotesque renders every `h1`, `h2` and `h3`. Poppins renders body, labels and UI. No third face appears except mono on file names and ids.
- [ ] Every route renders exactly the text it renders today. A string-by-string comparison of the before and after record shows no addition, removal or rewording.
- [ ] Every link, form, field and handler in the pre-run record still exists; `sloplint --kept` reports nothing dropped.
- [ ] `logo-horizontal` appears on `/sign-in`, `/sign-up`, `/caregivers/sign-in`, `/caregivers/sign-up`, `/admin/sign-in` and the admin header. `icon-light` appears in the footer. The landing hero has no logo.
- [ ] `app/icon.svg` is the mark on a very light sage tile with a 22% corner radius.
- [ ] Gold appears at most once per screen and never as text, a border or a focus ring.
- [ ] No uppercase, tracked or mono eyebrow sits above any heading; no middle-dot meta string remains.
- [ ] At 320px wide, no route scrolls horizontally, and every control is at least 44px tall.
- [ ] `prefers-reduced-motion: reduce` removes every animation, and content is visible without scripting.
- [ ] `pnpm lint`, `pnpm typecheck` and `pnpm build` pass.
- [ ] `sloplint` reports no FAIL, and every REFLEX is fixed or waived on the record with its guard.
- [ ] `ai/design.md` describes the system that shipped, and no longer names a face or a radius the app does not use.
