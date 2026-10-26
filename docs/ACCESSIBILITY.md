# Accessibility contract

Floor: **WCAG 2.2 Level AA** on every component in every theme; AAA contrast on hc themes; 2.4.13 Focus Appearance met everywhere even though it's AAA.
Reference for patterns: **WAI-ARIA Authoring Practices Guide (APG)**. Every interactive component names the APG pattern it implements in its spec.
Behaviour engine: **React Aria Components**. We style it; we don't reimplement it.

## The seven invariants (every component, no exceptions)

1. **Keyboard reachable and operable.** Everything a mouse can do, a keyboard can do. No `tabindex` > 0. No keyboard traps except an intentional focus trap in modal overlays.
2. **Visible focus.** `:focus-visible` on every interactive element: 2px solid `--iz-color-border-focus`, `outline-offset: 2px`, 3:1 contrast against both the element and its background. Never `outline: none` without a replacement of equal or greater visibility.
3. **Focus is never obscured** (2.4.11). Sticky headers, toasts, drawers and cookie banners must not cover the focused element; scroll-padding / `scroll-margin` are set on the app shell.
4. **Accessible name.** Every control has a name from visible text, `<label>`, `aria-label` or `aria-labelledby`. Icon-only controls *require* `aria-label` — the type system enforces it.
5. **State is exposed, not just drawn.** Disabled → `disabled` or `aria-disabled`; selected → `aria-selected`/`aria-checked`/`aria-pressed`; expanded → `aria-expanded`; invalid → `aria-invalid` + `aria-describedby` pointing at the error; current → `aria-current`.
6. **Target size ≥ 24×24 CSS px** — that is the WCAG 2.2 AA minimum (2.5.8), with its listed exceptions (inline links in text, spacing exception, user-agent controls). 44×44 (`size.target.touch`, `size="lg"`) is our *recommended* touch target, not the AA minimum; never document it as such.
7. **Motion respects `prefers-reduced-motion`.** No animation is load-bearing: information never exists only in motion.

## Keyboard maps by category

These are the APG defaults. A component may add keys but never remove one.

### Actions — Button, IconButton, Link
`Tab` focus · `Enter`/`Space` activate (Link: `Enter` only) · toggle buttons expose `aria-pressed`.

### Inputs
- **TextField**: standard; `aria-describedby` links hint and error; error text is in the DOM before it becomes visible so screen readers announce it on `aria-invalid`.
- **Checkbox**: `Space` toggles; indeterminate via `aria-checked="mixed"`.
- **RadioGroup**: `Tab` into the group lands on the checked radio (or the first); `Arrow` keys move *and* select; `Space` selects.
- **Switch**: `role="switch"`, `Space` toggles (`Enter` belongs to the form, as for Checkbox), `aria-checked`; applies at once — no Save, no validation props.
- **Select** (APG Select-only combobox): `Enter`/`Space`/`Alt+Down` open; `Up/Down` move; `Home/End`; type-ahead; `Enter` selects; `Escape` closes without change; focus stays on the trigger, `aria-activedescendant` tracks the option.
- **ComboBox**: as Select plus text filtering; `aria-autocomplete="list"`; `aria-expanded`.

### Navigation
- **Tabs**: `Tab` lands on the active tab, then jumps *into* the panel; `Left/Right` (or `Up/Down` for vertical) move between tabs with roving tabindex; `Home/End`. Automatic activation by default, manual (`Enter`/`Space`) when panels are expensive.
- **Breadcrumb**: `<nav aria-label="Breadcrumb">`, current page has `aria-current="page"`.
- **Menu** (APG menu button): `Enter`/`Space`/`Down` open and focus first item; `Up` opens and focuses last; `Up/Down` move; `Home/End`; type-ahead; `Enter` activates; `Escape` closes and returns focus to the trigger; `Tab` closes.

### Overlay
- **Modal**: focus moves into the dialog on open (first focusable, or the dialog itself if none); focus is trapped; `Escape` closes; on close focus returns to the element that opened it; `role="dialog"` + `aria-labelledby`; modality is conveyed by hiding everything outside with `aria-hidden` (React Aria's `ariaHideOutside`) rather than `aria-modal`, which assistive technology supports inconsistently; body scroll is locked.
- **Popover**: a positioned `role="dialog"`. By default modal for assistive technology, like Menu — focus moves in (first control, else the popover), `Tab` is contained, `Escape` and a click outside close and return focus. `isNonModal` (ComboBox-style surfaces only, never a form): the page stays reachable and focus leaving the popover closes it — `Tab` out closes.
- **Menu** (modal popover, per React Aria): opens with focus on an item, `Escape` / a choice / click outside close and return focus to the trigger; while open the rest of the page is hidden from assistive technology and `Tab` is contained (does nothing). Not `isNonModal` — see ADR-029.
- **Tooltip**: shown on focus *and* hover; `Escape` dismisses; never contains interactive content; `role="tooltip"` + `aria-describedby` on the trigger. Hover-only tooltips are forbidden.

### Feedback
- **Alert** (inline): `role="alert"` for errors (assertive), `role="status"` for everything else (polite). Dismiss button is a real button with a name.
- **Toast**: lives in a single `aria-live="polite"` region; never steals focus; dismissable by keyboard (`F6`/`Ctrl+Alt+T` moves to the toast region — documented in the spec); auto-dismiss ≥ 5 s and pauses on hover/focus; never obscures focus (2.4.11).

### Template
Landmarks: `header`, `nav`, `main`, `footer` (one `main`); skip link as the first focusable; one `h1`; heading levels don't skip; help/contact mechanism in the same place on every page (3.2.6); forms never ask for the same data twice in a flow (3.3.7); no drag-only interactions (2.5.7).

## Figma requirements

Every interactive component in Figma has, as variants or properties: `state = default | hover | focus | active | disabled` (focus is mandatory), `invalid` where applicable. The component description contains: APG pattern, ARIA role, keyboard map (copied from this doc), and the semantic tokens used. Annotations in Dev Mode mark focus order on templates.

## Testing (what "done" means)

| Layer | Tool | Gate |
|---|---|---|
| Automated rules | axe-core via `@storybook/addon-a11y` + Vitest addon, `parameters.a11y.test = 'error'`, rules `wcag2a, wcag2aa, wcag22aa` | CI fails on any violation |
| Keyboard | Playwright: real `keyboard.press` sequences from the map above; asserts `document.activeElement` and visible focus ring | CI fails |
| Contrast | `scripts/check-contrast.mjs` over every semantic pair in every theme | CI fails |
| Screen reader | Manual: VoiceOver + Safari (macOS), NVDA + Firefox (Windows) when available; result recorded in `spec.a11y.screenReaderNotes` | required before "stable" |
| Virtual SR | `@guidepup/virtual-screen-reader` for key components | recommended |

Automated tools catch roughly a third of real issues. The keyboard tests and the manual pass are the ones that matter.

Reflow and zoom are part of "done": every component and every demo screen is checked at 320 CSS px width and at 200 % text zoom with long English and Ukrainian strings, empty and partial content. Documented exceptions (e.g. genuinely two-dimensional tables) are written into the spec's `rules`.

The audit is scoped: we claim conformance for the defined inventory and demo screens under the tests listed here, with recorded results and known limitations — never "fully WCAG compliant".

## WCAG 2.2 quick reference (what changed from 2.1)

New: 2.4.11 Focus Not Obscured (AA), 2.4.12 (AAA), 2.4.13 Focus Appearance (AAA), 2.5.7 Dragging Movements (AA), 2.5.8 Target Size Minimum (AA), 3.2.6 Consistent Help (A), 3.3.7 Redundant Entry (A), 3.3.8 Accessible Authentication (AA), 3.3.9 (AAA). Removed: 4.1.1 Parsing. Source: [W3C — What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/).
