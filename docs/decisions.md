# Decisions (ADR log)

Format: problem · options · decision · reason · consequence · revisit when.

## ADR-001 — Single package with `agent/` inside, not a monorepo
Problem: ODL ships three packages; we want the MCP/spec layer but minimal infrastructure.
Options: (a) npm-workspaces monorepo like ODL; (b) one package with `agent/` folder shipped in the tarball.
Decision: (b).
Reason: learning and portfolio scope; one lockfile, one build, one version. The agent code is small.
Consequence: the MCP server is installed with the library (`node node_modules/@iz/design-system/agent/server.mjs`). If a web-component package is ever added, we migrate to workspaces then.
Revisit when: a second runtime package is needed.

## ADR-002 — React Aria Components for every interactive component
Problem: native HTML + a headless lib only for complex widgets vs one behaviour library everywhere.
Options: (a) native elements for Button/TextField/Checkbox, React Aria for Dialog/Tabs/Select; (b) React Aria for everything.
Decision: (b).
Reason: one consistent API (`onPress`, `isDisabled`, `data-*` state attributes) across all components; mobile screen-reader and press handling are already solved; the learning goal includes reading how a strict APG implementation works.
Consequence: a hard runtime dependency (`react-aria-components`), documented as a peer dependency; slightly larger bundle; we must not re-implement behaviour on top.
Revisit when: bundle size becomes a constraint, or a component's native semantics are strictly better (e.g. native `<select>` on mobile — then wrap, don't replace).

## ADR-003 — Four themes in v1 scope
Problem: light+dark is enough for the demo; hc themes double contrast work.
Options: (a) light + dark; (b) light, dark, hc-light, hc-dark.
Decision: (b), built in that order; light must be complete before dark starts.
Reason: the high-contrast themes are the strongest accessibility evidence for the portfolio and force the semantic layer to be done properly.
Consequence: every component is checked in four themes; `check:contrast` runs AAA thresholds on hc themes.
Revisit when: time runs out — hc themes can be cut to "documented, partially implemented" without touching components.

## ADR-004 — Token sync direction: Git → Figma, with Figma exports reviewed as PRs
Problem: both tools can hold tokens; bidirectional sync drifts.
Decision: `tokens/*.json` in Git is canonical. Figma variables are imported/re-entered from it. Changes made in Figma are exported to `tokens/figma-export/`, diffed by `tokens:sync`, and applied to the source by a reviewed commit.
Consequence: a Figma-originated change is never "live" until merged.

## ADR-005 — Target size
Decision: WCAG 2.2 AA minimum is 24 × 24 CSS px (2.5.8); `size="lg"` is 44 px as a recommended touch target. Documentation never calls 44 px the AA minimum.
