# Capabilities — confirmed vs assumed

Updated at every phase. Nothing here is "confirmed" until a command, API call or UI check actually ran. Unrun = assumed.

**Phase 0 note on environments.** The scaffold was built in a cloud workspace (Linux, Node 22.22.0) and then verified on the author's Mac on 2026-10-15: `npm run check` passed end to end (lint, css lint, type-check, stubs, Vitest unit 2/2, Vitest storybook 1/1 in the installed Google Chrome). Two environment fixes were needed on the Mac and are recorded below: Node 20.4 → 22.23.3, and Playwright's Chromium download refused on macOS 12 → installed Chrome via `channel: 'chrome'`.

## Toolchain

| Capability | Status | Evidence / version | Fallback / note |
|---|---|---|---|
| Node / npm on the author's Mac | **confirmed (Mac)** | Node 22.23.3 (installed 2026-10-15 from nodejs.org .pkg; the previous 20.4.0 failed on `import … with { type: 'json' }` in stylelint) | `engines.node >= 22` |
| Node / npm in cloud workspace | confirmed (cloud) | Node 22.22.0, npm 10.9.4 | — |
| Git repository | confirmed (Mac) | `git init` + first commit run by the author | — |
| React | confirmed (cloud) | react@19.3.0, react-dom@19.3.0 | peerDependency `^19` |
| Vite | confirmed (cloud) | vite@8.3.4 (rolldown-based) | library build OK |
| TypeScript | confirmed (cloud + Mac) | typescript@5.9.3 — **7.x deliberately not used** (Go-based compiler; ESLint/Storybook tooling not yet aligned) | revisit when typescript-eslint supports 7 |
| React Aria Components | confirmed installed (cloud) | react-aria-components@1.22.1 | not yet used by any component |
| Storybook | confirmed (cloud + Mac) — `.storybook/vitest.setup.ts` removed: addon-vitest ≥ 10.3 applies preview annotations itself | storybook@10.6.2, addon-a11y, addon-vitest, addon-docs; `build:storybook` OK | theme toolbar wired |
| Vitest unit (jsdom) + Testing Library + axe | confirmed (cloud + Mac) | vitest@5.0.4, vitest-axe@0.1.0, axe-core@4.14.0; 2 tests pass | vitest-axe's `extend-expect` is empty in 0.1.0 → matcher registered manually in `src/test/setup.ts` |
| Vitest storybook project (real browser) | confirmed (cloud) | 1 story passes; **negative test done**: an `<img>` without `alt` fails the run (`image-alt`) | **Author's Mac runs macOS 12 Monterey; Playwright 1.64 no longer downloads Chromium for it** (`npx playwright install chromium` fails: "does not support chromium on mac12"). Config therefore uses the installed Google Chrome (`channel: 'chrome'`) by default; `PW_CHROMIUM_PATH` overrides (cloud). **Mac run: confirmed 2026-10-15**, 1/1 story in Chrome |
| macOS version | confirmed | macOS 12 (from the Playwright install error) | tests depend on the installed Chrome's version — recorded per run |
| Playwright e2e | confirmed (cloud) | 3/3 Button keyboard tests (focus ring, target sizes, disabled tab order) | Mac run pending |
| ESLint + jsx-a11y | confirmed (cloud + Mac) | eslint@9.39.5 — **ESLint 10 not usable**: eslint-plugin-jsx-a11y@6.10.2 peer-depends on ≤ 9 | upgrade when jsx-a11y supports 10 |
| stylelint (no raw units / hex / !important) | confirmed (cloud + Mac) | stylelint@17.16.0; rules proven: flagged `!important` and `0.01ms` in the first reset draft | — |
| Token pipeline | confirmed (cloud) | own transformer `scripts/lib/dtcg.mjs` (ADR-006); style-dictionary@5.6.1 installed but not on the build path | — |
| `tokens:validate` | confirmed (cloud) | 92 primitive + 87 semantic, 4 themes, aliases/cycles/shapes/tiers checked; caught 2 real errors | — |
| `check:contrast` | confirmed (cloud) | 116 pairs × 4 themes; caught 1 real miss (4.44:1) | — |
| `check:specs` | confirmed (cloud, minimal) | required fields, tokens exist, tokens ↔ CSS, keyboard map, focus state; caught 4 unlisted tokens | prop ↔ TypeScript cross-check in Phase 2 |
| Changesets | installed, not run | @changesets/cli@3.0.3, `.changeset/config.json` | first changeset at Button |
| npm audit | 1 high (dev-only) | `braces@3.0.3` via stylelint → micromatch (ReDoS/stack exhaustion in glob parsing). Not in the published bundle | re-check on next stylelint release |

## Design tooling and AI integrations

| Capability | Status | Evidence | Fallback |
|---|---|---|---|
| Figma file | pending | no URL provided | local work; exact manual steps; manifest `pending` |
| Figma plan / seat | unknown | — | assume Starter/Professional |
| Figma native variable export (Export to JSON) | assumed | per Figma help | manual re-entry |
| Figma Code Connect | assumed unavailable | requires Organization/Enterprise | manifest + naming parity; never called "Code Connect" |
| Figma MCP server (remote) | assumed available, rate-limited | Starter 6 calls/month | own `iz-specs` MCP server is primary |
| Claude Code `CLAUDE.md` with `@AGENTS.md` import | assumed | to verify at first Claude Code run | duplicate rules |
| Claude Design import / `/design-sync` | untested | — | documented source bundle |
| Codex `AGENTS.md` | assumed | convention | — |
| Screen readers | VoiceOver assumed on macOS; NVDA unavailable | — | virtual screen reader + VoiceOver spot checks |

## Honesty rules (apply to every report)

- A check that did not run is reported as "not run", never as passing. A stub that exits 0 is labelled "skipped — not a pass".
- A JSON mapping is a manifest, not Code Connect. A screenshot, SVG, HTML export or JSON file is not a Figma component library.
- An MCP connection does not imply automatic or bidirectional sync.
- Generated code is a proposal; compliance is shown only by validation output.
