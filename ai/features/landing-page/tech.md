# Technical Plan: Landing page

## Components
- **`src/app/page.tsx`** — the route. Replaces the create-next-app default. Static, no data fetching.
- **`src/components/landing/`** — one file per section: `hero.tsx`, `benefits.tsx`, `call-to-action.tsx`, `guarantee.tsx`. Section wrappers only; they hold no styling of their own beyond layout.
- **shadcn** — `Button` for both calls to action. `Separator` if a divider is needed. Nothing else is required, and nothing new gets built.

## API
None. No routes, no server actions, no data.

## Data Model
None. The page reads nothing from the database.

## Flow
Request → the proxy refreshes the session and lets an anonymous visitor through → the static page renders → done.

## Notes
- **Static.** No `async` components, no `fetch`, no Supabase client. The page must build and render with the network down, which is also an acceptance criterion.
- **Metadata** is set in the route with `export const metadata`, carrying the title and a description written from the same subheading. That is the whole SEO story; there is no second page yet.
- **Spacing is the design.** With three short sections, generous vertical rhythm is what makes the page feel considered. Use the larger steps of Tailwind's scale rather than filling space with decoration.
- **Both calls to action point at `/sign-up`, which does not exist yet.** That route arrives with household accounts. Until then the link is dead, which is a known and accepted state rather than a bug. If signup is not built next, a holding page may be worth adding so the landing page never ships a broken button.
- **The benefits describe features that are not built.** Browsing and filtering arrive with the catalog and search features. Community and events are not on the roadmap at all, so the page will advertise them before anything exists. That is a product decision, not a technical one.
- **No custom UI primitives.** Section files compose shadcn components and Tailwind layout utilities. If a section seems to need a new primitive, the section is probably doing too much.
