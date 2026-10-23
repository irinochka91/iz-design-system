# Learning log

One entry per phase. Format: concept · traced example · my exercise · what I can now explain.

## Phase 0 — environment and contract

- **Concept:** guard-rails are the design system. Before a single component exists, the repo already enforces: no raw units/colours/`!important` in CSS (stylelint), no inline styles and jsx-a11y strict (ESLint), every story is an axe test that fails CI (`a11y.test: 'error'`), strict TypeScript, public API only through `src/index.ts`.
- **Traced example:** the first draft of `reset.css` contained a `prefers-reduced-motion` block with `0.01ms !important`. stylelint rejected it. The fix was not an exception — it was moving reduced-motion into the token layer (duration tokens → 0), exactly as `TOKENS.md` already said. The tool caught a rule the human had just broken.
- **Negative test:** an `<img>` without `alt` injected into the Welcome story made `vitest --project storybook` fail with `image-alt`. A green test suite that cannot go red proves nothing; now we know this one can.
- **Exercise (run by the AI at the author's request, 2026-10-15):** add `<a href="#">Детальніше</a>` to the Welcome story and expect axe to fail. **It did not fail — 1/1 passed.** The AI's prediction was wrong: axe's `link-name` rule only checks that a link *has* an accessible name; "Детальніше" ("Read more") is a name. Whether the name describes the link's *purpose* (WCAG 2.4.4 Link Purpose) is not something axe, or any automated tool, can judge. The fix is still the same — link text that works out of context ("Детальніше про дизайн-систему" / "Read the design-system principles") — but it has to come from a human review step, not the test suite. This is the first entry for the case study's "an AI output I corrected" section: the AI's own exercise premise was wrong, the tool proved it, and the lesson is why `CONTRIBUTING.md` requires a manual pass alongside axe.
- **Understanding question — why `px` is allowed only on `outline*`, `border*`, `scroll-*`:** these three are *structural* widths that must stay visually constant: a 2 px focus ring or 1 px border should not scale with the user's font size (a 0.125rem ring at 200 % zoom becomes a 4 px blob; a hairline border becomes blurry). `scroll-margin`/`scroll-padding` offset the focused element from sticky headers (2.4.11 Focus Not Obscured) and are tied to the header's px height. Everything else — spacing, type, radius — goes through tokens so it scales and themes. If `outline` had no px exception, the only lint-clean options would be `outline: none` (forbidden by `declaration-property-value-disallowed-list`) or a `rem` ring that distorts under zoom; in practice people reach for `outline: none` and the focus indicator disappears — the single most common keyboard-accessibility failure on the web. The exception exists so the right thing is also the easy thing.
- **I can now explain:** *(the author fills this in after reading the two entries above)*

## Phase 1 — tokens → CSS → Button

- **Concept:** a token is a named decision. `color.action.primary.bg` is one name with **six** values (light `#1D4FD7`, dark `#4D84FA`, hc-light `#122F84`, hc-dark `#80A8FF`, linen `#2B3FBF`, linen-dark `#8FA0FF`). The Button never knows the hex; it reads `var(--iz-color-action-primary-bg)`. Themes are override files that re-alias semantic tokens; components don't change.
- **Traced example — one token, six links, end to end.** Run `npm run build:tokens` first; every line below is checkable.

  | # | Layer | Where | What it says |
  |---|---|---|---|
  | 1 | primitive | `tokens/primitives/color.linen.json` | `color.ultramarine.600` = `#2B3FBF` (tagged `H` — exact handoff value) |
  | 2 | semantic (base) | `tokens/semantic/color.json` | `color.action.primary.bg` = `{color.blue.600}` |
  | 3 | theme override | `tokens/themes/linen.json` | `color.action.primary.bg` = `{color.ultramarine.600}` |
  | 4 | registry | `tokens/themes.config.ts` | `linen` → attribute `linen`, colourScheme `light`, contrast `AA` |
  | 5 | generated CSS | `src/styles/design-tokens.css` | `[data-theme='linen'], [data-iz-theme='linen'] { --iz-color-action-primary-bg: #2B3FBF }` |
  | 5b | alias layer | same file, `:root` | `--iz-color-bg-accent: var(--iz-color-action-primary-bg)` — the handoff's name, following the canonical one into every theme |
  | 6 | component | `Button.module.css` | `.primary { --iz-button-bg: var(--iz-color-action-primary-bg) }` |
  | 7 | rendered | Storybook *Actions/Button/Primary*, Theme toolbar → `linen` | the toolbar is generated from `themes.config.ts` and sets both attributes |
  | 8 | Figma | `Semantic/color/action/primary/bg`, mode `linen` → alias `color/ultramarine/600` | **pending** — see `docs/figma/PHASE-1-FIGMA.md`; the alias per mode is in `dist/figma/tokens.json` |

  Links 1–7 are live. Link 8 is the only manual one, and that asymmetry is the point of ADR-004: Git is canonical, Figma is a mirror that has to be re-entered.
- **Things the tools caught this phase (all mine):** (1) `tokens:validate` — two semantic tokens aliased themselves because they shared a name with a primitive (ADR-007). (2) `check:contrast` — `text.muted` on `surface.raised` was 4.44:1, invisible to the eye, 0.06 below AA; fixed by darkening `neutral.500`, not by lowering the bar. (3) stylelint — raw `px`/`em` in the first CSS; resolved with one documented utility and one scoped exception. (4) axe in the story test — **pending state had no accessible name**: `visibility: hidden` on the label (to keep the width stable) removed it from the accessibility tree; fixed with `opacity: 0`. (5) The spec said `aria-busy`; React Aria actually uses `aria-disabled` + `data-pending` — spec corrected to reality, not the other way round. (6) React Aria does not dispatch a native `click` on keyboard activation, so the Playwright click counter was wrong; activation is asserted in the Storybook interaction test instead.
- **Reviewed token change demo (run 2026-10-23, both halves).** One primitive edited, `color.ultramarine.600`.

  *Half one — the change that should be rejected.* `#2B3FBF` → `#6B7BE0` (a lighter ultramarine, visually plausible). `npm test` went red with the pairs named: six failures, **all in linen only**, lowest 3.01:1 — `fg.on-accent` on the accent dropped to 3.79:1, `text.link` on the page to 3.48:1, `fg.on-accent-subtle` on the tint to 3.01:1. The other five themes stayed green, which is the proof that the primitive is linen-scoped. A reviewer sees the exact pairs and the exact deficit, not "contrast failed".

  *Half two — the change that passes.* `#2B3FBF` → `#2A3DB8` (a half-step darker). Updated with no hand-editing: `src/styles/design-tokens.css` (5 declarations — `action-primary-bg`, `action-primary-fg`, `border-focus`, `text-link`, `status-info-border` — one primitive, five semantic roles), `dist/css/linen.css`, `dist/ts/tokens.d.ts`, `dist/figma/tokens.json`, `docs/specs/tokens.dtcg.json`, and every Storybook story through the Theme toolbar. Token **names** did not change, so no component, spec or test needed touching. Manual step, still: `Primitives/color/ultramarine/600` in Figma.

- **What this demo caught — a silent bug in the build I had just written.** With the accent changed, `--iz-color-action-primary-bg` was correct in linen but `--iz-color-bg-accent` — the handoff's name for the same decision — was still base blue `#1D4FD7` in *every* theme. Cause: theme blocks only re-declare the tokens that theme overrides, and the alias layer is not overridden by any theme, so a resolved literal on `:root` froze the base value. Two pairs of eyes would not have found this; a changed colour did. Fix (ADR-014): an alias-layer token is emitted as `var(--iz-canonical)`, never as a resolved literal, so it follows its target by construction and the whole class of bug disappears rather than being tested for. Verified across all six themes: `--iz-color-bg-accent` now resolves to the same hex as `--iz-color-action-primary-bg` everywhere.
- **Exercise:** *(for the author — see the Phase 1 report)*
- **I can now explain:** *(the author)*
