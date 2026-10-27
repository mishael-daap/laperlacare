# Technical Plan: Brand identity and site redesign

## Components
- **`src/app/globals.css`** — the whole system: the brand palette declared once, the semantic tokens shadcn already reads mapped onto it, the type hooks, the base layer (heading weight, focus ring, overflow, selection, scrollbar), and the Hallmark stamp above the imports.
- **`src/app/layout.tsx`** — `next/font/google` loads Bricolage Grotesque and Poppins. Playfair Display and Great Vibes are removed.
- **`src/components/brand/logo.tsx`** — one component, three variants, two tones, so no page hand-rolls an `<img>` or a second copy of the wordmark.
- **`public/brand/`** — the four delivered SVGs with their embedded metadata stripped, plus the on-dark wordmark.
- **`src/app/icon.svg`** — the favicon, built from `icon-forest` on the rounded sage tile the brand book specifies.
- **`src/components/landing/*`** — recomposed. Copy untouched, structure and classes new.
- **`src/components/landing/footer.tsx`** — forest surface, on-dark wordmark.
- **Auth screens** (`/sign-in`, `/sign-up`, `/caregivers/sign-in`, `/caregivers/sign-up`, `/admin/sign-in`, `/auth/error`), **`/household`**, **`/me`** and its components, **`/admin/(dashboard)`** and its detail page — the system cascades through the token layer; these files change only where a class or a logo has to move.
- **`ai/design.md`** — rewritten as the locked system: palette, faces, scale, radii, motion, the gates this project keeps.

## API
None. No route, server action, query or policy changes. `sloplint --before` records every link, form, field and handler first, and `--kept` proves none of them left.

## Data Model

The token layer, in two blocks. Values are the brand's, declared once; every semantic token is a reference, so a second screen cannot invent a shade.

```
:root
  --brand-sage-100  #D4E2CF   very light sage · paper, muted, borders
  --brand-sage-300  #9DB89A   soft sage · dividers, secondary accents
  --brand-sage-600  #4F6E55   sage text · muted text, ring
  --brand-sage-700  #3F5A45   extension · muted text on sage, 5.9:1
  --brand-forest    #2E4636   forest · ink, primary buttons
  --brand-gold      #E0A93B   the pearl · decoration only
  --brand-pearl     #F5E6C6   the highlight inside the pearl
  --brand-white     #FFFFFF   cards, inputs

shadcn semantic tokens → brand
  background        sage-100        foreground        forest
  card              white           card-foreground   forest
  primary           forest          primary-foreground white
  secondary         sage-100        secondary-foreground forest
  muted             sage-100        muted-foreground  sage-700
  accent            sage-300/20     accent-foreground forest
  border, input     sage-300        ring              sage-600
  destructive       derived red     success, warning  derived
  radius            24px            radius scale      24 / 19 / 14
```

Type:

```
--font-heading, --font-display  Bricolage Grotesque
--font-sans                     Poppins
--font-mono                     JetBrains Mono (file names, ids, timestamps only)
```

## Flow
Brand palette → semantic tokens → Tailwind utilities and shadcn components → every screen inherits the rebrand without being edited; the landing page additionally gets a new composition on top of the same copy.

## Notes
- **No separate `tokens.css`.** Hallmark's scaffold writes tokens beside the project's stylesheet, and its own export rules say to map onto the names a project already uses when it has them. This project has them: `@theme inline` plus `:root` in `globals.css`. A second file would fork the source of truth and fight the `@theme inline` block.
- **`font-heading` is the cascade.** Every heading in the app already carries that class and it resolves through `--font-heading`, so pointing it at Bricolage rebrands the app in one line. Heading weight moves to the base layer (`h1, h2, h3 { font-weight: 800; letter-spacing: -0.01em }`) so no component has to repeat it.
- **Paper is very light sage, cards are white.** The brand book names both as page and card backgrounds, and white cards with a sage hairline is what its surfaces section describes. This gives the page a tinted paper (Hallmark's zero-chroma reflex) and leaves white as an honest "surface: absolute", declared in the stamp.
- **The ring is sage text, not gold.** Gold on white is 2.12:1, below the 3:1 non-text minimum, so the brand book's own gold focus outline cannot ship. Sage text is 5.68:1 on white.
- **The on-dark wordmark is an extension.** The kit ships no reversed logo, and the footer and admin header sit on forest where the delivered wordmark reads at 1.8:1. The variant swaps the two wordmark inks to the light sage and the pearl highlight, and leaves the gold pearl untouched, which the brand rules allow. It is listed in the handoff for the designers to confirm.
- **Fonts come from `next/font/google`, not from the zip.** Both faces are on Google Fonts, and `next/font` self-hosts them at build time with the subsets and the `display: swap` the app already uses. The zip's TTFs are not shipped; they stay in `brand-kit/` as reference. Self-hosting would also oblige us to ship the OFL notices, which `next/font` handles by not redistributing the files.
- **The C2PA metadata comes out.** Each delivered SVG carries 7.7 KB of base64 manifest, roughly half its size, which would be downloaded with every logo render. The artwork is untouched; only the `<metadata>` element and the `c2pa` namespace go.
- **Copy verbatim makes three gates notes.** Hallmark reports 19, 58 and 69 as notes under `copy: verbatim`; 58 is a note at every redesign depth anyway. The one visible consequence is that the hero headline stays eight words, over the seven-word budget, because it is the owner's sentence.
- **The price on the page is not the price in the business model.** `/` says "$10 a month" twice; `ai/business-model.md` settles on $99. The copy is the owner's, so it is carried over unchanged and listed in the handoff rather than corrected here.
- **No new photography.** The page owns two crops and two cut-outs. The recomposition works with those rather than inventing a gallery, and the cut-out keeps its two sources so only one is downloaded per viewport.
- **The gates already name work in scope:** five uppercase and mono eyebrows (54, 67, 64), the middle-dot city list on `/about` (63), `animate-pulse` with no reduced-motion fallback in `household/loading.tsx` (27), and unthemed `::selection` and scrollbar (F16). They are fixed in this pass because the same files are open.
- **The render tier is optional.** No `puppeteer-core` is installed and Chrome is. Installing it globally lets the sweep produce before and after screenshots and the rendered gates; without it the static tier, the project's own checks and a walkthrough by the owner carry the verification, and the handoff says so rather than claiming a pass.
