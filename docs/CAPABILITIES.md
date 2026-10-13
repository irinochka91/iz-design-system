# Capabilities — confirmed vs assumed

Updated at every phase. Nothing here is "confirmed" until a command, API call or UI check actually ran. Unrun = assumed.

**Phase 0 note on environments.** The scaffold was built and verified in a cloud workspace (Linux, Node 22.22.0, npm 10.9.4) because a shell on the author's Mac was not available in that session. Everything marked *confirmed (cloud)* ran there; the same commands on the Mac are *pending* until the author runs `npm install && npm run check` locally and records the result below.

## Toolchain

| Capability | Status | Evidence / version | Fallback / note |
|---|---|---|---|
| Node / npm on the author's Mac | assumed | Node 24.18.1 reported by the desktop app; `node -v` not run in the project | `engines.node >= 22` |
| Node / npm in cloud workspace | confirmed (cloud) | Node 22.22.0, npm 10.9.4 | — |
| Git repository | **pending** | not initialised — needs `git init` on the Mac (3 commands in README → Setup) | — |
| React | confirmed (cloud) | react@19.3.0, react-dom@19.3.0 | peerDependency `^19` |
| Vite | confirmed (cloud) | vite@8.3.4 (rolldown-based) | library build OK |
| TypeScript | confirmed (cloud) | typescript@5.9.3 — **7.x deliberately not used** (Go-based compiler; ESLint/Storybook tooling not yet aligned) | revisit when typescript-eslint supports 7 |
| React Aria Components | confirmed installed (cloud) | react-aria-components@1.22.1 | not yet used by any component |
| Storybook | confirmed (cloud) | storybook@10.6.2, addon-a11y, addon-vitest, addon-docs; `build:storybook` OK | theme toolbar wired |
| Vitest unit (jsdom) + Testing Library + axe | confirmed (cloud) | vitest@5.0.4, vitest-axe@0.1.0, axe-core@4.14.0; 2 tests pass | vitest-axe's `extend-expect` is empty in 0.1.0 → matcher registered manually in `src/test/setup.ts` |
| Vitest storybook project (real Chromium) | confirmed (cloud) | 1 story passes; **negative test done**: an `<img>` without `alt` fails the run (`image-alt`) | cloud needs `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium`; Mac needs `npx playwright install chromium` |
| Playwright e2e | configured, **not run** | @playwright/test@1.64.0; no `*.e2e.ts` yet | first run in Phase 1 (Button) |
| ESLint + jsx-a11y | confirmed (cloud) | eslint@9.39.5 — **ESLint 10 not usable**: eslint-plugin-jsx-a11y@6.10.2 peer-depends on ≤ 9 | upgrade when jsx-a11y supports 10 |
| stylelint (no raw units / hex / !important) | confirmed (cloud) | stylelint@17.16.0; rules proven: flagged `!important` and `0.01ms` in the first reset draft | — |
| Style Dictionary | installed, **not run** | style-dictionary@5.6.1 | `tokens:build` implemented in Phase 1 |
| `tokens:validate`, `check:contrast`, `check:specs` | **stubs** | print "skipped … not a pass", exit 0 while `tokens/primitives` is absent | implemented in Phases 1–2 |
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
