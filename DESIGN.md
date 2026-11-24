# Insight — Design System

**Status:** source of truth for the Insight product surfaces.
**Scope:** the marketing landing page (`frontend/public/landing/`) and the React workspace app (`frontend/src/`).
**Excluded:** `video/` — it contains the product demo video, not UI to design against.

When the code and this document disagree, treat it as a defect: fix the code or update the document. Do not turn an accidental value into a new pattern.

This document defines the visual language, tokens, components, motion, voice, and implementation rules. When a screen or component is not covered here, extend the system rather than inventing a parallel one. For pixel-level rendered measurements, see [`docs/UI_VISUAL_GUIDE.md`](docs/UI_VISUAL_GUIDE.md).

---

## 1. What we are designing

Insight is an **AI-native workspace** that turns noisy team threads — chat, docs, commits — into **one clear signal**: what changed, what was decided, what is blocked, and what needs attention next.

| Surface | What it is | Where |
| --- | --- | --- |
| **Marketing site** | Long-form, animation-heavy landing page that explains the product and presents an early-access form (front-end only) | `frontend/public/landing/index.html` |
| **Workspace app** | React 19 dashboard: auth, signal hero, thread list, thread detail drawer, new-thread drawer, scan/export actions | `frontend/src/` |

The two surfaces share one brand and palette, but have **different temperatures**:

- **Marketing:** editorial and cinematic. Dark walnut and warm paper sections alternate; display serif headlines; slow, physical motion; generative 2D/3D instruments.
- **App:** instrument-grade and compact. Always-dark; sans-serif UI; monospace telemetry; hairline borders; motion only to explain state.

### The idea in one line

> **A library wall at night:** walnut-charcoal surfaces, bone-warm paper, and a single ember signal.

### Design principles

1. **Signal over noise.** One accent, one focal point per screen. If everything is highlighted, nothing is.
2. **Instrument-grade, not decorative.** Hairlines, ticks, coordinates, and mono labels should read as measurement, not ornament.
3. **Editorial warmth.** Serif display type, warm off-whites, and film grain keep a technical product human.
4. **Physical, restrained motion.** Elements lift 2–4px; panels slide 40px; rings rotate slowly. No bounce, no neon, no glassmorphism.
5. **Honest AI.** Show provenance: sources, scores, thread counts, timestamps. The interface should never imply certainty it does not have.

---

## 2. Brand

### Name and signature

- Product name: **Insight**
- Marketing wordmark: `insight` (lowercase)
- App wordmark: `INSIGHT` + `APP` superscript
- Signature line: **“Every thread. One clear signal.”**
- Category line: **“The AI-native workspace.”**

### Brand mark

**Marketing mark** — an inline SVG built from geometry, not lettering:

- Two concentric circles: solid inner ring, dashed outer ring.
- A wave path in ember (`#b06059`) across the center.
- A solid center dot in the current text color.

**App mark** — simplified for small sizes:

- 20×20px rounded square, `4px` radius, filled ember.
- A soft ember halo: `box-shadow: 0 0 0 3px rgba(176, 96, 89, 0.16)`.
- Wordmark: `INSIGHT` at 14px / 600 / `0.16em` tracking; `APP` at 8.5px JetBrains Mono, ember, superscript.

### Brand rules

- Do not recolor the mark outside the ember/bone/ink palette.
- Do not place the mark on a gradient, photograph, or saturated fill.
- Do not outline, skew, or add drop shadows to the wordmark.
- Keep clear space around the mark equal to at least one mark width.
- The accent is a **signal**, not a surface. Keep it near a 5% visual budget.

---

## 3. Color

### 3.1 Marketing palette

The landing page authors colors in hex with an exact OKLCH restatement under `@supports`. Both are canonical; use hex when OKLCH support is uncertain.

| Token | Hex | OKLCH | Role |
| --- | --- | --- | --- |
| `--ink` | `#241c19` | `oklch(0.235 0.014 42)` | Primary dark background (walnut) |
| `--ink-2` | `#2e2623` | `oklch(0.276 0.013 42)` | Raised dark cards, marquee band |
| `--ink-3` | `#38302e` | `oklch(0.318 0.012 42)` | Dark hover surfaces |
| `--paper` | `#f3f0ec` | `oklch(0.957 0.006 80)` | Primary light background |
| `--paper-2` | `#f6f4f1` | `oklch(0.969 0.005 80)` | Light section variation |
| `--paper-3` | `#fbf9f6` | `oklch(0.983 0.004 80)` | App mock, bento cards |
| `--white` | `#ebe8e4` | `oklch(0.932 0.006 80)` | Primary text on dark; bone button fill |
| `--muted` | `#928c87` | `oklch(0.645 0.010 65)` | Secondary text on dark |
| `--muted-dark` | `#645d57` | `oklch(0.483 0.013 60)` | Secondary text on light |
| `--accent` | `#b06059` | `oklch(0.580 0.105 26)` | Ember: rules, icons, active states, signal |
| `--accent-strong` | `#934b44` | `oklch(0.500 0.098 27)` | Oxblood: hover/pressed fills, critical badges |
| `--accent-ink` | `#6a3632` | `oklch(0.400 0.075 26)` | Ember emphasis on light backgrounds |

**Semantic and product colors**

| Token | Hex | Role |
| --- | --- | --- |
| `--success` | `#a9c97a` | Online status, “all systems normal”, success accents |
| `--success-ink` | `#6c8d4e` | Success text on light |
| `--warning` / `--sand` | `#d6b890` | CHAT type, medium urgency, warm avatar |
| `--danger` | `#c46a6a` | Form errors, blockers |
| `--blue` | `#8ec8e8` | Avatar only |
| `--clay` | `#bf816a` | Avatar only |
| `--sage` | `#9caf8d` | DOC type, avatar |

### 3.2 App palette

The app is a separate, darker palette. Do not import landing CSS into the app or share token names blindly.

| Token | Hex | Role |
| --- | --- | --- |
| `--bg` | `#131211` | Page background, inputs |
| `--bg-raised-1` | `#1b1a19` | Sidebar, cards, drawers, auth card |
| `--bg-raised-2` | `#262423` | Hover/active, user block, bubbles, fact tiles |
| `--paper` | `#e8e6e3` | Primary text, primary button fill |
| `--muted` | `#8f8b88` | Secondary text |
| `--muted-dark` | `#9a948f` | Mono labels at small sizes |
| `--accent` | `#b06059` | Ember: focus, active bar, icons, accent chips |
| `--accent-strong` | `#934b44` | Hover fills, avatar, critical badge |
| `--on-accent` | `#ffffff` | Text on oxblood fills only |
| `--sand` | `#d6b890` | CHAT, medium urgency |
| `--sage` | `#9caf8d` | DOC |
| `--clay` | `#bf816a` | Avatar |
| `--success` | `#a9c97a` | Live status dot |

### 3.3 Hairlines and elevation

**Marketing**

| Use | Value |
| --- | --- |
| Dark hairline | `rgba(235, 232, 228, 0.15)` (strong `0.22`) |
| Light hairline | `rgba(36, 28, 25, 0.16)` |
| Card shadow | `0 14px 34px rgba(0, 0, 0, 0.28)` |
| App-window shadow | `0 35px 90px rgba(48, 34, 28, 0.16)` + inset `0 2px 0 rgba(255, 255, 255, 0.5)` |
| Bento hover | `0 25px 50px rgba(56, 41, 36, 0.1)` |
| Backdrop | `rgba(20, 15, 13, 0.62)` + `blur(3px)` |

**App**

| Use | Value |
| --- | --- |
| Hairline | `rgba(255, 255, 255, 0.07)` |
| Strong hairline | `rgba(255, 255, 255, 0.14)` |
| Active indicator | `inset 2px 0 0 #b06059` |
| Brand halo | `0 0 0 3px rgba(176, 96, 89, 0.16)` |
| Online dot glow | `0 0 8px rgba(169, 201, 122, 0.55)` |
| Offline dot glow | `0 0 8px rgba(176, 96, 89, 0.55)` |

The app uses **borders, not shadows**, to separate surfaces. Shadows belong to the marketing site and to genuinely floating layers (toasts, drawers).

### 3.4 Color rules

- **Budget:** roughly 70% neutral surfaces, 25% ink/bone text, 5% ember.
- **Never** use pure `#000` for backgrounds or pure `#fff` for large text areas. Warm bone and walnut are the brand.
- White (`#ffffff`) is reserved for text on oxblood and for selection text. Do not use it as a page surface.
- Ember is a **UI accent**, not long-form body text. It is fine for labels, strokes, icons, 1px rules, chips, and short emphasis.
- On oxblood (`#934b44`), use white text. On bone (`#e8e6e3` / `#ebe8e4`), use ink.
- Product colors are identifiers, not decoration: sand = CHAT, sage = DOC, ember = COMMIT, green = healthy/live, red = blocked/error.
- Never encode meaning with color alone. Pair every hue with a label, glyph, or icon.

**Verified contrast (WCAG):**

| Pair | Ratio | Use |
| --- | --- | --- |
| `#e8e6e3` on `#131211` | ≈ 15.0:1 | Primary app text |
| `#8f8b88` on `#131211` | ≈ 5.5:1 | Secondary app text |
| `#9a948f` on `#131211` | ≈ 6.2:1 | Mono labels |
| `#ebe8e4` on `#241c19` | ≈ 13.7:1 | Marketing text on dark |
| `#928c87` on `#241c19` | ≈ 5.0:1 | Marketing secondary text |
| `#645d57` on `#f3f0ec` | ≈ 5.7:1 | Marketing secondary text on light |
| `#6a3632` on `#f3f0ec` | ≈ 8.5:1 | Serif emphasis on light |
| `#b06059` on `#131211` | ≈ 4.2:1 | Accent labels/icons (not long body copy) |
| `#ffffff` on `#934b44` | ≈ 6.3:1 | Button/badge text on oxblood |

---

## 4. Typography

### 4.1 Families

| Role | Marketing (active `soft` variant) | App |
| --- | --- | --- |
| Display / editorial | **Sentient** 300/400 | — |
| UI sans | **Switzer** 400/500 | **Instrument Sans** 400/500/600 |
| Technical / labels | **Space Mono** 400 | **JetBrains Mono** 400/500 |

All faces are self-hosted WOFF2 in `frontend/public/landing/assets/fonts/` and `frontend/public/fonts/`. Fall back to Helvetica Neue / Arial and SFMono / Consolas; do not introduce a new typeface.

> **Known divergence:** the ported Access/Footer block re-declares `:root` late in the landing stylesheet and renders those sections in **Plus Jakarta Sans / IBM Plex Mono**. This is off-system. Do not propagate it to new sections; if you touch that block, scope it to `.access-panel, .site-footer`.

### 4.2 Marketing type scale

The page sets `data-variant="soft"` on `<html>`. The soft variant uses Sentient 300 with tighter tracking for headlines.

| Element | Family | Size | Weight | Line-height | Tracking |
| --- | --- | --- | --- | --- | --- |
| Hero title | Sentient | `clamp(62px, 8.15vw, 128px)` | 300 | `0.855` | `-0.018em` to `-0.03em` |
| Serif accent word | Sentient italic | same | 300 | inherit | `-0.022em` |
| Hero sub | Switzer | `clamp(15px, 1.22vw, 18px)` | 400 | `1.5` | `-0.012em` |
| Section title | Sentient | `clamp(48px, 5.5vw, 88px)` | 300 | `0.91` | `-0.025em` |
| Section title `em` | Sentient italic | same | 300 | inherit | `-0.02em` |
| Eyebrow / mono label | Space Mono | `9px` | 400 | — | `0.14em`, uppercase |
| Nav link | Switzer | `12px` | 400 | — | normal |
| Button | Switzer | `14px` | 500 | — | `-0.01em` |
| Body | Switzer | `16px` | 400 | `1.45` | normal |

### 4.3 App type scale

| Element | Family | Size | Weight | Notes |
| --- | --- | --- | --- | --- |
| Body | Instrument Sans | `14.5px` | 400 | `line-height: 1.55` |
| Signal headline | Instrument Sans | `clamp(24px, 3vw, 34px)` | 600 | `1.18`, `-0.018em`, max `720px` |
| Signal rationale | Instrument Sans | `13.5px` | 400 | muted, max `620px` |
| Section title | Instrument Sans | `15.5px` | 600 | `-0.01em` |
| Thread title | Instrument Sans | `14px` | 500 | truncate with ellipsis |
| Thread source | JetBrains Mono | `10px` | 400 | muted |
| Kicker | JetBrains Mono | `9.5px` | 500 | `0.18em`, uppercase |
| Side label | JetBrains Mono | `9px` | 500 | `0.16em`, uppercase |
| Chip | JetBrains Mono | `9.5px` | 400 | `0.1em` |
| Type / urgency badge | JetBrains Mono | `9px` | 500 | `0.12em` |
| Auth tagline | Instrument Sans | `clamp(26px, 2.6vw, 36px)` | 600 | `1.2`, `-0.018em`, max `340px` |
| Brand word | Instrument Sans | `14px` | 600 | `0.16em`; `APP` at 8.5px mono ember |

### 4.4 Type rules

- **Sentence case** for headlines, buttons, labels that read as sentences, and all prose.
- **Uppercase** only for mono eyebrow labels, chips, badges, and section markers.
- **One italic serif accent per headline**, maximum. It marks the emotional or conceptual hinge: *signal*, *what actually happened*, *yours*, *attention*.
- Keep display tracking negative (`-0.018em` to `-0.03em`) and body tracking neutral.
- Never justify text. Never center paragraphs longer than two lines.
- Use monospace for telemetry, counts, IDs, timestamps, scores, and tiny labels — not for paragraphs.
- Do not use emoji as icons or bullets.

---

## 5. Layout and spacing

### 5.1 Marketing page

- Page gutter: `--pad: clamp(22px, 3.7vw, 64px)`.
- Max content width: `1600px`.
- Header: fixed, `80px` tall (`70px` at ≤820px), transparent over dark, blurred walnut + hairline once scrolled.
- Sections alternate dark and light to pace the narrative:

| Section | ID | Treatment |
| --- | --- | --- |
| Hero | `#top` | Dark; two-column copy + live canvas instrument |
| Marquee | — | Raised dark band; mono 9px uppercase |
| The Shift | `#intelligence` | Dark; sticky scroll-driven chat collapse |
| Product | `#product` | Light paper; large app mock in a rounded window |
| Features | `#features` | Light; 12-column bento grid |
| Manifesto | `#manifesto` | Dark, slightly warmer; centered quote |
| Trust | `#trust` | Light; 3D orbital vault + numbered rows |
| Access | `#access` | Dark; armillary orb + invite form |
| Footer | — | Dark; 3D INSIGHT wordmark |

- Bento grid: 12 columns. Cards span `7 / 5` on the first row and `5 / 3 / 4` on the second. Gaps ≈ `12px`.
- Breakpoints: `1100px` compact, `820px` tablet, `540px` mobile.
- The page is intentionally tall and scroll-driven. Do not compress it into a generic SaaS stack.

### 5.2 App shell

| Region | Desktop | ≤900px |
| --- | --- | --- |
| `.app` | `grid-template-columns: 256px 1fr` | single column |
| `.sidebar` | sticky, `100vh`, `28px 20px`, gap `28px`, right hairline | static top block, auto height, bottom hairline |
| `.main` | `36px 40px 60px`, gap `28px` | `24px 20px 52px`, gap `26px` |
| `.auth` | `minmax(320px, 44%) 1fr` | stacked: aside above card |
| `.drawer` | `min(430px, 92vw)` | same |

- App spacing uses a `4px` scale: `--space-1` through `--space-13` (`4px` → `52px`).
- Card padding is `12–16px`; component gaps are `8–16px`.
- The app is dense by design. Prefer a tighter scale over airy marketing spacing.

### 5.3 Radii

| Context | Radius |
| --- | --- |
| Marketing buttons (soft) | `10px` |
| Marketing cards / app window / bento | `14–16px` |
| Pills, chips, avatars, app buttons | `999px` |
| App cards / inputs / nav items | `8px` |
| App auth card / signal hero / drawer | `12px` |
| Type badge | `4px` |
| App brand mark | `4px` |

Do not exceed `16px` except for fully rounded pills and circles.

### 5.4 Signature layout motifs

- Hairline rules with an **ember center gradient** at the top of panels.
- Tiny mono telemetry rows: `SYS / INSIGHT-01`, `NODE / 014`, `38° FOV`, `09:41 PST`.
- Circular avatars with two-letter initials.
- Numbered section markers: `01 / THE SHIFT`, `02 / THE PRODUCT`.
- Thin vertical timelines with ember-ringed dots.
- Generous negative space on marketing; compact 8px rhythm in the app.

---

## 6. Components

### 6.1 Buttons

**Marketing**

| Variant | Spec | Hover |
| --- | --- | --- |
| Primary | Bone fill, ink text, height `54px`, radius `10px`, padding `0 10px 0 22px`, 14px/500, circular arrow chip | Oxblood fill, white text, `translateY(-2px)` |
| Small header CTA | Height `38px`, padding `0 15px`, 11px/500, radius `10px` | Oxblood fill, white text |
| Light (mobile menu) | Bone fill, ink text, full width, radius `10px` | Oxblood |
| Text link | 12px bone, optional 28px circular play icon | Brighter bone; icon border accents |

**App**

| Variant | Spec | Hover / disabled |
| --- | --- | --- |
| Primary | Bone fill, ink text, pill radius, padding `8px 16px`, 12.5px/500 | Oxblood fill + `--on-accent`; disabled `opacity .45`, wait cursor |
| Ghost | Transparent, `1px` strong hairline, bone text | Ember border and text |
| Small | `8px 12px`, 11.5px | Same as parent |
| Link ghost | Ghost styling, centered text | Ember border/text |

The marketing button lifts; the app button does **not** lift. Keep that distinction.

### 6.2 Chips and badges

- **Chip:** pill, `1px` strong hairline, JetBrains Mono `9.5px`, `0.1em`, padding `4px 12px`, muted text.
- **Accent chip:** border `rgba(176,96,89,.55)`, text ember — used for signal score.
- **Type badge:** `4px` radius, `9px` mono / 500, `0.12em`, padding `4px 8px`.
  - `CHAT ◆` — sand, border `rgba(214,184,144,.32)`
  - `DOC ◇` — sage, border `rgba(156,175,141,.32)`
  - `COMMIT ⬡` — ember, border `rgba(176,96,89,.45)`
- **Urgency pill:** pill, `9px` mono, padding `4px 8px`.
  - `LOW` — muted outline
  - `MEDIUM` — sand outline
  - `HIGH` — ember outline
  - `CRITICAL` — white on oxblood fill

### 6.3 Cards and panels

**Signal hero**

- `--bg-raised-1`, `1px` hairline, radius `12px`, padding `28px 32px`, ember top rule.
- Kicker with a `26×1px` ember stroke.
- Headline `clamp(24px, 3vw, 34px)` / 600, max `720px`.
- Rationale muted, max `620px`.
- Chips row: type, score, threads read.
- Ghost `Rescan` at top-right; disabled and relabeled `Scanning…` while running.
- Empty state: “No signal yet — add your first thread.”
- Loading state: muted, medium-weight “Reading your threads…”.

**Thread card**

- Grid: `92px 1fr auto auto auto`, gap `16px`, padding `16px`, radius `8px`, raised-1 background, hairline.
- Hover: raised-2 background, ember border at `42%`.
- Selected: raised-2, ember border at `80%`, `inset 2px 0 0` ember.
- Mobile: `70px 1fr auto`; hide urgency, time, delete.
- The whole card is a button; the delete affordance is visually a 24px circular control.

**Bento card (marketing)**

- Radius `14–16px`, padding generous, 1px dark hairline on light sections.
- Hover: lift `2–4px` plus soft shadow.
- One dark card per grid for rhythm; one cream card for warmth.
- Each card pairs a short claim with a functional visual (speed ring, receipt, checklist, bar chart, search result).

### 6.4 Forms and inputs

- **App field label:** JetBrains Mono `9px` / 500, `0.14em`, uppercase, `--muted-dark`.
- **App input:** `--bg`, `1px` strong hairline, radius `8px`, padding `8px 12px`, `13px`; focus border ember.
- **Auth input:** same, radius `8px`; 13px.
- **Search/composer body:** pill radius, `8px 16px`, 12.5px.
- **Marketing access input:** transparent input inside a `999px` pill, bone submit button.
- Always keep labels visible. Do not use placeholder text as the only label.
- Error text sits in an ember-tinted box: background `rgba(147,75,68,.14)`, border `rgba(176,96,89,.45)`, radius `8px`, 12px.

### 6.5 Drawers

- Right-side slide-over, width `min(430px, 92vw)`, full height.
- Panel: raised-1, left strong hairline, padding `28px 28px 36px`.
- Backdrop: `rgba(20,15,13,.62)` + `blur(3px)`.
- Entry: backdrop fades `200ms`; panel slides from `+40px` in `250ms`.
- Close: 30px circle, strong hairline, muted ×; hover to ember.
- Detail drawer contents: type badge, title 20px/600, summary, 2-column fact grid, message trail, composer.
- New-thread drawer contents: kicker, Type / Title / Source / Summary / Urgency, type-conditional numeric fields, Cancel + Add.

### 6.6 Small elements

| Element | Spec |
| --- | --- |
| Avatar | 28px circle, product color or oxblood, white initial, 12px/500 |
| Status dot | 7px circle; success green + glow when live, ember when offline |
| Fact tile | Raised-2, radius 8px, padding 12px; label mono 8.5px uppercase, value 12.5px/500 |
| Message trail dot | 8px, raised-2 fill, 2px ember ring; last dot filled ember |
| Toast | Fixed bottom-center pill, 12.5px; bone = success, oxblood = error; auto-dismiss 3.2s |
| Scrollbar | 10px; thumb raised-2 with 2px background border |

### 6.7 Interaction states

Every interactive component must define:

- **Hover** — color/border change; lift only on marketing.
- **Focus-visible** — `2px` ember outline, offset `3px` in the app / `4px` on marketing.
- **Active/selected** — raised surface plus ember inset bar or border.
- **Disabled** — reduced opacity, no hover change, wait cursor for async actions.
- **Loading** — replace label with a present-participle (“Scanning…”, “Working…”, “Adding…”) and disable repeat submission.
- **Error** — inline message near the action; never a silent failure.
- **Empty** — a short explanation plus one primary next step.

---

## 7. Motion

### 7.1 Tokens

| Token | Marketing (`soft`) | App |
| --- | --- | --- |
| Fast | `200ms` | `160ms` |
| Base | `350ms` | `260ms` |
| Slow | `700ms` | — |
| Default ease | `cubic-bezier(.2, .72, .2, 1)` | `cubic-bezier(.22, .61, .36, 1)` |
| Out ease | `cubic-bezier(.16, 1, .3, 1)` | — |
| Soft out | `cubic-bezier(.22, .61, .36, 1)` | — |

### 7.2 Signature behaviours

**Marketing**

- Loader holds `760ms`, then slides up; hero elements stagger in ≈ `85ms` apart.
- Scroll-driven Shift: “Too much context.” crossfades to “One clear signal.” as five chat cards fan out and collapse into an AI synthesis card.
- Cards lift `2–4px` with a soft shadow; primary buttons lift `2px` and fill oxblood.
- 3D armillary rings rotate continuously (periods ≈ 90/75/105s); ember wave ripples; footer letters lift near the cursor.
- Access form: typewriter placeholder, magnetic submit (±6px, fine pointer only), error shake `300ms`, drawn success check.
- Scroll reveals: `.fade-up` rises with a `65ms` stagger.

**App**

- Drawer backdrop `200ms`; panel `250ms` from the right.
- Toast rises `10px` + fades in `250ms`.
- Hover/focus transitions use `160ms`.
- No scroll choreography, no ambient motion, no perpetual animation in the dashboard.

### 7.3 Motion rules

- Motion must explain state or spatial relationship. If it only decorates, remove it.
- No bounce, elastic, overshoot, neon pulses, or parallax on text.
- Pause canvas/3D work when off-screen or when the tab is hidden.
- **Reduced motion is mandatory.** The app collapses animations to `0.01ms`; landing JS checks `prefers-reduced-motion` and renders static frames. New animation must do the same.
- Aim for 60fps; transform and opacity only. Do not animate layout properties.

---

## 8. Iconography and imagery

- **No photography and no stock illustration.** The visual language is typographic, geometric, and generative.
- **Icons:** inline SVG line icons, 16px, `1.2–1.6px` stroke, `currentColor`. Use arrows (`→`, `↗`, `↑`), play, sparkle (`✦`), check, chevrons, search (`⌕`), command (`⌘K`), close, plus, traffic dots.
- **Generative motifs:** armillary / gyroscope rings, vernier tick rings, orbital dots, geodesic icosahedron, topographic wave lines, crosshairs, coordinate readouts, film grain.
- **Film grain:** fixed full-screen SVG turbulence at `opacity .035`, `mix-blend-mode: soft-light`.
- **3D:** Three.js on the marketing page only (trust vault, access orb, footer wordmark). Always pair a 3D scene with a static SVG fallback and reduced-motion behavior.
- Do not use emoji as product iconography. The `✦` glyph is acceptable as a typographic accent.

---

## 9. Content and voice

### 9.1 Voice

**Precise, calm, editorial.** Short declarative sentences. Technical confidence without hype. The product is a quiet instrument, not a chatbot mascot.

| Do | Don’t |
| --- | --- |
| “Three decisions. One blocker.” | “Unlock supercharged AI collaboration!” |
| “Answers with receipts.” | “Revolutionize your workflow.” |
| “Decisions, not diaries.” | “10x your team’s productivity.” |
| “Quiet by default.” | “Never miss a thing again 🔥” |
| “Every thread. One clear signal.” | “All your work, magically organized.” |

### 9.2 Naming

- **thread** — a chat, doc, or commit item. Capitalize as `CHAT` / `DOC` / `COMMIT` only in badges.
- **signal** — the computed daily insight. Lowercase in prose; uppercase in labels (`SIGNAL`).
- **workspace** — the product container.
- **brief** — the synthesized summary.
- **trail** — the messages leading to a thread’s conclusion.
- **scan** — the parallel analysis run.

### 9.3 Microcopy

| Context | Copy |
| --- | --- |
| Auth tagline | “Every thread. One clear signal.” |
| Auth bullets | “All your threads — chat, docs, commits — in one workspace.” / “A parallel scanner distills today’s loudest signal.” / “Message trails keep the full story behind every thread.” |
| Signal loading | “Reading your threads…” |
| Signal empty | “No signal yet — add your first thread.” |
| Threads loading | “Loading threads…” |
| Threads empty | “No threads here yet.” + “+ Add your first” |
| Offline banner | “Backend offline — start the Spring Boot server (port 8080) to load live data.” |
| Scan success | “Scan complete — 6/6 threads in 412 ms across 4 workers” |
| Scan running | “Scanning…” |
| Create success | `Thread "<title>" added` |
| Delete success | “Thread removed” |
| Destructive confirm | Prefer an explicit confirmation for irreversible deletes; do not rely on undo alone. |

### 9.4 Formatting

- Use sentence case and the serial comma.
- Use an em dash with spaces (`—`) for parenthetical breaks; use a single ellipsis character (`…`).
- Use relative times in compact UI (`2m ago`, `1h ago`) and absolute times in detail views.
- Format counts with thousands separators; keep scores to two decimals (`9.92`); durations in `ms`.
- Avoid exclamation marks in product UI. Emphasis comes from layout and type, not punctuation.
- Error messages should say what happened and what to do next.

---

## 10. Accessibility

### Requirements

- **Focus:** every interactive element has a visible `2px` ember focus ring. Do not remove outlines.
- **Keyboard:** all actions reachable by Tab; card actions respond to Enter/Space; drawers closable by keyboard.
- **Semantics:** one `<h1>` per screen; forms use real `<label>` elements; icon-only buttons have `aria-label`.
- **Contrast:** body text meets 4.5:1; large text and UI strokes meet 3:1. Use the verified pairs in §3.4.
- **Not color alone:** urgency and type always include text or a glyph.
- **Reduced motion:** honor `prefers-reduced-motion` in CSS and JS.
- **Zoom:** usable at 200% zoom and at 320px viewport width.
- **Targets:** marketing CTAs are at least 38px tall; app controls are compact, so give small icon controls a 44px hit area where practical.

### Known gaps to fix

These are documented issues, not intended patterns:

1. Drawers do not move focus inside, trap focus, or close on `Escape`.
2. The thread delete control is nested inside the card button, creating nested interactive controls.
3. The landing access/footer block uses off-system fonts and re-declares `:root` globally.
4. The landing loads fonts twice (self-hosted + Google Fonts).
5. The landing variant system exposes `technical` / `bold` but the page is hard-coded to `soft`, so those variants are unreachable.

Do not replicate these patterns in new work.

---

## 11. Implementation rules

### Token ownership

| Area | File | Notes |
| --- | --- | --- |
| Marketing tokens | `frontend/public/landing/assets/css/styles.css` (`:root`, OKLCH block, variants) | Hex + OKLCH are both canonical |
| App tokens | `frontend/src/styles.css` (`:root`) | Hex only; separate darker palette |
| App behavior | `frontend/src/App.jsx`, `frontend/src/components/*.jsx` | 20s polling; bearer token auth |
| App API | `frontend/src/api.js` | `/api` proxy to `:8080` |
| Formatting helpers | `frontend/src/format.js` | Type metadata, urgency classes, relative time |

### Rules

1. **Use tokens.** No hard-coded hex, font stacks, durations, or radii outside the token block. If a value repeats three times, tokenize it.
2. **Keep the two palettes separate.** Do not import landing CSS into the app or reuse marketing `--paper` values in the app.
3. **Keep `data-variant="soft"`.** The soft variant is the shipped personality: Sentient / Switzer / Space Mono, `10px` controls, slower motion. Do not add a fourth variant without a product decision.
4. **Extend the existing naming.** Components use block/element BEM-ish classes (`.thread-card`, `.thread-card__title`, `.is-active`, `.is-selected`).
5. **Prefer borders to shadows in the app.** Reserve shadows for floating layers.
6. **Design all states.** Hover, focus, active, disabled, loading, empty, error, offline.
7. **Respect reduced motion.** Any new JS animation must check `prefers-reduced-motion` and pause off-screen.
8. **No new fonts, icon sets, or color families.** Use the self-hosted files and inline SVG.
9. **Do not design against `video/`.** That folder is a demo render, not a UI source.

### New-screen checklist

- [ ] Uses only tokens from this document.
- [ ] One clear focal point and one ember accent at most.
- [ ] Type roles match the marketing or app scale — no invented sizes.
- [ ] All states implemented: loading, empty, error, offline, disabled.
- [ ] Keyboard reachable; visible focus; labels present.
- [ ] Works at 320px, 768px, 1440px, and 200% zoom.
- [ ] Reduced-motion path verified.
- [ ] Copy follows §9 voice and formatting.
- [ ] No hard-coded magic values.

---

## 12. File map

| Purpose | Path |
| --- | --- |
| This document | `DESIGN.md` |
| Rendered visual spec / measurements | `docs/UI_VISUAL_GUIDE.md` |
| Landing markup | `frontend/public/landing/index.html` |
| Landing styles, tokens, variants | `frontend/public/landing/assets/css/styles.css` |
| Landing interactions | `frontend/public/landing/assets/js/main.js`, `access-cta.js` |
| Landing 3D scenes | `frontend/public/landing/assets/js/trust-3d.js`, `access-footer-3d.js` |
| App styles and tokens | `frontend/src/styles.css` |
| App components | `frontend/src/components/` |
| App shell and state | `frontend/src/App.jsx` |
| App API layer | `frontend/src/api.js` |
| App formatting | `frontend/src/format.js` |

---

## 13. Open design decisions

Tracked here so the system stays honest:

1. Consolidate the duplicated landing Access/Footer `:root` block and remove the off-system fonts.
2. Choose one font-delivery path for the landing page (self-hosted or Google Fonts, not both).
3. Add focus management and `Escape` handling to both drawers.
4. Replace the nested delete control with a sibling button and a confirmation step.
5. Decide whether the landing personality switcher is a real feature or remove the unreachable variants.
6. Add automated visual regression coverage for the app’s signal, thread, drawer, and auth states.

---

*Last reviewed against the codebase: 2026-11-24. The demo video in `video/` is intentionally out of scope.*
