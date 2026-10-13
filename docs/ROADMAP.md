# Roadmap — learning phases

## How every phase runs

1. **Concept** — explained in Ukrainian, with the reason behind it (identifiers, APIs and dev docs stay in English).
2. **One inspectable increment** — small enough to read every line.
3. **Where to inspect it** — exact files, Storybook story, Figma page.
4. **Checks actually run** — listed with results; unrun checks are listed as not run.
5. **One understanding question** and **one short exercise**.
6. **Learning checkpoint** — pause; the author inspects, answers, does the exercise; `docs/learning-log.md` gets its entry. Nothing starts the next phase before this.

Routine implementation choices are not put up for approval; only missing information that blocks correct work, or a decision that materially changes scope, is asked about. No phase ends with a large unexplained code dump.

Per-phase report format: what changed · what it demonstrates · where to inspect · checks run (with results; unrun = "not run") · unresolved issues · question · exercise.

## Milestone v0.1 — the first portfolio-ready cut

v0.1 is deliberately small and *finished*. It is what goes into the resume and the case study while the system keeps growing. Scope:

- Tokens: primitives, semantic layer, all four themes, `tokens:validate` and `check:contrast` passing.
- Five components at `stable`: **Button, TextField, Checkbox, Card, Modal** (focus-visible · label/error association · group semantics · content/heading structure · focus trap and return).
- Figma: Primitives/Semantic collections with four modes, the same five component sets, pages *Start here · Foundations · Components*; manifest entries with real node IDs or `pending`.
- Agent layer: `.spec.json` for the five, MCP server running, **one recorded test** of Claude Code building the application form from `get_spec`/`list_tokens`; Codex and Claude Design marked tested/partially/untested as actually observed.
- Demo: **one screen** — the application form (uses all five components), validated, keyboard-only flow recorded.
- `fixtures/consumer/` imports the five through public exports.
- Docs: decisions.md, learning-log.md, CAPABILITIES.md current; `portfolio-case-study.md` written with real findings — at least one accessibility issue found and fixed, at least one AI output corrected, with evidence.

Everything after v0.1 ships as 0.2, 0.3… with a changelog — the changelog itself is portfolio evidence that the system lives.

## Phase 0 — Environment audit and contract

Inspect the connected folder (preserve anything already there), record **exact installed versions** of Node, npm, React, Vite, TypeScript, Storybook, React Aria, Style Dictionary, Playwright into `docs/CAPABILITIES.md` and commit the lockfile; confirm or mark as assumed every row there; `git init`; scaffold: Vite + React 19 + TypeScript strict, Storybook 10 (`addon-a11y`, `addon-vitest`, `addon-docs`), Vitest + Testing Library + axe, Playwright, ESLint (`jsx-a11y`), stylelint (no hardcoded values), Changesets, `AGENTS.md`, `CLAUDE.md` (`@AGENTS.md`). Lockfile committed. Brief reviewed.
*Learn:* authority per artefact; why each guard-rail exists.

## Phase 1 — Vertical slice: tokens → CSS → Button → Figma

Minimal primitives (neutral + accent + danger ramps, spacing, radius, type, motion), semantic action/text/surface/border tokens, light theme only. Style Dictionary build → `design-tokens.css`, `tokens.d.ts`, `docs/specs/tokens.dtcg.json`. Validation: aliases resolve, no cycles, no missing theme values, no duplicate names, types correct. `check:contrast` on every documented pair. Then `Button` (spec → code → stories → tests → MDX) and the Figma side: Primitives/Semantic collections, Button component set with `State` incl. focus, description with role + keyboard map — or exact manual steps marked `pending` if Figma is not reachable.
**Trace:** one token (`color.action.primary.bg`) from JSON → generated CSS → rendered Button → Figma variable binding. **Demonstrate one reviewed token change** and show which artefacts update automatically (CSS, Storybook, specs) and which need a manual import (Figma).
*Learn:* tiers, aliasing, generated vs source, path ↔ Figma name ↔ CSS variable translation, rem vs px, real contrast testing.

## Phase 2 — Figma system + core library

Figma pages: *Start here · Foundations · Components · Patterns · Product examples · Changelog*. Meaningful layer names, Auto Layout with intentional Hug/Fill/Fixed, text/effect styles bound to variables, component properties (text, boolean, instance swap, deliberate variant axes), no detached instances, long-content resizing checked.
Code, in order: IconButton, Link · TextField, TextArea, Checkbox, RadioGroup, Switch · Card, Badge, Tag, Avatar · Tabs, Menu, Breadcrumb · Modal, Tooltip, Popover · Alert, Toast · Select, ComboBox · Stack, Container, Grid. Each one via the full cycle in `CONTRIBUTING.md`; each gets a manifest entry with real Figma node IDs or `pending`.
Rule: hover and focus-visible are browser states, not props. Public props only for semantics: `isDisabled`, `isInvalid`, `isSelected`, `isExpanded`, `isPending`.
*Learn per component:* see category table in README (one a11y concept each).

## Phase 3 — Verify accessibility, responsiveness, theming

WCAG 2.2 AA audit with written scope and limitations: contrast (4.5:1 normal text, 3:1 large text per WCAG's definition, 3:1 non-text), target size 24 px AA minimum (44 px as the recommended touch size, never called "the AA minimum"), keyboard operation and order, visible focus, names and descriptions, ARIA states, non-colour status cues, announcements. Modal: focus placement, containment, Escape, focus return. Loading/disabled interaction and double-submit prevention explained.
Layout: 320 px, 200 % text zoom, long EN/UK strings, empty and partial content, reduced motion, no hover-only actions.
Then dark theme via semantic aliases (not inversion), repeat all checks; then hc-light, hc-dark at AAA contrast. Density, responsiveness and theme kept as separate concerns.
Selected visual baselines captured; baseline changes reviewed, never auto-accepted.

## Phase 4 — Reusable across AI tools

`agent/`: stdio MCP server over specs + tokens; `iz-mcp-setup` writing `.mcp.json` (Claude Code) and Codex config; `gen-llms-txt`. `docs/design-system.md` as the single shared reference (principles, token policy, inventory, public imports, composition rules, themes, a11y contracts, examples, documented exceptions). `AGENTS.md` and `CLAUDE.md` (`@AGENTS.md` + Claude-only notes) consistent with it.
Claude Design: verify the current import route (Design System artefact / `/design-sync` availability in the installed Claude Code version and account). If supported, sync and review the extracted system in a test design; otherwise prepare the documented source bundle. No claim of live npm execution or ongoing sync.
**Reuse test:** the same small task ("a sign-in form with validation") in a fresh Claude Code context, a fresh Codex context, and Claude Design. Check imports via public exports, token use, typography, spacing, states, accessibility. Mark each as tested / partially tested / untested with version and observed differences.
*Learn:* what an agent needs from a system to stop guessing; instructions guide, validation enforces.

## Phase 5 — Prove it in a product and package the case study

`demo/`: vacancy list with filters and a no-results state · vacancy detail · application form with validation and submission feedback. Fictional, clearly labelled sample data. Domain components stay in `demo/`. The list → detail → form flow tested end to end, by keyboard too. `fixtures/consumer/` proves the package via public exports only.
Documents: `decisions.md` complete, `learning-log.md` complete, `portfolio-case-study.md` (problem, scope, constraints, role, architecture, key decisions, rejected alternatives, a11y findings, Figma/code comparison, AI evaluation, limitations, next steps). Concept project clearly distinguished from client work; design decisions distinguished from AI-assisted code. No invented research, adoption, testimonials or time-savings. Measurable things we *can* report: duplicate components found in the demo, token violations caught by lint, a11y issues found and fixed, correction counts for AI output against a defined baseline.
Short English project description; 3–5 minute walkthrough script; interview questions (semantic tokens, composition vs variants, Figma/code mapping, accessibility, a failed AI output I corrected, how I'd evolve the library).

## After v1

`@iz/elements` (web components for WordPress), charts under the `dataviz` rules, DatePicker, Table; codemods + migration guides from 1.0.0 onward.

## Figma plan note

Code Connect needs an Organization/Enterprise plan. On Starter/Professional the Figma ↔ code link is naming parity + component descriptions + the manifest, and the remote Figma MCP server is rate-limited (6 calls/month on Starter; Tier-1 limits with a Dev/Full seat on Professional). The Figma side is planned so Code Connect can be added later without renames.
