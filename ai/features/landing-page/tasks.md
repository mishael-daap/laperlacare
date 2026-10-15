# Tasks: Landing page

Built section by section, directed rather than pre-planned, so the list below is what actually shipped rather than the order it was written in.

- [x] Replace `src/app/page.tsx` and set real page metadata; the create-next-app default title and description are gone.
- [x] Hero: full-bleed photograph switched by media query between two crops, a transparent cut-out centred with its bottom edge on the viewport bottom, and the copy bottom-left on top of both.
- [x] Benefits: three items under an `h2` reading "Features", no cards and no icons.
- [x] First call to action: a centred `Card` on the primary colour, soft corners, reading "Get access to the network" with the price and a button labelled "Join".
- [x] Guarantee: money back within 30 days, deliberately quieter than the sections around it.
- [x] FAQ: five questions in a shadcn Accordion, no hover underline, sized up for readability.
- [x] Final call to action: copy left and button right on one line, button reading "Start for $10".
- [x] Footer: one line on `bg-foreground` carrying the copyright.
- [x] Audit every class against `globals.css`; no colour, radius, or shadow outside the theme tokens, and no `dark:` classes added.
- [x] Heading order checked: one `h1`, section `h2`s, and `h3`s inside Features.
- [x] `pnpm lint`, `pnpm typecheck`, and `pnpm build` pass; `/` prerenders static.

Not done yet:

- [ ] **Lighthouse** accessibility and best-practices audit. Not run. The likely findings are contrast on the hero, since the overlay was removed at request and both photographs measure bright, and the backdrop `img` which carries an empty alt behind decorative intent.
- [ ] **Render with the network unavailable.** The page fetches nothing, so this should hold, but it has not been confirmed by actually disabling the network.
- [ ] **Compress the hero images.** They total about 4 MB in `public/hero`, which is heavy for the repo even though Next optimises what visitors download.
- [ ] **The calls to action point at `/sign-up`, which does not exist.** It arrives with household accounts. Until then the buttons are dead links.
