# Job Search HQ — Handoff for Claude Code

Oct 23, 2026 · @Iryna

## Scope and principles

This handoff lets Claude Code build Job Search HQ v2 on top of iz-design-system: a `linen` theme, nine pattern components, five motion moments and a prioritised feature backlog. Visual decisions are final on the canvas [Job Search HQ — Visual Directions](https://claude.ai/artifact/YC3SdZBk8qw8quzwiBozKF), rows E–G.

**Product goal.** Help job seekers managing multiple applications reach an offer that matches their priorities by making their priorities, next steps and search results clear. Every feature should help users take a useful action with less effort.

**MVP goal.** Test whether users can prioritise and follow through on their job search more effectively than with their current method, and whether the value justifies the effort of keeping the tracker updated. Measured by: (1) share of actions completed by their due date; (2) share of applications with a next step set; (3) minutes per week spent updating vs a weekly 1–5 value rating. Baseline: one week on the user's current method before switching. Test group: 5–8 job seekers other than the author.

**Commercial hypothesis.** Job seekers get enough value during an active search to pay for a 90-day pass. Tested with a priced fake-door on the landing page (clicks on "Start 90-day pass", no payment taken). Continued-access subscription is deferred: search is episodic.

**Two signals, kept separate.** Fit = how well the résumé meets the role's requirements (can I get it). Priorities = how well the role meets the user's stated conditions (do I want it). They are never merged into one score.

**Value proposition.** Know which jobs are worth your time — before you spend it.

**Core job of the product.** The decision at the door: should this role get 2–3 hours of a limited week? Fit (can I get it) × Priorities (do I want it) answers it on one card; tracking and systematising exist to make that decision possible and to check later whether it was right. Consequences: Leads triage is the primary screen and the first thing seen after sign-in; the card's actions are Apply / Stretch / Skip with an estimated cost in hours; the weekly goal counts quality applications (fit ≥ 70, or a deliberate Stretch), never raw volume; a stretch quota of about 1 in 5 keeps the search from over-fitting to the most contested roles; the Insight "Fit → result" tests the thesis that higher fit converts better.

**Five rules that hold everywhere**

1. One accent per screen: ultramarine means "act here". Oxblood appears only in the `iz/design` mark.
2. Quiet mechanics only: no points, levels or badges. Streaks count weeks, experiments report numbers the app computed.
3. WCAG 2.2 AA floor: text ≥ 4.5:1, UI ≥ 3:1, focus ≥ 3:1, targets ≥ 44 px, nothing mouse-only, every motion has a reduced-motion path.
4. Tokens, never raw values: a hex or px in app code fails the build.
5. Keyboard first: J/K move, D done, S snooze, N new, F focus, ⌘K palette; triage S/L/X.

**Stack (already decided).** One package with `agent/`, React Aria Components for everything interactive, four themes (light, dark, hc-light, hc-dark), `--iz-` token prefix, explanations in Ukrainian, code and docs in English.

## Design system architecture

Reusable is proven two ways: vertically (one token change updates both products) and horizontally (one Button, two themes, zero component code changed). Core and themes already exist as decisions; patterns and the second consumer are what this build adds.

&#91;embedded content: iz-design-system · 4 layers, 2 consumers\]

Arrows show imports: products import patterns and primitives; patterns import only primitives and tokens; themes override token values; nothing imports upward.

**Package layout**

```
iz-design-system/
  src/tokens/base.json5            palette, type scale, space, radius, motion
  src/tokens/semantic.json5        roles: bg, fg, text, border, status, focus
  src/tokens/themes/linen.json5    override: only what differs from default
  src/tokens/themes/linen.dark.json5
  src/primitives/*                 React Aria Components, one folder per component
  src/patterns/jobsearch/*         composed from primitives; own spec per component
  specs/<Component>.md             anatomy · props · states · keyboard · a11y · do/don't
  agent/llms.txt  agent/mcp/       list_components, get_spec, list_tokens, get_token
  scripts/build-tokens.ts          Style Dictionary → CSS vars, TS types, Figma JSON
  scripts/check-contrast.ts        every bg/fg pair, every theme; < 4.5:1 fails CI
```

**Naming scheme** (Atlassian structure, Polaris numbering): `--iz-{category}-{role}-{emphasis}-{state}`. Every background role has a matching foreground: `--iz-color-bg-accent` pairs with `--iz-color-fg-on-accent` (Material's on-pair rule). States are suffixes with fixed steps: `-hover` half a step, `-active` two steps, `-selected` one step (Carbon). Scales use ×100 numbers that read as size: `--iz-space-400` = 16 px.

**Theme model** (Primer): `default.json5` is complete; every other theme is an override file holding only changed tokens and registered in `themes.config.ts`. Switching theme is one attribute: `<html data-iz-theme="linen">`.

**Guards taken from the five systems**

| Guard | From | Rule |
| --- | --- | --- |
| ESLint `iz/no-raw-colors`, `iz/no-raw-spacing` | Atlassian | hex or px literal in app or pattern code = build error |
| Contrast test in CI | Carbon, Primer | all pairs, all themes, every PR |
| One spec per component | Carbon, Atlassian | the `.md` is the single source for docs site and agent |
| `agent/` with llms.txt + MCP | Atlassian, Serendie | agents read specs and tokens, never guess |
| Semver + changelog + codemod | Atlassian, Primer | a renamed token ships with its codemod |
| Reduced-motion variant on every motion token | Material | `--iz-motion-*` has a `prefers-reduced-motion` value |

**Scope v1.0 (canvas row F, “Scope v1.0”).** 32 components in 8 families, each used by apps/demo (D), Job Search HQ (H) or both; nothing enters the system without a consumer. Every component ships with spec, stories in 4 themes, axe test and a Figma variant.

| Family | Components (v0.1 in bold) | Used by |
| --- | --- | --- |
| Actions | **Button**, IconButton, Link, Menu | DH |
| Inputs | **TextField**, TextArea, **Checkbox**, Radio group, Switch, Select, Combobox, DateField | DH |
| Display | **Card**, Chip/Tag, Badge, Avatar, Table, List | DH |
| Feedback | Toast, Banner, Progress/Meter, Skeleton, EmptyState (pattern) | DH |
| Overlays | **Modal/Dialog**, Popover, Tooltip, Drawer/Sheet | DH |
| Navigation | Tabs, Breadcrumb, Pagination, TopNav/BottomNav, CommandPalette (pattern) | DH |
| Layout | Stack/Grid, Divider, **VisuallyHidden**, Container | DH |
| Patterns · jobsearch | ActionRow, StageChip, FitScore, WeeklyGoal, TriageCard, ExperimentCard, StreakBar, ApplicationCard | H (FitScore also D) |

**Eight system areas that make it a system, not a kit** — each with the proof it produces for the case study:

| Area | Deliverable | Proof | Phase |
| --- | --- | --- | --- |
| Foundations | 3-tier tokens with on-pairs, type, space ×100, radius, elevation, motion (incl. reduced), breakpoints, z-index; Style Dictionary → CSS/TS/Figma | one token change updates both products, two themes | 1 |
| Icons | 24 icons on 16/20 grid, stroke 1.5, action-based names, aria rules, sprite + React wrapper | icon page + lint against inline SVG outside the set | 2 |
| Figma parity | library with Variables generated from tokens.json, 1:1 components, Code Connect, 4 theme modes | same Button in Figma and Storybook; one Variable change → both | 2 |
| Tests | axe per story in 4 themes, Playwright keyboard walkthroughs, visual regression, contrast in CI, reduced-motion story | CI badges; a PR that failed on contrast | 2 |
| Docs + agent | Storybook docs (spec, props, do/don’t, a11y), llms.txt + MCP, playground | video: Claude Code builds a screen through MCP | 2 |
| Content | voice & tone, templates for errors, empty states, confirmations, toasts; number/date rules; i18n-ready strings | Content page + five microcopies verified on screens | 3 |
| Governance | CONTRIBUTING (RFC → spec → build → review), deprecation policy (2 minors), changelog, semver, codemods | one real RFC (DateField) with trade-offs | 3 |
| Adoption | script: % token-based styles, % UI from system components, list of escapes, per product | one number for the case (“97% tokens in two products”) | 3 |
| Dataviz | 6 categorical + 2 sequential scales checked in 4 themes; text beside every bar | What’s working and Fit → result on these tokens | 3 |

Build order follows the consumers: Phase 1 foundations, Phase 2 the components Today needs, Phase 3 the rest as Leads, ApplicationCard and the demo app ask for them. Governance, content and adoption are written while the components are built, not after.

## Linen theme tokens

All text pairs pass 4.5:1 and all UI pairs pass 3:1 in both modes (checked by script on 2026-10-23). Ratios are against `bg-page` unless noted. Oxblood (`brand`) is used only in the `iz/design` mark.

**Colour · semantic roles**

| Token | Light | ratio | Dark | ratio | Use |
| --- | --- | --- | --- | --- | --- |
| `--iz-color-bg-page` | #F7F5F0 | — | #141519 | — | page background |
| `--iz-color-bg-surface` | #FFFFFF | — | #1C1D23 | — | cards, panels, header |
| `--iz-color-bg-surface-raised` | #FFFFFF + border | — | #22242B | — | popovers, palette, toast body |
| `--iz-color-bg-sunken` | #F0EDE6 | — | #0F1013 | — | meter tracks, segmented control well |
| `--iz-color-bg-accent` | #2B3FBF | 7.5 | #8FA0FF | 7.5 | primary button, fit ≥ 85, lit tally |
| `--iz-color-bg-accent-hover` | #233399 | — | #A3B1FF | — |  |
| `--iz-color-bg-accent-active` | #1C2A7A | — | #B8C3FF | — |  |
| `--iz-color-bg-accent-subtle` | #E0E4F9 | — | #1F2445 | — | active nav, stage Interview, tint |
| `--iz-color-fg-on-accent` | #FFFFFF | 8.2 on accent | #141519 | 7.5 on accent |  |
| `--iz-color-text` | #1D1E24 | 15.3 | #EDECE8 | 15.4 |  |
| `--iz-color-text-subtle` | #5E6068 | 5.8 | #A5A6AC | 7.5 | meta, labels, hints |
| `--iz-color-text-accent` | #2B3FBF | 7.5 | #8FA0FF | 7.5 | links, fit on tint |
| `--iz-color-border` | #E4E0D8 | — | #2D2E36 | — | 1 px rules, card edges |
| `--iz-color-border-strong` | #8A8578 | 3.4 | #6E717E | 3.8 | checkbox ring, inputs |
| `--iz-color-border-focus` | #2B3FBF | 7.5 | #8FA0FF | 7.5 | 2 px outline, 2 px offset |
| `--iz-color-status-critical` | #B42318 | 6.0 | #F08B8B | 7.6 | overdue, delete |
| `--iz-color-status-success` | #1F7A4D | 4.9 | #6FCF97 | 9.6 | experiment KEPT |
| `--iz-color-status-warning` | #8A5C00 | 5.3 | #E3B341 | 9.4 | goal at risk |
| `--iz-color-brand` | #8A1C3B | 8.3 | #F08BA6 | 7.8 | `iz/design` mark only |

**Type** · Space Grotesk (UI), IBM Plex Mono (labels, counts, shortcuts), Archivo wdth 112 wght 700 (display and figures, tabular-nums).

| Token | Size / line | Face |
| --- | --- | --- |
| `--iz-font-display` | 56 / 56, −2% | Archivo 112 / 700 |
| `--iz-font-figure-lg` | 40 / 40 tnum | Archivo 112 / 700 |
| `--iz-font-figure` | 22 / 24 tnum | Archivo 112 / 700 |
| `--iz-font-heading` | 18 / 24 | Space Grotesk 600 |
| `--iz-font-title` | 15 / 20 | Space Grotesk 600 |
| `--iz-font-body` | 15 / 22 | Space Grotesk 400 |
| `--iz-font-meta` | 13 / 18 | Space Grotesk 400 |
| `--iz-font-label` | 11 / 16, +8%, caps | IBM Plex Mono 500 |
| `--iz-font-code` | 12 / 16 | IBM Plex Mono 400 |

**Space** · 4 px base, ×100 names: `100`=4, `200`=8, `300`=12, `400`=16, `500`=20, `600`=24, `800`=32, `1000`=40. Page gutter 40 desktop / 16 phone; card padding 600 / 400; section gap 600.

**Radius** · `--iz-radius-100`=4 (kbd, mini chips), `200`=6 (nav items, small buttons), `300`=8 (buttons, inputs), `400`=12 (cards), `500`=14 (triage card), `full`=999 (chips, fit circle).

**Elevation** · none on cards (1 px border on the surface does the work). Only popovers and the toast carry `--iz-shadow-overlay`: `0 8px 24px rgb(0 0 0 / 0.18)`; in dark mode the overlay is `bg-surface-raised` and the shadow is dropped.

**Motion** · `--iz-motion-duration-100`=120 ms (hover, chip), `200`=200 (fade, translate), `300`=320 (row collapse), `500`=700 (goal met); `--iz-motion-ease-out`=cubic-bezier(.2,.8,.2,1), `--iz-motion-ease-in-out`=cubic-bezier(.65,0,.35,1); `--iz-motion-spring-settle`: stiffness 260, damping 18, mass 1. Under `prefers-reduced-motion` every duration resolves to 120 ms and springs to a crossfade.

## Pattern component specs

Nine patterns, all composed from core primitives (Button, Chip, Card, Toast, TextField, Dialog). Each ships with `specs/<Name>.md` in the same shape: anatomy, props, states, keyboard, a11y, do/don't. Sizes below are desktop; the phone variant is noted where it differs.

**Core primitives used (already specified in iz-ds)**

| Primitive | Variants in this product | Size | Notes |
| --- | --- | --- | --- |
| Button | primary (bg-accent / fg-on-accent), secondary (border + text), ghost (text-subtle), danger | 40 px desktop, 44 px phone; radius 300 | kbd hint as trailing `<kbd>` slot, 11 px mono, 70% opacity |
| Chip | filter (pressable, `aria-pressed`), stage (static or cycling), property (static) | 28 px, radius full, 12 px text, padding 200 | selected = bg text / fg page; never colour-only: selected also bold |
| Card | surface, raised | padding 600 desktop / 400 phone, radius 400, 1 px border | no shadow |
| Toast | status, action (Undo) | bottom-centre, 6 s, `role="status"` | one at a time; new replaces old |

**ActionRow** — one next action in the Today list.

- Anatomy: 44 px done target (24 px ring inside) · title (font-title) · meta row of chips: company (property), stage (StageChip), time text (font-meta, text-subtle) · due label (font-label, right) · Snooze split button · Open (icon, `aria-label`).
- Props: `action`, `group: 'overdue' | 'today' | 'week'`, `onDone`, `onSnooze(preset)`, `onOpen`, `focused`.
- States: default · hover (bg-sunken at 40%) · focused (row outline 2 px border-focus, inset) · done (ring fills accent, title strikes, collapses after 320 ms) · overdue (due label and ring in status-critical).
- Keyboard: J/K move focus between rows, D done, S opens snooze menu, Enter/O open, Esc closes menu. Done ring is a real `<button aria-label="Mark done: {title}">`.
- A11y: group headings are `<h3>` with count in text; live region announces "Done. 3 due today." after done.

**StageChip** — the one chip used in list, card, filter and pipeline.

- Stages: Lead · Applied · Screen · Interview · Offer. Rejected and Withdrawn are terminal states set from the menu, not in the cycle.
- Colour: all stages use border + text-subtle; Interview alone uses bg-accent-subtle + text-accent; Offer uses bg-accent + fg-on-accent. Same mapping everywhere.
- Cycling variant: `<button aria-label="Stage: Screen. Press to advance">`; click or Shift+→ next, Shift+← back; 240 ms Y-flip; confirm nothing, Undo toast instead.

**FitScore** — 0–100 fit from the agent.

- Shape: circle 44 px (list) / 56 px (triage) with figure inside; `role="img" aria-label="Fit {n} of 100"`.
- Thresholds: ≥ 85 bg-accent / fg-on-accent; 70–84 bg-accent-subtle / text-accent; < 70 border + text-subtle. Thresholds are tokens (`--iz-fit-high`, `--iz-fit-mid`) so an experiment can move them.
- Always paired with a "Why {n}" list of 3–4 reasons (tick = match, dash = gap); never a bare number.
- Priorities row beside it (not inside the circle): "Priorities 3 of 4" in font-label plus one chip per priority, tick = met, dash = unmet, chips in text-subtle, met chips in text-accent. Prop `priorities: {label, met}[]`. Fit and Priorities are never combined into one number.

**WeeklyGoal** — the gauge.

- Anatomy: label (font-label) · figure `4 / 5` (font-figure-lg, tnum) · 5 bars 14×36 px, gap 100, radius 100, lit = bg-accent, unlit = border · footer text ("1 more by Sunday · last week 5/5").
- Props: `done`, `target`, `streakWeeks`, `history: boolean[8]`, `onAdjustTarget`.
- States: in progress · met (fifth bar springs up, figure rolls, footer "Goal met · 7-week streak") · at risk (Saturday with ≥ 2 to go: footer in status-warning) · adjust prompt (after two missed weeks: inline "Set 4 / week" / "Keep 5").
- A11y: whole widget `role="img"` with full sentence; the adjust prompt is a `role="group"` with two real buttons.
- Unit is a quality application: fit ≥ 70, or marked Stretch. A second small line shows the stretch quota: "Stretch 1 of 1 used" (one per five target). Low-fit applications that are not marked Stretch are stored but do not count, and the footer says so once: "Logged, not counted — fit 58".

**TriageCard** — one lead at a time on phone (and in the Leads inbox on desktop).

- Anatomy: source + age (font-label) · role title (font-heading, 21 px phone) · company + location · FitScore 56 · property chips row · "Why {n}" list · action bar Pass / Later / Save (52 px, 1fr 1fr 1.5fr).
- Gestures and keys: swipe right = Save, left = Pass, long-press = Later; S / L / X; J/K to peek the queue. Swipes always have a button equivalent.
- States: default · saving (print-pass motion, 600 ms) · passed (slides left 200 ms) · undo window 6 s (toast).
- Progress: 12-segment bar + "3 of 12 triaged" text; `role="img"`.
- Decision actions (replaces Pass / Later / Save): **Apply** (A, primary) saves to pipeline at stage Applied-intent and creates the first action; **Stretch** (T) does the same but tags the application as stretch and counts against the 1-in-5 quota, with an inline note when the quota is used; **Skip** (X) archives with a one-tap reason (fit, priorities, closed, other); **Later** (L) stays as a secondary text button. Cost line under the title: "\~2.5 h · tailored résumé + cover letter", computed from what the role asks for (portfolio, cover letter, task) with defaults the user can edit.
- Summary header: "9 new · 3 worth your time" where "worth your time" = fit ≥ 70 and Priorities ≥ half met; it is the first sentence a user reads after sign-in.

**ExperimentCard** — hypothesis → metric → verdict.

- Fields: title (the change, imperative), metric (one of: reply rate on follow-ups, applied→screen rate by role type, screen→interview rate, leads saved per week), window (14 days default), n threshold (15 default), before / after values computed by the app, verdict RUNNING · KEPT · DROPPED.
- Before/after bars share one scale (max of both); after bar uses text-accent while running, status-success when kept, text-subtle when dropped.
- Verdict is proposed by the app when n ≥ threshold and the window closes; the user confirms. Confirmed verdicts are immutable; a new idea is a new card.
- Empty state: "No experiments yet. Try: follow up on day 5 instead of day 10."

**StreakBar** — last 8 weeks.

- 8 cells 22 px high, radius 100, with the week's count inside (font-code 10 px); hit = bg-accent / fg-on-accent, miss = bg-sunken / text-subtle, current week = surface + border-focus outline.
- `role="img" aria-label="Weekly goal met in 6 of the last 8 weeks"`. Never shown without the WeeklyGoal figure beside it.

**EmptyState** — one per view, each with one primary action.

| View | Headline | Body | Primary action |
| --- | --- | --- | --- |
| Today, nothing due | Nothing due today | 9 new leads are waiting — triage takes about 4 minutes. | Triage 9 leads |
| Today, no leads either | You're clear | Add the next role you want, or review what's working. | Add an action |
| Leads, empty | Inbox zero | Paste a job URL or let the agent fetch tonight's batch. | Paste a job URL |
| Pipeline, empty | No applications yet | Your first saved lead becomes a card here. | Open leads |
| Experiments, empty | No experiments yet | Try: follow up on day 5 instead of day 10. | New experiment |

Icon 40 px circle on bg-accent-subtle, no illustration, headline font-title, body font-meta, button primary 40 px.

**CommandPalette** — ⌘K / Ctrl+K.

- Built on the core Dialog + Combobox (React Aria). Input at top, results grouped: Actions · Companies · Contacts · Commands.
- Commands: go to Today/Pipeline/Leads/Insights, new action, new experiment, set stage → {stage} for the focused item, toggle theme, focus mode.
- Keyboard: ↑↓ move, Enter run, Esc close, Tab cycles groups. Width 560 px, max 8 results per group, 44 px rows.
- A11y: `role="dialog" aria-label="Search and commands"`, results `role="listbox"`, each `role="option"`; typed query echoed in a live region as "{n} results".

**ApplicationCard** — one screen per application; everything the user already does with Claude in chat, placed on the card at the right stage. Nothing is ever sent from the app.

| Block | Appears when | Content | Rules carried over from the project |
| --- | --- | --- | --- |
| 1 · Requirements & fit | lead saved | Job-ad breakdown: met / transferable / gap per requirement, each linked to the evidence used; Fit and Priorities | Fit = résumé vs requirements; gaps named honestly |
| 2 · Résumé & cover letter | Apply pressed | Tailored résumé shown as the base CV with changes highlighted and the reason for each; cover letter in the existing template (salutation + Re, who I am, what attracts, "I believe I have the skills…" + 3 bold bullets, close); ATS check list (keywords woven in, one column, no tables, ≤ 2 pages, working-rights line) | **PDF generated automatically; Word only via "Export to Word" button**; both built from the one text stored on the card, so they never diverge; editing the text rebuilds the PDF and keeps the old one in attachments |
| 3 · Who to write | kit ready | 1–2 people (hiring manager, team designer, warm path if any), why them, a draft message from the user's LinkedIn templates; Copy; "Sent" creates a follow-up action in 5 days | Outreach the day after applying; the user sends it herself |
| 4 · Interview prep | stage → Screen or Interview | 10–15 likely questions for this role and company with draft answers built from the STAR bank; questions to ask them | Question bank only after an invitation, as decided |
| 5 · Debrief | interview date passed | Three fields: what they asked, what went well, what to repeat; real questions are added to the bank | Feeds "What's working" and experiments |

- Facts come only from the evidence bank (master résumé + STAR stories); a requirement with no evidence is shown as a gap, never filled in.
- States per block: not started · preparing · ready · edited · sent/done. Preparing shows a one-line progress text, no spinner-only state.
- Text areas are plain `<textarea>`; no rich editor, no document versioning beyond the attachments history.
- Keyboard: blocks are sections with `<h3>`; Tab order follows the five blocks; each action button has a visible label.
- Files: PDF is generated automatically from the card text (one fixed template: Calibri, A4, one column); "Export to Word" builds a .docx from the same text on demand. Both are written to the connected local folder when one is set (see backlog 14e), otherwise downloaded. The card shows "Saved to \<path> · n files · time" and a "Change folder" button.

## Motion spec

Five events earn a signature animation; everything else uses the shared tokens (120–200 ms fade/translate, ease-out). Implement with CSS transitions where a single property changes and with Motion (framer-motion) springs for the two spring moments. Every moment has a reduced-motion path; test both with `prefers-reduced-motion` emulation.

**Shared rules**

- Transform and opacity only; never animate layout properties except the row collapse (height via `grid-template-rows: 0fr→1fr`).
- Interruptible: a second action mid-animation jumps to the end state, no queueing.
- Live-region text is written at the end of the animation, not the start.
- Reduced motion: durations → 120 ms, springs → crossfade, no translate larger than 4 px.

**1 · Done (ActionRow) — 320 ms**

| t | What happens | Easing |
| --- | --- | --- |
| 0 | Button pressed; ring scales to 0.9 | 80 ms ease-out |
| 80 | Ring fills bg-accent, tick draws (stroke-dashoffset) | 140 ms ease-out |
| 120 | Title colour → text-subtle, 1 px line-through grows left→right | 160 ms ease-in-out |
| 220 | Row collapses (0fr), rows below rise | 100 ms ease-out |
| 320 | Toast "Done: {title} · Undo" slides up 8 px + fades; live region "Done. 3 due today." | 200 ms |

Reduced: ring fills instantly, row fades 120 ms, no collapse motion (height jumps).

**2 · Goal met (WeeklyGoal) — 700 ms, once per week**

| t | What happens | Easing |
| --- | --- | --- |
| 0 | Fifth Done completes (moment 1 runs first) | — |
| 0–120 | Fifth bar fills bg-accent from the bottom | ease-out |
| 120–520 | Bar overshoots to 1.12 scaleY and settles | spring 260 / 18 |
| 200–380 | Figure 4 → 5 rolls up (odometer, 1 digit) | ease-out |
| 400–700 | Footer crossfades to "Goal met · 7-week streak"; StreakBar current cell fills | 300 ms |

Reduced: bar and figure swap at 120 ms crossfade; footer text changes with no fade. Never confetti, never sound.

**3 · Stage up (StageChip) — 240 ms**

| t | What happens |
| --- | --- |
| 0–120 | Chip rotates Y 0→90°, old label hidden at 90° |
| 120–240 | New stage colours applied; rotates 90→0° |
| 240 | Pipeline count for the new stage ticks +1 (figure roll, 180 ms); toast with Undo |

Reduced: label crossfade 120 ms, count updates instantly.

**4 · Experiment verdict (ExperimentCard) — 400 ms**

| t | What happens |
| --- | --- |
| 0–280 | "after" bar grows from the "before" width to its value (scaleX, transform-origin left) |
| 200–400 | Badge RUNNING → KEPT / DROPPED: background crossfade, label swaps at 300 |
| 400 | Verdict sentence appears (fade 200); live region reads it |

Reduced: bar at final width, badge swap only.

**5 · Offer (Pipeline) — 1.2 s, once per offer**

| t | What happens |
| --- | --- |
| 0–200 | Offer count ticks +1; Offer stage label and figure → text-accent |
| 200–1000 | The role's path Lead → Applied → Screen → Interview → Offer highlights one stage every 200 ms (bg-accent-subtle sweep under each count) |
| 1000–1200 | Sweep fades; Offer stays accent until the view is left |

Reduced: all five stages tint at once for 400 ms, then fade.

**6 · Print pass on Save (TriageCard) — 600 ms, phone**

Card lifts 8 px and slides out toward the Pipeline tab (ease-in-out 240 ms), Pipeline tab badge ticks +1, next card fades in from 0.98 scale (200 ms). Reduced: crossfade 150 ms.

## Feature backlog

Priority P0 ships before the visual redesign is called done; P1 follows in the next sprint; P2 after real-use feedback. Each row has an acceptance criterion a test or a review can check.

| # | Feature | P | Acceptance criterion |
| --- | --- | --- | --- |
| 0 | Save a job in one click (Seek / LinkedIn / any page) | P0 | Bookmarklet first, Chrome extension second: captures URL, title, company, JD text and source into \`leads\`; duplicate check by link and company+role; the new lead appears in triage within seconds with Fit computed by the agent |
| 0a | Onboarding (cold start) | P0 | Four steps, under 10 minutes: upload base CV → confirm 5 extracted evidence items → pick 3–5 priorities → paste or save a first job; first triage card appears at the end; every step skippable, progress saved |
| 0b | AI failure and confidence states | P0 | Three states on every AI surface: “agent has not run since …” (triage header), “fit is approximate — JD incomplete” (FitScore with dashed ring), “could not prepare — retry / do it manually” (kit block); never a spinner-only or silent failure |
| 0c | Rejection and dry-week states | P1 | Rejected is a neutral stage, not red: one optional question (“What would you ask next time?”) that feeds the debrief; WeeklyGoal under target shows the next useful action, never a streak loss; copy never judges (“worth your time” yes, “not worth it” no) |
| 0d | Interviews and dates: calendar export, not a calendar | P1 | Screen/Interview stage asks date, time, place/link; “Add to calendar” exports .ics and a Google Calendar link with the prep note; Today shows a one-line “This week” strip (interviews, job deadlines from leads.deadline, weekend follow-ups); stage playbooks attach Prep (day before) and Debrief (day after) to the date; no built-in calendar view, no two-way sync (P3 only if testers ask) |
| 0e | Privacy: export and delete | P1 | Settings: “Export everything” (JSON + CSV + attachments zip) and “Delete account and data” with 7-day undo; one-paragraph privacy note; files stay local; required before any tester joins (Australian Privacy Act) |
| 0f | Daily digest email | P1 | One email at a user-chosen hour: actions due today, interviews this week, n new leads worth your time; off by default until the first follow-up is created; no push in MVP |
| 0g | Disagree with Fit | P2 | “I think I match this” on the Why list re-scores with the user’s note; overrides are logged and shown in Insights as agent accuracy |
| 1 | Linen theme + token build | P0 | `data-iz-theme="linen"` restyles the app; contrast script passes all pairs in light and dark; no raw hex/px in `job-search-hq/src` |
| 2 | Today grouped Overdue / Today / This week | P0 | Groups render with counts; empty group hidden; overdue uses status-critical only on label and ring |
| 3 | Keyboard model (J/K/D/S/N/F/Esc) | P0 | Every shortcut works with no mouse; hints visible in list header; no global handler fires inside inputs |
| 4 | Done with Undo toast | P0 | Done is applied immediately; Undo within 6 s restores the row in place; one toast at a time |
| 5 | Snooze presets | P0 | Tomorrow / +3d / Mon / Pick…; default +3d on S; menu is a React Aria Menu |
| 6 | Quick add with natural dates | P0 | "Email Priya @Orbit tomorrow 10am" creates an action with company chip and due date; Enter adds, Esc clears |
| 7 | Triage flow (primary screen) — Apply / Stretch / Skip | P0 | First screen after sign-in; one card at a time with Fit, Priorities and estimated cost (“\~2.5 h: tailored résumé + cover letter”); actions Apply (A) / Stretch (T) / Skip (X) plus Later (L); swipes mirror buttons; progress bar; Undo 6 s; summary line “9 new, 3 worth your time” |
| 8 | WeeklyGoal gauge + goal met moment | P0 | Counts quality applications only (fit ≥ 70 or marked Stretch); shows done/target and stretch used of quota (1 in 5); moment 2 fires once on the fifth qualifying Done; reduced-motion path verified |
| 8a | Priorities (set, edit, match) | P0 | User sets 3–5 priorities (e.g. hybrid, salary floor, product team, growth); each lead shows "Priorities n of m" with per-priority ticks beside FitScore; filter "Matches my priorities" in Leads; Fit stays résumé-vs-requirements and is not blended |
| 9 | ⌘K command palette | P1 | Opens from anywhere; actions, companies, contacts, commands; set-stage command works on the focused item |
| 10 | StageChip cycling | P1 | Click or Shift+→/← advances/reverts; Pipeline count updates; Undo toast |
| 11 | Experiments (ExperimentCard + metrics) | P1 | Create with title, metric, window, n; app computes before/after from pipeline events; verdict proposed when n ≥ threshold |
| 12 | StreakBar + soft goal adjustment | P1 | 8-week history; after two misses the adjust prompt appears once; choosing a value updates the target |
| 13 | Empty states | P1 | All five views have the specified headline, body and one primary action |
| 14 | Focus mode (F) | P1 | Hides Pipeline, Leads, Insights and goal header; Esc restores; optional 25-min timer off by default |
| 14a | Instrumentation for the MVP test | P1 | Events for the three MVP metrics (action due/done, next step set, time-in-app while editing); one-click weekly value rating 1–5; export per user as CSV |
| 14b | Evidence bank | P1 | Imports master résumé facts and STAR stories as evidence items (project, result, number, tags); every requirement match in block 1 links to an item; prerequisite for 14c |
| 14c | Application kit (résumé + cover letter + who to write) | P1 | Apply triggers blocks 2–3 of ApplicationCard; résumé diff with reasons; cover letter in the project template; ATS checklist all green; PDF auto, Word on button; outreach draft from templates; no sending |
| 14d | Stage playbooks + interview prep + debrief | P1 | Each stage creates its default actions (Applied → follow-up day 5; Screen/Interview → prep; after interview → debrief); templates editable; prep block generates questions + draft answers from STAR bank only after Screen/Interview; debrief answers feed the question bank and What's working |
| 14e | Local folder (File System Access API) | P1 | Settings → “Choose folder” uses showDirectoryPicker(); handle stored in IndexedDB and re-requested when permission lapses; PDFs (and Word on export) are written to \<folder>/\<Company>/Iryna\_Zakharenko\_Resume\_\<Company>.pdf and …\_Cover\_Letter\_\<Company>.pdf; card shows path and last write time; browsers without the API (Safari, Firefox) fall back to a normal download and the card says so; no server storage of files |
| 14f | Résumé version ↔ application history | P1 | Each attachment records base version and the diff summary (“4 changes from v2.4”); history shows which version went to which company (Teal Resume Stack pattern) |
| 14g | Applied prompt after export | P1 | When a PDF is opened or copied from the card, a one-tap “Applied?” prompt appears; Yes sets stage Applied, date, asks for minutes spent (existing rule), creates the day-5 follow-up |
| 14h | Skip with a reason | P1 | Skip asks one tap: fit / priorities / closed / other; the reason is shown on the archived lead in one line (“Skipped: 2 of 4 priorities”) and feeds Insights; undo 6 s |
| 18a | Landing page: honest first line | P2 | First sentence states what the product does not do (“We don’t apply for you. We tell you which jobs are worth your time.”); removes the top complaint seen on Careerflow and Huntr |
| 15 | Offer moment | P2 | Fires once when a role reaches Offer; path sweep as specified |
| 16 | What's working by role type | P2 | Applied→screen rate per role type over 60 days; bars carry text values; highlights the best type |
| 16a | Insight: Fit → result | P1 | Applied→screen and screen→interview rates by fit band (85+, 70–84, <70) and for Stretch applications; three rows with text values; shown once n ≥ 5 per band; this is the test of the core thesis |
| 17 | Insights: experiment history | P2 | Table of all experiments with verdicts; exportable as CSV |
| 18 | Pricing fake-door | P2 | Landing page shows a 90-day pass price and "Start 90-day pass"; click is logged and leads to a waitlist form; no payment |

**Deliberately not built**

**From the UX/UI audit (canvas row G)** — seven items that are build rules rather than mockup changes: (15) sticky toast and phone nav never obscure the focused element (`scroll-padding-bottom`); (16) every swipe has a button equivalent, tested without touch; (17) Today groups collapse, “This week” collapsed by default when > 6; (18) debrief pre-fills the prep questions as “asked / not asked” checkboxes; (19) stage “Lead” renamed “Saved” so the section name “Leads” is unambiguous; (20) below 1360 px meta chips collapse to one row with “…”; (21) text-spacing 200% test on uppercase labels. Also fixed on the mockups: skip-link and `<main>`, toast dismiss button and pause on hover, one primary per block, ATS as a checklist not a score, in-page nav on the application card, 12 px minimum for tracked labels.

- Points, levels, badges, daily streaks, leaderboards: they optimise for the app, not for the offer.
- Team features (assignees, comments, mentions): single user; the contact at the company is a property instead.
- Auto-apply: the user reviews and sends everything herself; the agent only prepares.

## Phases and open questions

**Phase A — solo (now).** Iryna is the only user. Current artifact database, current scheduled searches, local folder for files. Scope: redesign on linen, triage with Apply / Stretch / Skip, ApplicationCard with kit, stage playbooks, experiments. Closes the portfolio case study.

**Phase B — testers (after Phase A).** 5–8 job seekers from Sydney UX/design communities and meetups, 30-minute onboarding session plus one week of use. Needs accounts, a hosted database (Supabase or similar), the bookmarklet as the only lead source (no scraping for other users), privacy export/delete, digest email. Runs the MVP test and the pricing fake-door. Must not slow Phase A or the job search itself.

**Mobile scope.** Phone = triage and Done; Today, Pipeline and ApplicationCard are desktop (responsive but not designed for 390 px) until testers ask.

| Open question | Owner | Decide by |
| --- | --- | --- |
| Hosted database and auth provider for Phase B | Iryna + Claude Code | before Phase B starts |
| Seek / LinkedIn terms for the bookmarklet and the agent | Iryna | before any tester saves a job |
| 90-day pass price for the fake-door (20–30 AUD?) | Iryna | before the landing page |
| First distribution channel (LinkedIn content, Sydney UX communities, portfolio) | Iryna | Phase B kickoff |
| Where “done” is for the case study vs for the product | Iryna | end of Phase A |

## Data and lead ingestion

Leads keep arriving exactly as today, plus one new path. Nothing about the search workflow changes.

| Path | Today | In v2 |
| --- | --- | --- |
| Scheduled search by Claude (Seek, LinkedIn, company sites, remote boards) | Writes to the tracker’s `leads` collection with fit, why, gaps, jd | Same collection, same fields; the app reads it and shows new items in triage with “n new · m worth your time” |
| Python job-search agent (Playwright, SQLite, Claude API) | Planned; alerts at ≥ 70% | Writes through the same `leads` API; Fit and Priorities computed on insert |
| Manual add | Chat with Claude or typing in the tracker | Save-in-one-click bookmarklet / extension (backlog #0) plus the existing form |

**Collections carried over unchanged**: `applications`, `leads`, `stories`, `contacts`, `agencies` as defined in `Tracker_Workflow.md`, including status values, `history`, `minutes`, `attachments`, `employment` and the part-time rules. New fields: `priorities[]` on the user profile; `priorityMatch` and `stretch` on applications; `skipReason` on leads; `kit` (résumé text, letter text, diff, generatedAt) and `prep` / `debrief` on applications; `source: 'referral'` already exists and feeds the Fit → result insight.

**Storage**: the artifact database stays the source of truth for v2 so the existing scheduled searches and `ArtifactData` writes keep working with no migration; files go to the local folder. Moving to a hosted database is a P2 decision tied to the pricing test, not to the redesign.

## Build order for Claude Code

Six phases; each ends with a learning checkpoint (one question, one exercise) as agreed for iz-design-system. Explanations in Ukrainian, code and docs in English. Run phases in `~/Desktop/CHALLENGE/iz-design-system` for 1–3 and in the Job Search HQ repo for 4–6, with the design system linked as a local package.

| Phase | Scope | Definition of done |
| --- | --- | --- |
| 1 · Tokens + linen | base/semantic JSON5, Style Dictionary build, `linen` + `linen.dark` overrides, contrast script, ESLint rules | `npm run build:tokens` emits CSS/TS/Figma JSON; `npm run check:contrast` passes; lint fails on a raw hex |
| 2 · Primitives | Button, Chip, Card, Toast, TextField, Dialog + Combobox on React Aria; spec per component; Storybook with 4 themes | Keyboard and screen-reader pass on each; specs render on the docs page; `agent/llms.txt` lists them |
| 3 · Patterns | nine patterns in `src/patterns/jobsearch`, each with spec, stories, reduced-motion story | No raw values; every pattern composes primitives; MCP `get_spec` returns each |
| 4 · Today | grouped list, ActionRow, Done+Undo, Snooze, quick add, WeeklyGoal, keyboard model | Backlog #1–6, #8 accepted; axe clean; Lighthouse a11y 100 |
| 5 · Leads + palette | TriageCard flow, ⌘K palette, StageChip cycling, empty states, focus mode | Backlog #7, #9, #10, #13, #14 accepted on phone and desktop |
| 6 · Experiments + insights | ExperimentCard, metric computation from pipeline events, StreakBar, goal adjustment, Offer moment, What's working | Backlog #11, #12, #15–17 accepted; case study screenshots captured in both themes |

**Prompt for phase 1** (paste into Claude Code in the design-system repo)

```
Read specs/ARCHITECTURE.md and the handoff doc linked in README. Implement Phase 1:
1. Create src/tokens/base.json5 and semantic.json5 following the naming scheme
   --iz-{category}-{role}-{emphasis}-{state}; every bg role gets an fg-on-* pair.
2. Add src/tokens/themes/linen.json5 and linen.dark.json5 as override files with
   exactly the values in the "Linen theme tokens" tables; register in themes.config.ts.
3. Build with Style Dictionary to dist/css/{theme}.css, dist/ts/tokens.d.ts and
   dist/figma/tokens.json ($extensions for collections and modes).
4. Write scripts/check-contrast.ts: for every theme, every documented bg/fg pair,
   fail if text < 4.5:1 or UI < 3:1. Wire into npm test.
5. Add ESLint rules iz/no-raw-colors and iz/no-raw-spacing with autofix suggestions.
Stop after each step, explain in Ukrainian what was decided and why, and ask me
one question that checks I understood it before continuing.
```

**Prompt for phase 4** (in the Job Search HQ repo)

```
Link @iz/design-system from ../iz-design-system. Set data-iz-theme="linen" on <html>
with a light/dark toggle persisted in localStorage. Rebuild the Today view per the
handoff: grouped Next actions (Overdue / Today / This week) with ActionRow, Done with
Undo toast, Snooze presets, quick-add input with natural-date parsing (chrono-node),
WeeklyGoal with the goal-met moment, keyboard model J/K/D/S/N/F/Esc. Use only
tokens and primitives from the package; the lint rules must pass. Add Playwright
tests for keyboard-only completion of each flow and for prefers-reduced-motion.
```

**Definition of done for the whole build**

- [ ] Both products (apps/demo, job-search-hq) run on the same core; switching `linen` ↔ `default` changes no component code.
- [ ] All backlog P0 and P1 items accepted; P2 scheduled.
- [ ] axe and Lighthouse a11y clean in light and dark; keyboard-only walkthrough recorded.
- [ ] `agent/llms.txt` and the MCP server answer `get_spec` for every primitive and pattern.
- [ ] Case study draft: one token change shown updating both products, before/after screens, the experiments widget with real data.

**Sources used for the design-system analysis**

- [Material 3 Expressive design language](https://developer.android.com/design/ui/wear/guides/get-started/design-language) and [color roles and tokens](https://developer.android.com/design/ui/wear/guides/styles/color/roles-tokens)
- [Carbon color overview](https://carbondesignsystem.com/elements/color/overview/)
- [Atlassian Design System llms.txt](https://atlassian.design/llms.txt) and [design tokens](https://atlassian.design/tokens/design-tokens)
- [Polaris](https://shopify.dev/docs/api/polaris)
- [Primer primitives](https://github.com/primer/primitives)
- [Serendie MCP server](https://serendie.design/en/ai/mcp-server)
