# Ridgewood Wealth Management

Marketing site for Ridgewood Wealth Management. The visual style is a Swiss grid with an editorial serif and hairline frames.

Built with [Eleventy](https://www.11ty.dev/) into a plain static site in `_site/`, deployed on Cloudflare Pages.

```sh
npm start      # dev server
npm run build  # build to _site/
```

On Cloudflare Pages, build-time variables (`PUBLIC_TURNSTILE_SITE_KEY`) come from the project's environment variables. Locally, they're read from `.env`.

## Code comments

Nothing under `src/assets/` is post-processed. Eleventy copies the CSS and JS as-is, and `main.css` `@import`s each component file at runtime. Comments would therefore be shipped to every visitor, so the served CSS and JS have none. Their documentation lives here, organized by file.

- Templates use Liquid `{% comment %}` tags, which are stripped at build time.
- Server and build code (`functions/`, `eleventy.config.js`, `src/_data/`) never reaches the browser, so it keeps its comments inline.

When you change a file below, update its notes here.

---

## Stylesheet architecture: `css/main.css`

Each component lives in its own file, imported into a cascade layer:

```
@layer reset, base, layout, components, pages, utilities;
```

- **`base/fonts.css`** is imported first and unlayered (`@font-face` is unaffected by layers).
- **reset → base → layout → components → pages → utilities**, in that order. Later layers win.
- **`base/reduced-motion.css` and `base/view-transitions.css`** are imported last and unlayered. Reduced motion was unlayered in the original single stylesheet, and it stays that way.

## Base

### `base/fonts.css`

Self-hosted web fonts, under the SIL Open Font License (see `assets/fonts/OFL.txt`).

Each style is split into three files by `unicode-range`, so the browser only downloads what a page actually uses:

| Subset        | Covers                                                        |
| ------------- | ------------------------------------------------------------- |
| `latin`       | Basic Latin plus the punctuation the copy uses (preloaded)    |
| `latin-extra` | The rest of Google's latin subset: accented letters, €, etc.  |
| `latin-ext`   | Latin Extended                                                |

Where ranges overlap, the face declared later wins, so `latin-extra` follows `latin-ext`. Faces are declared in this order for each style: `latin-ext`, `latin-extra`, `latin`.

- IBM Plex Sans: italic 400 and normal 400–600. It's a variable font, so one file per style covers weights 400–600.
- Instrument Serif: italic 400 and normal 400.

### `base/tokens.css`

Design tokens: colour, type families, fluid type and space scales.

- **Colour.** `--blue` is the Ridgewood primary.
- **`--ink-muted`** is relative to the surrounding text colour (`currentColor`, resolved where it's used). Muted text therefore follows its parent: a link's subtitle turns oxblood on hover.
- **`--rule`** is relative to the surrounding text colour too, so rules follow their context: a link's divider tints oxblood on hover.
- **Families.** `--serif` and `--sans`.
- **Fluid type scale.** `--step--2` … `--step-6`.
- **Space.** `--frame`, `--gutter`, `--space-*`.

### `base/elements.css`

Element defaults: page, body type, paper grain, headings, links, selection, focus.

- `body::after` is the paper grain, a whisper of texture over everything.

### `base/reduced-motion.css`

Site-wide reduced motion: turns off transitions and smooth scrolling when the visitor prefers reduced motion.

### `base/view-transitions.css`

Cross-document view transitions: same-origin page navigations crossfade using the browser's default animation. Browsers without support simply navigate normally. Skipped for visitors who prefer reduced motion.

## Layout

### `layout/sheet.css`

Page frame (the bordered sheet), wrap and section rhythm.

- The body's inline margin, `max(var(--frame), (100% - 110rem) / 2)`, centres the sheet once its width is capped.

### `layout/grid.css`

12-column grid. Children choose their columns at the wide breakpoint.

## Components

### `components/masthead.css`

Masthead: logo lockup, primary nav and the client portal link.

- **`--nav-gap`** is the spacing between nav links, and between the nav and Clients.
- **Narrow screens:** a two-column grid. The logo and Clients share the top row, and the site nav drops below at full width.
- **From 40rem:** one row. The logo sits left, with the nav and Clients pushed right.
- **`margin-inline`** is a margin, not padding, so the hairline stops at the gutters.
- **`.masthead-clients`** (client portal) is a compact ghost button. It has the same vertical padding and bottom border as the nav links, so its text shares their baseline. Its `::after` adds ↗ to mark the off-site link.

### `components/colophon.css`

Footer (colophon).

- Links use `color: inherit` on hover because oxblood would vanish on the blue footer.
- The address and list items' 1.75 line-height gives 28px rows, which clears the 24px tap-target spacing.

### `components/text.css`

Small type: labels, meta figures, colour helpers.

- **`.meta`:** small uppercase figures and meta text, such as step numbers, counters and section numbers.

### `components/headings.css`

Display headings. Emphasis in the largest sizes is set in oxblood.

### `components/prose.css`

Running text: lede, statement, serif text, prose, drop cap.

- **`.serif-text`:** serif running text (About intro, Legal).
- **Drop cap:** only where the browser supports real initial letters (`@supports (initial-letter: 3)`).

### `components/button.css`

Buttons. `.button` is solid blue with a → that nudges right on hover. `.button-ghost` is the outlined variant.

### `components/arrow-link.css`

Underlined arrow link.

### `components/fig.css`

Figure cards, after the reference's FIG. 01 / FIG. 02 panels.

- Home: number, big title, footnote.
- Process: stage bar, heading, body.

### `components/section-head.css`

Section head row: number, hairline, label.

### `components/skip-link.css`

Skip-to-content link.

### `components/reveal.css`

Scroll-driven reveal: content eases in and up as it scrolls into view.

- **Section blocks.** Each direct child of a `.section` (header row, headline, grid…) reveals as one block.
- **Repeated items.** Containers of repeated items (card rows `.figs`, numbered points `.numbered`, the cadence pair `.grid:has(> .cadence)`) reveal their children one after another instead. The block holding such a container doesn't animate itself, so motion never compounds.
- **The selector list.** Its second line reaches one level into a block that holds a staggered container, so that block's other children still reveal. The third line selects the repeated items, staggered by `--i`.
- **Progress.** Measured as a share of each element's own entry into the viewport, capped at 18rem of scroll. Everything has fully appeared by the time it can be scrolled to, so nothing at the foot of a page is left half-faded.
- **Skipped** for reduced motion and in browsers without scroll timelines.

## Pages

### `pages/home.css`

Home: hero with the oak, trust, principles, call to action.

- **`.hero`:** its `background: var(--paper)` is the backdrop for the photo's multiply blend. `.display + h2` gets a top margin that clears the headline's descenders.
- **`.hero-media`:** a lone oak, right-aligned. The photo fills the hero's height and is pinned by its trunk (71.3% across the source image), so the canopy may bleed off the right edge. Masks fade it out behind the type.
  - **Monochrome blue.** The grayscale photo is screened over a blue fill (shadows → primary blue, highlights → white), then multiplied onto the paper so the whites drop out to cream.
  - **`--trunk-x`** is where the trunk lands across the hero. The % is of the hero's width, so the fixed 10rem is a bigger share on narrow screens and nudges the trunk right: about 95% on phones, 85% on tablets, 80% on desktop and 78% very wide.
- **`oak-drift`:** a faint parallax. The oak drifts down at about 15% of the scroll speed over the first screenful, so it lags behind the type. Because it's anchored to scroll 0, it rests exactly where it's placed, and the gap it opens at the top always stays above the viewport. The keyframe repeats `-71.3%` to keep the trunk anchor from `.hero-media img`, so change both together.
- **`.contents`:** at 64rem it's capped at `min(40rem, 46%)` to stay clear of the canopy.

### `pages/page-hero.css`

Inner page hero.

### `pages/wealth-navigator.css`

Wealth Navigator: compass backdrop and the four domain columns.

- **`.compass-stage::before`:** the original site's compass rose, gigantic and faint, underlaying both the hero and the domain list. Decorative only.
  - **`--compass-x`** is where the compass hub lands across the stage. Like the oak's `--trunk-x`, the % is of the stage width, so the fixed 6rem nudges it right on narrow screens: about 92% on phones, 77% on tablets and 72% on desktop.
  - It's pinned to the top of the stage.
  - `block-size: min(97.75%, 144.5vw)` is 85% of the original 115% / 170vw.
- **`compass-turn`:** the compass turns slowly clockwise as the page scrolls, from 12deg at the top of the page to 20deg at the bottom. Skipped for reduced motion.
- **`.domains`:** the four domains, side by side. They aren't a sequence, so there are no step arrows. Each column lists its service areas.
  - **Four across (64rem):** each item spans four subgrid rows, so taglines and lists line up even when a name ("Investment Management") wraps to two lines.
  - The lists use `align-self: start`, so each one ends at its last item.

### `pages/about.css`

About: founder bios.

- The portrait coin is the same height as the founder's name (`title-m`, line-height 1).

### `pages/process.css`

Process: hero intro and controls, step detail sections.

- **`.process-hero`:** the carousel sits flush on the hero's bottom edge. `overflow: clip` clips the carousel only where it meets the hero's edges.
- **`--control`** is the controls' shared height. The icon-only toggle is a square of this size.

### `pages/carousel.css` and `js/cycle.js`

The Process cycle carousel.

The four steps ride a circular track:
- **Active step:** sits at 12 o'clock, at the top of the stage, with a little relief off the right edge.
- **Next step:** waits at 9 o'clock, below-left, with its top edge peeking in (shrunk and blank).
- **Previous (3 o'clock) and opposite (6 o'clock):** hidden.

Each slot is placed with rotate → translate → counter-rotate. When `--turn` changes, the angles interpolate and the cards glide clockwise along the arc, staying upright. The script only increments `--turn`. Without JS, Discover shows and the Next button stays hidden.

**Geometry.** It's declared on `.carousel > *` so `cqi` resolves against the carousel's width, which bleeds to the frame (`.carousel`'s negative end margin). There are no breakpoints: every value scales continuously with `min()`/`max()`/`clamp()`.

| Property | Meaning |
| --- | --- |
| `--relief` | The active card's inset from the right edge. |
| `--w` | Card width. 60% of the carousel on small screens (leaving room for the next card to peek in), growing to fill all but 16rem of it, capped at 25.5rem. The two terms cross at a 40rem-wide carousel. |
| `--h` | Card height. |
| `--peek` | Scale of the non-active cards. |
| `--gap` | Minimum gap between cards, as a fraction of card height. |
| `--R-min` | Smallest collision-free radius. The 9 o'clock card (scaled by `--peek`) must clear the active card vertically, by h/2 + peek·h/2, plus the gap. |
| `--R` | Grows with the window: the minimum below 40rem, up to 2× at about a 1580px window. |
| `--cx` | Track centre, under the active card, which is top-aligned and hugs the lede, with its left edge on the carousel's left edge. Where there's little room to the left (100vw − 100cqi: the stacked, single-column layout), it shifts right just enough to keep the 9 o'clock card on screen, but never past `--relief` from the right edge. |

The stage's `block-size` reaches down to the 9 and 3 o'clock cards' top edges, plus the same measure as `--relief`.

**Arrows (`.carousel-arrow`).** The arrowheads sit on the track in the gaps either side of the active card, where the ring crosses the middle of the gap below it. Angles are measured clockwise from 9 o'clock. They're drawn pointing up (the clockwise tangent at 9 o'clock) and rotated about the centre, so they always point clockwise along the path. They're painted before the cards, so they pass behind them.

On each advance they leapfrog, always clockwise:
- The arrow in the left gap glides over the top into the right gap (180° − 2g).
- The arrow in the right gap carries on round the bottom, hidden below the hero, into the left gap (180° + 2g).

Two advances make one full lap each.

- **`--mid`** is the middle of the gap, measured down from the active card's centre.
- **`--g`** comes from sin g = (R − mid) / R. `tan(atan2(a, b))` yields the unitless ratio a/b.
- The arrow is long and narrow (0.55rem × 1rem), so the tip reads at any angle.
- **`.carousel-arrow-in`** starts between 9 and 12. **`.carousel-arrow-out`** starts between 12 and 3.

**Slots and cards.**
- **`--t`** is the slot's angle, clockwise from 9 o'clock. The active slot (pos 0) is at 90deg, which is 12 o'clock.
- **Easing.** Transitions apply only while advancing (`cycle.js` sets `.is-turning`), so resizing the window snaps the geometry rather than animating it.
- **Positioning.** The card is `position: relative` to anchor the title link's overlay.
- **Scale.** Non-active cards are scaled by `--peek`. At rest, only the hover lift changes scale; advancing overrides this.
- **Visibility.** The 6 o'clock card (`data-pos="2"`) stays hidden. The previous one (pos 1) rotates on to 3 o'clock, where its corner still shows, shrunk and blank like the 9 o'clock card. Only the active card shows text, which fades in as the card arrives (0.45s delay).
- **The link.** The whole active card is the link, and it lifts on hover or keyboard focus. A stretched link (`::after` overlay) makes the entire card clickable while the link's accessible name stays just the step name. The link's own outline is removed, and the focus ring is drawn around the whole card instead.

**Pause/Play (`.carousel-toggle`).** An icon-only button (named by `aria-label`) drawn in CSS from the button's state: pause bars, or a play triangle. It's square, matching the Next button's height.

**`cycle.js`.** Advances the cycle one step clockwise, by button or every 6s on its own, with a Pause/Play toggle. All motion is CSS. The script only bumps `--turn`, marks each step's position in `data-pos`, and toggles `.is-turning`, which turns transitions on only while moving.

- **Positions:** 0 = active (12 o'clock), 1 = previous (3), 2 = opposite (6), 3 = next (9). Non-active slots are `inert`.
- **Controls** live in the copy block, tied to the carousel by `aria-controls`.
- **`turn` never wraps,** so the rotation always continues clockwise.
- **`advance()`** sets `.is-turning` in the same frame the positions change, because transitions only exist while it's set. The class stays on for 1s, until the motion settles.
- **Auto-advance** is stopped by the Pause button. Reduced-motion users start stopped and can press Play to opt in, and it follows changes to that preference. It's also held while the active card is hovered, or while the carousel or the Next button has keyboard focus.
- **Pressing Next** restarts the 6s timer and announces "Step n of 4: Name" in the live status region.

### `pages/contact.css`

Contact: title and subtitle beside the message form.

- **The form:** framed sans-serif fields, stacked. Once sent (`#message-sent:target`), the form hides behind its confirmation.
- **`.honeypot`:** off-screen for people, but still in the form for bots.
- **Focus:** the focused field's inset `box-shadow` thickens its frame to 2px.
- **`.form-status`:** the confirmations, shown when the Function redirects back with `#message-sent` or `#message-error`. No page JavaScript is needed.

The form's contract with `functions/api/contact.js` is documented next to the form in `contact.liquid`.

### `pages/legal.css`

Legal: contents list and fine print.

## Reset and utilities

- **`reset/reset.css`:** CSS reset.
- **`utilities/utilities.css`:** utility classes, such as `.visually-hidden`.
