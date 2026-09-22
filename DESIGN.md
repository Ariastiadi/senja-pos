
# DESIGN.md — SENJA POS

This file documents the actual, established design system of the SENJA POS
codebase (`index.html`, `finance.html`, `login.html`, `seed.html`, `stok.html`).
It is extracted from the real CSS already in production — nothing here is
aspirational or borrowed from another product.

**For AI agents (Claude, Cursor, etc.):** read this before adding or editing
any UI in this repo. Match these tokens and patterns exactly rather than
introducing new colors, fonts, radii, or spacing values. This keeps every
page — kasir, keuangan, stok, login — visually and structurally consistent
even when different sessions or tools touch different files.

---

## 1. Concept & Tone

A warm, artisanal cafe-and-hotel POS. The palette reads as "roasted coffee on
cream paper" — dark espresso surfaces for structural chrome (headers, dark
theme pages), warm amber as the single accent color, and a soft paper/cream
background for content areas. Typography is confident and editorial
(Bricolage Grotesque display type) paired with a clean, highly legible UI
font (Plus Jakarta Sans) and a monospace face reserved specifically for
numbers and codes (Space Mono) — this numeric monospace usage is a signature
trait of the system and should not be dropped.

Interfaces should feel tactile and slightly playful (soft shadows, small
lift-on-hover transforms, a subtle dotted-grain background texture) without
tipping into whimsy — this is a tool cashiers use all day, so legibility and
speed always win over decoration.

## 2. Color Tokens

These are the exact CSS custom properties already defined in every light-theme
page (`index.html`, `finance.html`, `stok.html`):

```css
--roast:      #1a1310   /* darkest espresso — headers, primary dark buttons, text-on-light headers */
--roast2:     #241a14   /* second stop in header gradients */
--ink:        #2b211a   /* default body text on light backgrounds */
--paper:      #f4eee2   /* page background */
--card:       #fffdf6   /* card / panel background, slightly lighter than paper */
--line:       #e6dcc6   /* borders, dividers, dashed separators */
--muted:      #8a7d6a   /* secondary text, labels, placeholders */
--amber:      #e08a2e   /* primary accent — CTAs, active states, highlights */
--amber-deep: #b9641a   /* accent hover/pressed, gradient partner for --amber */
--green:      #2f7d52   /* positive values, success, "SEIMBANG" state */
--green-deep: #1f5c3b   /* darker green for totals / emphasis */
--red:        #c8503e   /* negative values, destructive actions, "SELISIH" state */
--blue:       #24618a   /* informational accents (e.g. card payment badge) */
```

Dark-theme pages (`login.html`, `seed.html`, and any full-screen auth-style
flow) invert the relationship: `#1a1310`/`#241a14` become the page
*background*, not just header chrome, with light text `#f3ead9` and warm
gold text-accent `#f2d9ae`. Card surfaces on dark pages use `#241a14` with a
`#3d2d21` border — this is the dark-mode equivalent of `--card`/`--line`.

**Usage rules:**
- `--amber` is the *only* accent hue. Don't introduce a second accent color
  for new features — reuse amber, or fall back to green/red/blue only for
  their established semantic meaning (success/error/info).
- Status colors are semantic, not decorative: green = balanced/positive/
  success, red = error/deficit/destructive, amber = warning/attention,
  blue = neutral info (e.g. a payment method badge).

## 3. Typography

```css
--disp: 'Bricolage Grotesque', sans-serif;   /* display: headings, big numbers, KPI values, brand name */
--body: 'Plus Jakarta Sans', sans-serif;     /* everything else: UI text, labels, buttons, body copy */
--mono: 'Space Mono', monospace;             /* ALL currency figures, order numbers, codes, timestamps in receipts */
```

Loaded from Google Fonts with weights `400;500;600;700;800` for body and
`700;800` for display. `--disp` is used almost exclusively at weight `800`.

**Hard rule:** any Rupiah amount, account code, order/transaction number, or
receipt line uses `--mono`. This is what gives the interface its
point-of-sale, "tape receipt" credibility — don't render prices in the body
font.

Currency is always formatted as `'Rp ' + Math.round(n).toLocaleString('id-ID')`
(see the shared `rp()` helper in every page) — never a raw number, never a
different currency symbol placement.

## 4. Spacing & Radius

- Page padding: `18–22px` outer gutters.
- Card/panel radius: `14–22px` (bigger surfaces get bigger radius — modals
  and the ticket panel use `18–20px`, small chips use `6–11px`).
- Button radius: `9–14px`.
- Input/select radius: `8–12px`.
- Border weight: `1–1.5px`, almost always `var(--line)` on light surfaces or
  `#3d2d21` on dark surfaces — never a harder/darker generic gray border.
- Gaps between inline elements: `6–14px`, scaling with element size.

## 5. Core Components

**Buttons**
- Primary action (pay, confirm, save): amber gradient
  `linear-gradient(115deg, var(--amber), var(--amber-deep))`, dark text on
  light amber, bold, `800` weight label.
- Secondary/header action: dark chip style — `#2c211a` background,
  `#443327` border, light text, lifts 1px on hover.
- Ghost/outline (used in modal footers, export bars): transparent or
  `var(--card)` background with a `var(--line)` border; hover swaps border
  to amber.
- Destructive (clear cart, close shift): same shape as secondary but red
  text/hover background (`#fbe9e5` bg, `var(--red)` text).
- Disabled state: flat `#cfc7b4`, no gradient, `not-allowed` cursor — never
  just lower opacity on a gradient button.

**Cards / Panels**
`var(--card)` background, `1–1.5px var(--line)` border, `14–22px` radius, a
soft warm-toned shadow (`rgba(90,62,30, .04–.14)`, never pure black) — this
warm-tinted shadow (not neutral gray) is part of the palette identity.

**Badges**
Pill-shaped, `6–8px` radius, small bold uppercase-ish label, background is a
pale tint of the semantic color (`#e4f0e8` green-pale / `#fbe9e5` red-pale)
with the deep semantic color as text — used for payment-method tags and
balance-check status ("SEIMBANG ✓" / "SELISIH!").

**Modals**
Centered overlay (`rgba(24,16,10,.55)` backdrop + blur), `var(--card)`
surface, `20px` radius, header/body/footer structure with a `1.5px` divider
between each. Footer actions are always laid out as equal-width flex
buttons.

**Tables (finance.html)**
Sticky, uppercase, letter-spaced header row on a faint cream background
(`#fbf7ec`), numeric columns right-aligned and set in `--mono`, subtotal/
total rows get a heavier weight and a top border rather than a filled
background, except for the final grand-total row which does get a tinted
background matching its semantic color (profit = green tint, loss = red
tint).

## 6. Iconography

The system uses emoji in markup as a *content-authoring shorthand*, which
`deai.js` automatically converts at runtime into a matching set of outline
SVG icons (defined as a sprite injected into every page) — including emoji
in content rendered dynamically after page load. This keeps the visual
language as clean line icons everywhere, without hand-writing SVG in every
template.

**Rule for new UI:** write emoji in the markup as usual (e.g. `🧾 Export
PDF`), but first check the emoji-to-icon `MAP` inside `deai.js` — if the
emoji you want isn't in that map, it will render as a raw colorful emoji
instead of a matching line icon, which breaks visual consistency. Prefer an
emoji already in the map (e.g. use `🧾` for receipts/PDF exports, `📊` for
charts/Excel, `🖨️` for printing) over introducing a new one. If a genuinely
new icon concept is needed, add both the SVG `<symbol>` and its emoji
mapping to `deai.js` in the same change.

## 7. Layout Patterns

- **Kasir (`index.html`)**: fixed-height app shell (`100vh`, no page scroll),
  dark header bar, two-column body — flexible menu grid on the left, a
  fixed-width (`396px`) ticket/cart panel on the right styled like a
  perforated receipt (`tk-zigzag` torn-edge effect at the top).
- **Keuangan (`finance.html`)**: scrollable document-style page, sticky dark
  header with export actions top-right, a period filter toolbar, and a
  horizontal tab bar switching between report panels.
- **Auth pages (`login.html`, `seed.html`)**: single centered card on a full
  dark background, no header/nav chrome at all.

## 8. What NOT to do

- Don't add a new color outside the palette above, even "just for one
  badge."
- Don't render money, order numbers, or receipt content in the body font —
  always `--mono`.
- Don't use a neutral gray shadow — shadows are warm-tinted
  (`rgba(90,62,30, …)`).
- Don't introduce a new icon style (filled icons, a different SVG icon set,
  raw unconverted emoji) alongside the existing `deai.js` line-icon system.
- Don't change the light page background away from `--paper`/`--card` or the
  dark page background away from `--roast`/`--roast2` — every page keys off
  one of these two modes, nothing in between.
