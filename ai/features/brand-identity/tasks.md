# Tasks: Brand identity and site redesign

- [x] Record the before state: run Hallmark's `sloplint --before` over `src`, keeping `.hallmark/before.json`. Baseline was 19 FAIL, 33 REFLEX, 8 WARN; 18 links, 15 fields and 62 handlers recorded.
- [x] Put the four SVGs in `public/brand/`, strip the `<metadata>` element and the `c2pa` namespace from each, and confirm each still renders. The icons went from 8.3 KB to 513 bytes; the wordmarks from 22 KB to 14.5 KB.
- [x] Build the on-dark wordmark: the two wordmark inks swapped to the light sage and the pearl highlight, the gold pearl untouched. Verified by rasterising it on forest and counting pixels of each ink.
- [x] Add `src/components/brand/logo.tsx`: variants `horizontal`, `stacked`, `icon`, tones `default` and `onDark`, intrinsic width and height from the artwork's viewBox.
- [x] Load Bricolage Grotesque and Poppins in `layout.tsx` with `next/font/google`; remove Playfair Display and Great Vibes; keep JetBrains Mono for file names and ids.
- [x] Rewrite the top of `globals.css`: the Hallmark stamp and critique line first, then the imports, the brand palette declared once, and every shadcn semantic token mapped onto it.
- [x] Add the base layer: heading weight and tracking, `overflow-x: clip` on `html` and `body`, an instant sage `:focus-visible` ring that follows the surface, themed `::selection` and scrollbar, and a `prefers-reduced-motion` block.
- [x] Set the type scale from the brand book and confirm body text never renders under 16px and labels never under 13px.
- [x] Add `src/app/icon.svg` from `icon-forest` on a very light sage tile with a 22% radius, and delete the framework's placeholder `favicon.ico`. Verified by rasterising at 64px and counting the sage, forest, gold and pearl pixels.
- [x] Recompose the hero: photograph band, headline whole in Bricolage on the paper below, one sentence, one action. The cursive span is gone and both crops still ship one per viewport.
- [x] Recompose the four steps on the arc seam. All four titles and bodies unchanged.
- [x] Recompose the four reasons as rows on the page's white band. All four titles and bodies unchanged.
- [x] Recompose the offer as a full-bleed forest band with the price in the pearl.
- [x] Recompose the guarantee as the page's one white card, and the FAQ as a two-column seam. Five questions and five answers unchanged.
- [x] Recompose the final ask and the footer, including the on-dark wordmark and its clear space.
- [x] Apply the system to the five auth screens and to `/auth/error`: the wordmark in place of the text link, one card treatment, one focus ring.
- [x] Apply the system to `/household`, `/me` and the admin screens. Removed five uppercase mono eyebrows, replaced the middle-dot city list on `/about`, and removed the duplicate "Household" label.
- [x] Fix `household/loading.tsx` so its pulse has a reduced-motion fallback. Also removed `transition-all` from four shadcn components, deleted the unused drawer, and de-blurred the dialog backdrop.
- [x] Walk the mobile pass at 320, 375 and 768 across ten routes: no horizontal scroll anywhere, nothing clipped, the FAQ usable, the headline readable.
- [x] Run the Hallmark sweep over `src` and every public route. 0 FAIL, 0 WARN; 8 findings waived on one record (7b, pure white surfaces), 2 dismissed (F18, the 16px chevron), 1 note (58, verbatim copy). `--kept` reports links 18/18, fields 15/15, handlers 62/62.
- [x] Run `pnpm lint`, `pnpm typecheck` and `pnpm build`.
- [x] Rewrite `ai/design.md` as the locked system.
- [ ] Ask the user to validate the visuals before marking roadmap item 7.4 completed.

Deviations from the plan, recorded:

- The hero was recomposed twice before it held. The delivered assets could not carry white type over the cut-out (1:1 at some crops) or over the bright sky (4.3:1), so the copy moved onto the paper below a photograph band.
- `hero.tsx` needed `next.config.ts` to allowlist image quality 78. That was a pre-existing bug: every hero image was being refused with a 400.
- `src/components/ui/drawer.tsx` was deleted rather than repaired. It was imported nowhere and its animation moved `height`, which is a Floor violation.
- `/me` did not get the mark in its header. The profile header already carries a cover image and an avatar, and a third brand element in that corner would be decoration.
- The `Household` label above "Your household" was removed rather than restyled: it repeated the heading word for word.

Deferred:

- [ ] Raster exports for `apple-icon` (180px) and the social card (1200x630), which need the designers or a rasteriser.
- [ ] A branded HTML email template; the rejection email stays plain text.
- [ ] Any new photography. The page keeps its two crops and two cut-outs.
- [ ] Correcting "$10 a month" on the landing page against the $99 in `ai/business-model.md`, which is the owner's call.
- [ ] Designer sign-off on the three extensions: the darker sage, the derived red/green/amber, and the on-dark wordmark.
- [ ] A root `design.md` for Hallmark's pre-flight. `ai/design.md` stays the single source of truth.
