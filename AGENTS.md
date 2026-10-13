# AGENTS.md — IZ Design System

Rules for every coding agent (Codex, Claude Code via `CLAUDE.md`, others). `docs/` is the single source of rules; this file is the short form.

## Read first
`docs/BRIEF.md`, `docs/CONTRIBUTING.md`, `docs/ACCESSIBILITY.md`, `docs/UBIQUITOUS-LANGUAGE.md`, `docs/TOKENS.md`, `docs/SPEC-FORMAT.md`. Then inspect the existing components and tokens before editing anything.

## Non-negotiable
- Spec (`Name.spec.json`) before code; keyboard map complete for interactive components.
- Import library components through public exports (`@iz/design-system`), never by file path; never duplicate a component that exists.
- Only `var(--iz-*)` semantic/component tokens in reusable component styles; no raw colours, font sizes, spacing or durations; never a primitive token in a component. Documented layout/computed exceptions (`calc`, `%`, `auto`, `0`) are fine.
- React Aria Components for behaviour; style via `data-*` state attributes; `[data-focus-visible]` style on every interactive element. Preserve accessible behaviour — never remove focus styles, roles, names or keyboard handling to fix a visual issue.
- Prop vocabulary from `docs/UBIQUITOUS-LANGUAGE.md` (`variant`, `size: sm|md|lg`, `tone`, `isDisabled`, `isInvalid`, `isPending`, `onPress`). Hover/focus are browser states, not props.
- Icon-only controls require `aria-label` (enforced by types).
- Generic components carry no domain data; demo-specific code lives in `demo/`.
- Never edit generated files (`src/styles/design-tokens.css`, `docs/specs/tokens.dtcg.json`, `public/llms.txt`, `composedBy` in specs).
- Changing a public API: rationale in `docs/decisions.md` + stories + manifest mapping + tests, in the same change.
- `npm run check` must pass before a task is reported done. Don't disable rules to make it pass. Generated code is a proposal; validation output is the evidence.
- Report checks that did not run as "not run". Never claim Figma sync, Code Connect or MCP connectivity without evidence from this environment.

## Validation commands
```
npm run lint && npm run lint:css && npm run type-check
npm run tokens:build && npm run tokens:validate   # aliases, cycles, missing theme values, duplicates, types
npm run check:contrast                            # every documented pair, every theme
npm test                                          # Vitest + axe on every story
npm run test:e2e                                  # Playwright keyboard tests
npm run check:specs                               # specs ↔ props ↔ tokens ↔ examples
npm run build && npm run build:storybook && npm run build:demo
npm run check                                     # all of the above
```

## MCP
If `iz-specs` is configured, use `get_spec`, `list_tokens`, `search_components`, `find_by_a11y_role` and `get_template` before writing components or pages.
