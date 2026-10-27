# Design Principles

These apply to every screen. When a layout decision is unclear, these settle it. Read this before building any UI.

The system itself is in `src/app/globals.css` — palette, faces, scale, radii, shadows, focus ring. This file is the reasoning behind it and the rules a new screen has to keep. If the two disagree, the stylesheet wins and this file is wrong.

## 1. Minimal

Add nothing that is not needed. No footer because websites have footers. No nav bar because websites have nav bars, except on the landing page, where one floating pill links the page's own sections and its one action; every other screen carries none. If a section has nothing to say, it does not exist, and an empty area is an acceptable answer.

Every element has to earn its place on the screen.

## 2. Space

Everything gets room. Generous whitespace, few elements per screen, comfortable line lengths. Density is a cost the reader pays, so it is only worth paying when the content genuinely demands it.

Sections are separated by at least 120px at 1440, and no two seams are the same size. On the landing page the mark's smile holds the hero, and the seams beneath it are surface changes and hairlines rather than one repeated divider.

## 3. Focus

The most important thing on a screen is the easiest thing to find. If removing everything else makes it stand out, remove everything else. One primary action per screen; anything competing with it is suspect.

## 4. Consistency

shadcn/ui already has the component. Use it. A custom component is the exception and needs a reason the existing one fails — not a preference for writing it differently.

This also means one way to do a thing across the whole app: one button style, one form layout, one loading treatment, one error treatment.

## 5. Finish

The details that make software feel considered are part of the work, not a polish pass at the end:

- Loading states are skeletons that match the shape of the content, not spinners or blank screens.
- Transitions are short and quiet. They should register as smoothness, not as animation. Animate colour, opacity and transform — never `all`, never `width`, `height`, `top` or `left`.
- Empty states say what belongs here and how to add it.
- Errors say what went wrong and what to do next.

## 6. Colour

Every colour is a token in `globals.css`. Nothing new gets introduced, ever — if a colour is missing, that is a conversation, not an inline value.

The palette is the brand kit's, declared once and referenced by every semantic token:

| Token | Value | Role |
|---|---|---|
| `--brand-sage-100` | `#D4E2CF` | very light sage — the page, muted surfaces |
| `--brand-sage-300` | `#9DB89A` | soft sage — dividers, quiet accents |
| `--brand-sage-600` | `#4F6E55` | sage text — ring, boundaries, secondary accents |
| `--brand-sage-700` | `#3F5A45` | extension — muted text on sage, because sage text on sage is 4.22:1 |
| `--brand-forest` | `#2E4636` | forest — ink, primary buttons, the forest band |
| `--brand-gold` | `#E0A93B` | the pearl. Decoration only |
| `--brand-pearl` | `#F5E6C6` | the shine inside the pearl, and the price line on the forest band |
| `--brand-white` | `#FFFFFF` | cards, inputs |

- **Use semantic tokens, never the raw palette or an arbitrary value.** `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `border-border`. Not `bg-blue-500`, not `text-gray-700`, not `bg-[#123456]`, not a raw `oklch(...)`. The `--brand-*` names exist for the two jobs the semantic set has no word for: the arc divider and the pearl line.
- **Gold never sets text, a link, a border that carries meaning, or a focus ring.** It is 2.12:1 on white. It appears at most once per screen, and on a screen with the mark it is already spent on the pearl.
- **The ring is sage.** `--ring` follows the surface: sage text on paper and white, very light sage on the forest band, so the focus indicator is 3:1 everywhere.
- **Derived colours** carry state, and are the only additions the kit does not name: `--destructive` (a warm brick), `--success` (a deep green, legible as text on white), `--warning` (the pearl's gold with forest text). Every one is declared once, with white or forest as its foreground.
- **Three surfaces are the rhythm:** sage paper, white, forest. A page changes register by changing surface, not by adding a panel.
- **Radius** comes from `--radius` (24px, the brand's card): `rounded-lg` is 24, `rounded-md` is 18 (the brand's tile), `rounded-sm` is 10 (its chip). Buttons are 12px or fully rounded. Never `rounded-[17px]`.
- **Shadows** are forest-tinted and barely there; the brand is flat. Elevation is lightness. Use `shadow-sm` at most, and prefer a 1px border.
- **This app is light only.** There is no dark mode and there will not be one. The `dark` variant in `globals.css` is pinned to a `.dark` class that is never applied. **Do not delete that line.** Tailwind v4 sends `dark:` to `prefers-color-scheme` by default, so removing it would give a visitor whose operating system is in dark mode half-applied dark styles out of those components. Do not add a `.dark` class anywhere either.
- **The browser's own surfaces are themed:** `::selection` is soft sage on forest, the scrollbar is sage.

## 7. Type

Two faces and one outlier:

| Role | Face | Where |
|---|---|---|
| Display | **Bricolage Grotesque**, variable, weight 800, `-0.01em` | every `h1`, `h2`, `h3`, the hero, figures at graphic scale |
| Body | **Poppins**, 400/600 | paragraphs, labels, buttons, forms, tables, navigation |
| Outlier | **JetBrains Mono** | a file name, an id, a timestamp. Never a label |

- Headings take their weight and tracking from the base layer, so no component repeats them. A heading that needs a different size changes the size only.
- Body is 16px or more with 1.6 leading. Labels may go a step smaller; functional text never below 13px.
- **One word is never set in another face inside a heading.** No script, no italic accent, no coloured word. The whole head goes one way.
- **No tracked capitals, no small caps, no eyebrow above a heading.** A label above a title is body copy, sentence case, untracked — or it is not there.
- Running prose stays under 70 characters a line.

## 8. The mark

`src/components/brand/logo.tsx` is the only place a logo file is referenced. Variants `horizontal`, `stacked`, `icon`; tones `default` and `onDark`; sizes from the artwork's own viewBox, so nothing can stretch it.

- Minimum 120px wide for either lockup, 24px for the icon. Clear space of one pearl radius on all sides.
- `logo-horizontal` on the auth screens, the terms masthead and the admin header. `icon-light` on the forest footer. `app/icon.svg` is the mark on a rounded very light sage tile.
- **Never on a photograph**, never on gold or soft sage, never recoloured — except the documented on-dark wordmark, which swaps the two wordmark inks to the light palette and leaves the pearl gold.
- The mark's smile is drawn at page scale in `components/brand/smile.tsx`. It holds the hero and returns above the close, and it is a shape, never a status indicator.

## Applying these

- Minimal and Focus pull in the same direction: remove first, then check whether anything is actually missing.
- Space is the default, not the reward. Start with too much and take it away.
- Consistency and Finish both mean using what exists rather than inventing something per screen.
