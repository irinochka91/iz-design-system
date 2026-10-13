# Contributing — how a component is built

This applies to humans and agents equally. Read `TOKENS.md`, `ACCESSIBILITY.md` and `UBIQUITOUS-LANGUAGE.md` first; this doc is the procedure.

## Stack

- React 19 + TypeScript (strict), ESM only.
- **React Aria Components** for behaviour. Use the component form (`<Button>`, `<Dialog>`, `<Tabs>`) by default; drop to hooks (`useButton`…) only when the component form can't express the API.
- **CSS Modules** (`*.module.css`) with `--iz-*` custom properties. No inline styles, no `!important`, no hardcoded colour/spacing/size/duration values (stylelint enforces: `declaration-property-value-disallowed-list` blocks hex, `px` and `ms` outside token files).
- Storybook 10 (`addon-a11y`, `addon-vitest`, `addon-docs`), Vitest + Testing Library + axe, Playwright, stylelint, ESLint with `jsx-a11y`.
- Style Dictionary for tokens. Rollup for the library build.

## The build order for every component (the learning cycle)

1. **Spec first.** Create `Name.spec.json` (see `SPEC-FORMAT.md`): category, APG pattern, props with intent, states, keyboard map (copy from `ACCESSIBILITY.md`, then trim/extend), tokens it will consume, compose, load-bearing rules. If you can't write the keyboard map, you don't understand the component yet — stop and read the APG pattern.
2. **Figma second.** Build the component set with the same name, properties and `State` values as the spec. Focus variant mandatory. Paste the keyboard map and ARIA role into the component description. Only variables, never raw values.
3. **Code third.** `Name.tsx` wraps the React Aria component; `Name.module.css` styles via tokens and React Aria `data-*` attributes; export from `index.ts` and the package root. Props and events use the ubiquitous language exactly.
4. **Stories.** One story per variant × size matrix (compact), one per state, one "Keyboard" story with `play` that tabs through, one per theme via the global theme toolbar. `parameters.a11y.test = 'error'`.
5. **Tests.** Unit (renders, props, name computed correctly), axe (every story), Playwright keyboard (every key in the map; asserts `activeElement` and that the focus ring is visible via `:focus-visible` match), visual snapshot optional.
6. **Docs.** `Name.mdx` with: anatomy, usage do/don't, props table (auto), keyboard table (from spec), accessibility notes, tokens table (from spec). The spec is the source; the MDX renders it.
7. **Review against the Definition of Done**, then mark `"status": "stable"` in the spec.

## Component file layout

```
src/components/<Category>/<Name>/
  Name.tsx            # export function Name(props: NameProps)
  Name.module.css
  Name.stories.tsx
  Name.test.tsx
  Name.e2e.ts
  Name.spec.json
  Name.mdx
  index.ts
```

## Code rules

- Forward `ref`; spread `...rest` onto the root; accept `className` and merge it last (consumers may add layout classes, never override tokens).
- Icon-only variants: `aria-label` is required at the type level (discriminated union).
- No layout opinions inside components (no outer margins). Layout is the parent's job (`Stack`, `Grid`).
- Never read window size in a component; responsive behaviour is CSS (`container-type` where useful).
- Every element that shows a state visually also exposes it semantically (see invariant 5).
- Hover, focus-visible and active are **browser states**, styled via React Aria `data-*` attributes — never public props. Public props exist only for states with semantics: `isDisabled`, `isInvalid`, `isSelected`, `isExpanded`, `isPending`, `isReadOnly`. Figma's `State` property covers both kinds; the spec's `figma.properties` maps which are props and which are not.
- Generic components carry no domain data or business logic. Anything vacancy-specific lives in `demo/`.
- Layout and computed-value exceptions (e.g. `calc()` on tokens, `100%`, `auto`, `0`) are allowed and documented inline; raw colours, font sizes, spacing and durations are not.
- Exported types: `NameProps`, plus any enums as string unions, re-exported from the package root.
- No default export. No barrel re-exports deeper than the package root.

## CSS rules

```css
.root {
  /* component tokens: scoped, alias semantic */
  --iz-button-bg: var(--iz-color-action-primary-bg);
  --iz-button-fg: var(--iz-color-text-on-action);
  --iz-button-padding-x: var(--iz-space-inset-md);

  background: var(--iz-button-bg);
  color: var(--iz-button-fg);
  min-block-size: var(--iz-size-target-min);
  border-radius: var(--iz-radius-md);
  transition: background var(--iz-duration-fast) var(--iz-easing-standard);
}
.root[data-hovered]       { --iz-button-bg: var(--iz-color-action-primary-bg-hover); }
.root[data-pressed]       { --iz-button-bg: var(--iz-color-action-primary-bg-active); }
.root[data-focus-visible] { outline: var(--iz-border-width-focus) solid var(--iz-color-border-focus); outline-offset: 2px; }
.root[data-disabled]      { --iz-button-bg: var(--iz-color-action-disabled-bg); --iz-button-fg: var(--iz-color-text-disabled); cursor: not-allowed; }
```

Logical properties (`inline-size`, `padding-inline`) over physical. `rem` for type, `px` tokens for spacing. `@media (prefers-reduced-motion: reduce)` is handled globally by the token build, so components don't repeat it.

## Definition of Done

A component is **stable** only when every line is true:

- [ ] Spec exists, validates against `spec.schema.json`, and matches the implemented props exactly (`npm run check:specs`).
- [ ] Figma component set exists with the same name, properties and states; focus state present; description contains role + keyboard map.
- [ ] Zero hardcoded values (stylelint passes). Only semantic/component tokens consumed.
- [ ] Renders correctly in all four themes (theme stories).
- [ ] axe passes with `wcag22aa` on every story.
- [ ] Playwright keyboard test covers every key in the spec's keyboard map.
- [ ] Focus ring visible, 3:1, not obscured, in every theme.
- [ ] Target size ≥ 24×24 CSS px (AA minimum); `size="lg"` provides the recommended 44×44 touch target.
- [ ] Verified at 320 px width and 200 % text zoom with long EN/UK labels; empty/partial content handled.
- [ ] Manifest entry in `docs/components.manifest.json` with real Figma node ID or `pending` — never an invented ID.
- [ ] Importable from `fixtures/consumer/` through the package's public exports only.
- [ ] Accessible name is derived correctly in every variant; icon-only requires `aria-label`.
- [ ] Manual screen-reader pass done and noted in `spec.a11y.screenReaderNotes`.
- [ ] MDX docs with anatomy, do/don't, keyboard table, tokens table.
- [ ] Added to `UBIQUITOUS-LANGUAGE.md` if it introduced any new word.
- [ ] Changeset written (`npx changeset`), semver respected: prop rename = major.

## Commits and versioning

Conventional commits (`feat(button): …`, `fix(modal): …`, `docs:`, `tokens:`). Changesets for versioning; one package version for the monorepo. A prop or token rename ships with a codemod in `codemods/` and a migration note in `docs/migrations/` (ODL's pattern) — from v1.0 onward.

## Working with agents

Codex reads `AGENTS.md`; Claude Code reads `CLAUDE.md`, which imports `AGENTS.md` and adds Claude-only notes. Both point here. The MCP server (`agent/server.mjs`) exposes specs and tokens; an agent must inspect existing components and tokens (`get_spec` / `list_tokens` / `search_components`) before writing a component or a page, import through public exports, and run `npm run check` before claiming a task is done. Agents never edit generated files (`design-tokens.css`, `tokens.dtcg.json`, `llms.txt`). Changing a public component API requires a rationale in `docs/decisions.md`, updated stories, manifest mapping and tests in the same change.

Instructions guide an agent; only validation enforces. Generated code is a proposal until `npm run check` output says otherwise.

## Honesty in reports

Every report (human or agent) lists checks that ran with their result, and checks that did not run as "not run". Nothing is described as passing, compliant, connected or synced without evidence from this environment. See `docs/CAPABILITIES.md`.
