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

## ADR-006 — A ~120-line custom token transformer instead of Style Dictionary (for now)
Problem: DTCG 2025.10 became stable in Oct 2025 with object-valued colours (`{colorSpace, components, hex}`) and dimensions (`{value, unit}`); Style Dictionary 5 reads DTCG but its handling of these object shapes and of per-theme output needed custom transforms/formats anyway.
Options: (a) Style Dictionary 5 + custom transforms; (b) a small readable script (`scripts/lib/dtcg.mjs` + `tokens-build.mjs`) that resolves aliases and emits CSS, types and a resolved DTCG snapshot.
Decision: (b). `style-dictionary` stays installed as a devDependency for a later comparison but is not on the build path.
Reason: the learning goal is to understand the pipeline, and the whole pipeline is now five small functions (flatten → resolve → cssName → toCss → write). Output is one CSS file with four theme blocks, OS bridges and reduced-motion, plus `tokens.d.ts` and `tokens.dtcg.json` for Figma/MCP/Claude Design. The source stays pure DTCG, so Style Dictionary or Terrazzo can replace the script without touching `tokens/*.json`.
Consequence: no Android/iOS outputs until needed; `tokens:validate` is our own (aliases, cycles, shapes, tier rules, theme-only-overrides-semantic).
Revisit when: a second platform output is needed, or Style Dictionary gains first-class DTCG 2025.10 colour/dimension support.

## ADR-007 — Name-collision rule between tiers
Problem: `tokens:validate` caught `radius.full` and `easing.standard` aliasing themselves — the semantic token had the same path as the primitive.
Decision: primitive groups that could share a name with a semantic role get a distinct suffix (`radius-scale.*`, `curve.*`). Semantic names describe roles (`radius.md`), primitives describe scales (`radius-scale.2`).
Consequence: the validator's cycle check is the enforcement; this ADR is the explanation future-us will look for.

## ADR-008 — Linen theme: handoff values are exact; the gaps are derived and listed
Problem: `specs/HANDOFF.md` § *Linen theme tokens* gives 19 colour roles with Light/Dark values and measured ratios. The scaffold's semantic layer has 46 colour roles, so ~27 have no handoff value — and themes may only alias primitives, so every linen colour needs a primitive first.
Options: (a) only override the 19 roles the handoff names, and let the rest fall back to the base (blue/neutral) palette — a linen page with Tailwind-blue status tints; (b) derive the missing values from the handoff's own hues and record each one.
Decision: (b). `tokens/primitives/color.linen.json` carries the palette; every entry is tagged `H` (exact handoff value) or `D` (derived) in its `$description`.
Derived (`D`), and why: status tints `crimson.100/900`, `jade.100/900`, `ochre.100/900` (the handoff gives one status colour per state, not a bg/fg/border triple); `crimson.400/500` and `crimson.700/800` (hover/active steps for the danger button, which the handoff's `-hover` half-step / `-active` two-step rule implies but does not tabulate); `jade.800`, `ochre.700` (a status *fg* on its own tint needs more contrast than the same hue on the page, where the handoff measured 4.9 and 5.3); `text.muted` and `text.disabled` (the handoff has two text levels, the scaffold has four).
Consequence: no derived value ships unchecked — `check:contrast` runs every pair in the linen themes too. The `H`/`D` tags make a later design review a filter, not a re-read.
Rejected: (a) — it would put `#2563EB` status borders on a linen page and quietly break "one accent per screen".

## ADR-009 — Handoff token names are mapped with an alias layer, not renamed
Problem: `specs/HANDOFF.md` specifies `--iz-{category}-{role}-{emphasis}-{state}` (`--iz-color-bg-accent`, `--iz-space-400`). `docs/TOKENS.md` specifies `category.concept.property.variant.state` (`--iz-color-action-primary-bg`, `--iz-space-inset-md`). Both are already written against: the handoff's nine pattern specs use the first, the existing `Button.module.css` and four themes use the second.
Options: (a) rename the scaffold to the handoff scheme (breaks Button, four themes, `tokens.d.ts`, `docs/TOKENS.md`, package exports); (b) keep the scaffold and record the mapping in prose only (the handoff's pattern code would not compile); (c) keep the scaffold as canonical and emit the handoff names as an alias layer.
Decision: (c), per the review call on 2026-10-23. Canonical names stay the source of truth; `tokens/semantic/*.handoff.json` and `color.pairs.json` alias them. One override point per role: a theme overrides the canonical token and the alias follows.
Enforced by `tokens:validate`: only `*.pairs.json` / `*.handoff.json` may alias semantic → semantic, and a theme may never override an alias-layer token (it would fork the pair).
Three handoff names cannot be emitted verbatim, because the DTCG path is already a group and a path cannot be both a group and a token:

| Handoff | Emitted as | Why |
| --- | --- | --- |
| `--iz-color-text` | `--iz-color-text-primary` | `color.text` is a group (`primary`, `secondary`, `muted`, …) |
| `--iz-color-border` | `--iz-color-border-default` | `color.border` is a group (`default`, `strong`, `focus`, `danger`) |
| `--iz-color-brand` | `--iz-color-brand-bg` | `color.brand` is a group, so the mark colour gets its on-pair |
| `--iz-color-status-success` / `-warning` | `--iz-color-text-success` / `-warning` | `color.status.success` is already a bg/fg/border group; `--iz-color-status-critical` maps to `--iz-color-text-danger` for symmetry |
| `--iz-font-body` (composite) | `--iz-font-body-size`, `-line-height`, `-weight`, `-family` | a CSS custom property cannot be partially consumed; the scaffold's per-property pattern is kept |

Consequence: `--iz-color-bg-accent` and `--iz-color-action-primary-bg` are both real and always equal. A codemod to one scheme stays possible; see the governance row in the handoff's system-areas table.

## ADR-010 — The handoff's type/space/radius/motion live in the base semantic layer, not in the linen theme
Problem: the handoff's Type, Space, Radius and Motion tables give one value each, not a Light/Dark pair — only the colour table has two columns.
Decision: those roles go into the base semantic layer (`scale.handoff.json`, new type roles in `typography.json`); `linen.json` / `linen.dark.json` override colour, plus the three type roles that collide with the base Inter scale (`font.body`, `font.label`, `font.heading`).
Reason: the scaffold's theme model is "themes re-alias colour roles"; forcing non-colour tokens through a theme file would mean every future theme has to restate the space scale.
Consequence: `--iz-space-400` = 16 px in every theme. Line-height stays a unitless number (`line-height.147` = 1.4667 for the handoff's 15/22) rather than a px `leading.*` dimension, so a theme override never changes a token's `$type`.
Not tokenised: `--iz-motion-spring-settle` (stiffness 260 / damping 18 / mass 1). DTCG has no spring type; it is a motion-library config, so it stays in the motion spec for Phase 2. Letter-spacing needed a new dimension unit — `em` is now accepted by `tokens:validate` alongside `px`/`rem`.

## ADR-011 — `tokens/themes.config.ts` is the theme registry, and themes may extend each other
Problem: the theme list was hardcoded in three places (`THEMES` in `scripts/lib/dtcg.mjs`, the theme blocks in `tokens-build.mjs`, the `hc-` prefix test in the contrast script). The handoff also asks for `themes.config.ts` and for `linen.dark` to be an override of `linen`, not of the base.
Decision: one typed registry, `tokens/themes.config.ts`, holding id, attribute, file, `extends`, `colorScheme`, `contrast` target and OS bridge. `scripts/lib/dtcg.mjs` imports it with a plain `import` — Node 22.23 strips the types, so there is no build step and the same file is the app's type source. `loadTheme` applies every override file in the extends chain, outermost ancestor first.
Consequence: adding a theme is one entry; validate, build and contrast pick it up with no other edit. `linen.dark.json` holds colour only (47 roles) and inherits linen's type from its parent. `tokens-build.mjs` emits, per theme, exactly the tokens that theme's chain overrides — which is why linen can override type where the older themes override only colour.
Attribute: the generated CSS carries **both** `[data-theme='x']` (docs/TOKENS.md, already used by Storybook's toolbar) and `[data-iz-theme='x']` (the handoff's `<html data-iz-theme="linen">`). Two selectors on one rule costs nothing and neither spec has to move. The OS bridges require that neither attribute is set.

## ADR-012 — Contrast coverage is derived from the on-pair rule, and it is a test
Problem: a hand-written pair list silently stops covering the system the moment someone adds a background role.
Decision: `tokens/contrast-pairs.json` has two sections — `pairs` (combinations no convention implies: text levels, borders, the focus ring) and `onPairs` (each `color.fg.on-*` token and the background roles it partners). `scripts/check-contrast.ts` fails if any background role (`color.surface.*`, `*.bg`, `*.bg-*`, excluding the alias layer) has no `onPairs` entry, or if an `fg.on-*` token is listed nowhere. Thresholds come from each theme's `contrast` field. `kind: 'exempt'` is reported but never fails — WCAG exempts disabled controls.
Consequence: 288 graded pairs across 6 themes (+6 exempt). Adding a background without its foreground fails `npm test`, verified with a throwaway `color.action.tertiary.bg`.
Wired into `npm test` as `src/test/contrast.test.ts` (one assertion per theme) rather than as a shell step, so a failure names the theme and prints the offending pairs next to the component tests. `npm run check:contrast` stays as the CLI.
**The focus ring is checked against surfaces only.** Adding `border.focus` on `action.primary.bg` failed at 1.00:1 in linen and hc-light — the ring and the accent are the same token by design. The handoff specifies a 2 px outline with a 2 px *offset*, so a band of surface always separates ring and component and there is no ring/component adjacency to measure. The pair is removed with that reasoning recorded in `contrast-pairs.json`; if a ring is ever drawn flush on a component, it comes back and the ring needs a contrasting inner halo.

## ADR-013 — `iz/no-raw-colors` and `iz/no-raw-spacing` as a local ESLint plugin; CSS stays with stylelint
Problem: the handoff's rule 4 is "a hex or px in app code fails the build", and ESLint cannot see inside `.css` files without an extra language plugin.
Decision: `tools/eslint-plugin-iz/` (two rules, no dependencies) covers TS/TSX by reading every string and template literal — so `style={{ color: '#ff0000' }}`, a tagged template and a stray `'16px'` prop default are all caught. `.stylelintrc.json` already covers CSS with `color-no-hex`, `color-named: never`, `function-disallowed-list` and `unit-disallowed-list`; that division is kept rather than adding `@eslint/css`.
Exempt paths: `tokens/`, `scripts/`, `tools/`, `*.test.*`, `*.e2e.ts`, `*.stories.tsx`, config files — the places where a raw value is the subject rather than a mistake.
Consequence: `npx eslint` on a file containing `color: '#ff0000'` errors; so does `npx stylelint` on a `.css` file containing `color: #ff0000`. No existing file in the repo trips either rule.

## ADR-014 — The CSS alias layer is emitted as `var(--iz-canonical)`, never as a resolved value
Problem: `tokens-build.mjs` writes, per theme, only the tokens that theme's chain overrides — correct for an override file, wrong for the alias layer. An alias-layer token (`--iz-color-bg-accent`, `--iz-color-fg-on-accent`, `--iz-color-text-subtle`) is overridden by no theme, so a resolved literal on `:root` froze the base value: in linen, `--iz-color-action-primary-bg` was `#2B3FBF` while `--iz-color-bg-accent` was still base blue `#1D4FD7`. Silent — the variable existed and held a plausible colour.
Found by the reviewed-token-change demo (docs/learning-log.md, Phase 1), not by a test.
Options: (a) include, in each theme block, every alias-layer token whose target that theme overrides; (b) emit alias-layer tokens as `var(--iz-<canonical>)`.
Decision: (b). Declared once on `:root`, the alias follows its target into every theme the way custom properties are meant to — and `dist/css/<theme>.css`, which emits every token, stays self-consistent because the canonical sits in the same block.
Consequence: no code path can emit a literal for an alias-layer token, so the bug class is gone by construction rather than guarded by a test. Verified: `--iz-color-bg-accent` resolves to the same hex as `--iz-color-action-primary-bg` in all six themes.
Rejected: (a) — it would have worked, and would have had to be re-derived correctly for every future theme and every new alias.

## ADR-015 — Figma export carries collections and modes in `$extensions`
Problem: `dist/figma/tokens.json` put collection and mode metadata in top-level keys, while specs/HANDOFF.md asks for `$extensions`, and a plain top-level key makes the file something neither a DTCG reader nor a Figma plugin can be pointed at.
Decision: one vendor key, `$extensions["design.iz.figma"]`, holds `format`, the two collections, their modes and the default mode; each Semantic token carries `$extensions["design.iz.figma"].modes.<mode>` with the `alias` to enter in Figma and the `resolved` value to check against. `$value` is the default (light) mode so the file still reads as DTCG.
The CSS alias layer is **excluded** from the export: 118 Semantic variables, not 162. In Figma there is one variable per canonical token; a second variable aliasing it would be a duplicate maintained by hand, which is exactly what the alias layer exists to avoid in code.
Consequence: mode names match `attribute` in `tokens/themes.config.ts` (`light`, `dark`, `hc-light`, `hc-dark`, `linen`, `linen-dark`), so a Figma mode maps 1:1 to `data-iz-theme`. Still unverified against a real Figma import — `docs/figma/PHASE-1-FIGMA.md` stays `pending` until a file exists and its node IDs are in the manifest.

## ADR-016 — `dist/` is generated and never committed; the build order is vite first, tokens second
Problem: two generators write into the same directory. `vite build` empties `dist/` before it writes `index.js`, `styles.css` and the `.d.ts` files, while `tokens:build` writes `dist/design-tokens.css`, `dist/css/<theme>.css`, `dist/ts/tokens.d.ts` and `dist/figma/tokens.json`. Running them in the wrong order silently deletes the token outputs — `npm run build` did exactly that, and nothing noticed.
Decision: `dist/` stays in `.gitignore` — it is not committed, reviewed or diffed (2026-10-23 review call). `npm run build` is `vite build && npm run build:tokens && node scripts/check-package.mjs`, in that order, because vite is the one that empties the directory.
The committed generated files stay committed: `src/styles/design-tokens.css`, `src/styles/tokens.d.ts` and `docs/specs/tokens.dtcg.json`. They are what Storybook, `check:specs` and the future MCP server read without a build step. `dist/` is only the tarball, so a consumer or CI runs `npm run build` first.
`scripts/check-package.mjs` asserts that every path `package.json` promises exists after the build. It immediately found one that never did: `exports["./tokens.css"]` pointed at `./dist/design-tokens.css`, which no generator wrote — `import '@iz/design-system/tokens.css'` would have failed for every consumer. `tokens:build` now writes that file, and two useful exports were added: `./css/*` (one theme on its own, e.g. `@iz/design-system/css/linen.css`) and `./figma.json`.
Consequence: a renamed or moved output fails the build instead of shipping a broken tarball.

## ADR-017 — The library names typefaces; the consumer loads them
Problem: `specs/HANDOFF.md` specifies Space Grotesk, IBM Plex Mono and Archivo (wdth 112) for linen, and Inter for the base theme. Phase 1 created the `font.family.*` tokens but nothing loaded a single face, so every linen review was looking at the fallback stack — the typography was specified and invisible.
Options: (a) vendor the `.woff2` files into the repo and ship `@font-face` from the library; (b) declare `@font-face` in the library pointing at paths the consumer provides; (c) name the faces in tokens, document the loading contract, and let the consumer load them.
Decision: (c). All three faces are OFL, so (a) is legally fine — but a library that ships fonts takes over decisions that belong to the app: subsetting, self-hosting vs CDN, `font-display`, preload order, and the app's Content-Security-Policy. It also doubles the tarball for consumers who already load Inter. (b) is the worst of both: a hard dependency on a path the library cannot verify.
Consequence: `docs/TOKENS.md § Fonts` is the contract — which face, which weights, which axis, per theme. Storybook loads all four from Google Fonts in `.storybook/preview-head.html` so a design review sees the real typefaces; that file is Storybook-only and ships with nothing.
Known gap, parked: a variable font renders at its default width unless the element sets `font-variation-settings: 'wdth' 112`, and figures need `font-variant-numeric: tabular-nums`. DTCG has no axis type, so neither is a token yet; the first component to use the display or figure role sets both in CSS.

## ADR-018 — The Figma mirror is imported by a plugin, not typed in
Problem: ADR-004 makes Git canonical and Figma a mirror that has to be re-entered. With six themes that mirror is 271 variables and 696 per-mode alias assignments. Typed by hand that is hours of work, it has to be redone after every token change, and a wrong alias is invisible — the variable shows a plausible colour in the mode you are looking at and the wrong one in the other five.
Options: (a) type them in, following `docs/figma/PHASE-1-FIGMA.md`; (b) the Figma Variables REST API, which needs a personal access token with file-write scope; (c) a development plugin that reads `dist/figma/tokens.json` from the user's own disk.
Decision: (c), `tools/figma-plugin/`. `networkAccess: none` — the file is chosen locally and nothing is transmitted, so no token and no credential handling. (b) was rejected because it puts a long-lived write-scoped token into the loop for a job that runs a handful of times.
The plugin is idempotent: variables are matched by name, values and aliases updated, nothing duplicated. That makes "re-run the plugin" the answer to the manual-step problem in ADR-004 — the Figma side of a token change goes from an hour of re-entry to one click.
Scope, deliberately: variables only. Easing (`cubicBezier`, 6 tokens) has no Figma variable type; shadows and composite text styles are effect/text styles, not variables; and the Button component set stays manual, because a component is a design decision, not a data transform.
Verification without Figma: `code.js` was run against a mock Plugin API and the real `dist/figma/tokens.json` — 155 Primitives + 116 Semantic variables, 696 alias assignments (116 × 6), **0 raw values and 0 unset modes**, 6 expected skips. The zero-raw count is the meaningful one: it proves every semantic value in every mode found a real primitive to point at. Still unverified inside Figma itself; `docs/figma/PHASE-1-FIGMA.md` stays `pending` until a file exists.
