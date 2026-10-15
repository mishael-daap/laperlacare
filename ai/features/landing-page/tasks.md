# Tasks: Landing page

- [ ] Replace `src/app/page.tsx` with an empty page carrying `metadata` (title and description) and nothing else; verify `/` renders and the build stays static.
- [ ] Add the hero section: `h1` with "California's most loving caregivers", the subheading on credential review, and the primary action; verify one `h1` on the page and correct heading order.
- [ ] Add the benefits section with the three cards in order — browse caregivers, community, events; verify the copy stays within the directory framing and promises no care.
- [ ] Add the first call to action, "Get access to the network"; verify it links to `/sign-up`.
- [ ] Add the guarantee section stating the 30-day refund; verify it is visible without scrolling past the final action.
- [ ] Add the closing call to action, "Subscribe to access the network"; verify both actions point to the same route.
- [ ] Apply spacing and vertical rhythm across the page; verify it reads at 360px, 768px, and 1280px with no cramped or overflowing section.
- [ ] Audit every class against `globals.css`; verify no colour, radius, or shadow falls outside the theme tokens and no `dark:` class was added.
- [ ] Check accessibility: heading order, landmark sections, contrast against the theme tokens, and focus states on both actions.
- [ ] Run Lighthouse; verify accessibility and best practices both reach 100.
- [ ] Verify the page renders with the network unavailable.
- [ ] Run `pnpm lint`, `pnpm typecheck`, and `pnpm build`.
- [ ] Update `ai/roadmap.md` status.
