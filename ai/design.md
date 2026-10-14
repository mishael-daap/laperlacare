# Design Principles

These apply to every screen. When a layout decision is unclear, these settle it. Read this before building any UI.

## 1. Minimal

Add nothing that is not needed. No footer because websites have footers. No nav bar because websites have nav bars. If a section has nothing to say, it does not exist, and an empty area is an acceptable answer.

Every element has to earn its place on the screen.

## 2. Space

Everything gets room. Generous whitespace, few elements per screen, comfortable line lengths. Density is a cost the reader pays, so it is only worth paying when the content genuinely demands it.

## 3. Focus

The most important thing on a screen is the easiest thing to find. If removing everything else makes it stand out, remove everything else. One primary action per screen; anything competing with it is suspect.

## 4. Consistency

shadcn/ui already has the component. Use it. A custom component is the exception and needs a reason the existing one fails — not a preference for writing it differently.

This also means one way to do a thing across the whole app: one button style, one form layout, one loading treatment, one error treatment.

## 5. Finish

The details that make software feel considered are part of the work, not a polish pass at the end:

- Loading states are skeletons that match the shape of the content, not spinners or blank screens.
- Transitions are short and quiet. They should register as smoothness, not as animation.
- Empty states say what belongs here and how to add it.
- Errors say what went wrong and what to do next.

## 6. Colour and tokens

Every colour, radius, shadow, and font comes from `src/app/globals.css`. Nothing new gets introduced, ever — if a colour is missing, that is a conversation, not an inline value.

- **Use semantic tokens, never the raw Tailwind palette or an arbitrary value.** `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`. Not `bg-blue-500`, not `text-gray-700`, not `bg-[#123456]`, not a raw `oklch(...)`.
- **The available set:** background/foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, chart-1…5, sidebar-*.
- **Radius** comes from `--radius` (1.05rem) and its derived scale. Use `rounded-lg`. Never `rounded-[17px]`.
- **Shadows** come from `--shadow-2xs` through `2xl`. Use `shadow-sm`. Never a hand-written `box-shadow`.
- **Spacing** unit is 0.25rem, so Tailwind's numeric scale *is* the spacing system: `p-4` is 1rem. Use it rather than arbitrary values, and reach for the larger steps — principle 2.
- **Fonts:** `font-sans` is Poppins, `font-serif` Playfair Display, `font-mono` JetBrains Mono. `font-heading` maps to the sans face, so headings are Poppins too.
- **This app is light only.** There is no dark mode and there will not be one. The `dark:` classes left in some shadcn components are inert, and they are inert for exactly one reason: the `dark` variant in `globals.css` is pinned to a `.dark` class that is never applied. **Do not delete that line.** Tailwind v4 sends `dark:` to `prefers-color-scheme` by default, so removing it would give a visitor whose operating system is in dark mode half-applied dark styles out of those components. Do not add a `.dark` class anywhere either. `html` sets `color-scheme: light` so native scrollbars and form controls match.

## Applying these

- Minimal and Focus pull in the same direction: remove first, then check whether anything is actually missing.
- Space is the default, not the reward. Start with too much and take it away.
- Consistency and Finish both mean using what exists rather than inventing something per screen.
