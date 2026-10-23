Goal by 28 Oct: Phase 1 done (tokens, linen theme, contrast check, lint).
Goal by 8 Nov: portfolio case on Phase A. Product with testers — after the offer.

# IZ Design System

An accessible, token-first, agent-ready design system. Small on purpose: every component is built by hand, end to end, so the system is understood from the inside — and so AI agents (Claude Code, Codex, Claude Design) can consume it without guessing.

**Status:** Phase 1 done (tokens, six themes incl. `linen`, contrast gate, lint rules). Next: Phase 2 primitives — see `docs/ROADMAP.md`.

**The brief this is built against:** [`specs/HANDOFF.md`](specs/HANDOFF.md) (Job Search HQ, the second consumer). Where it conflicts with the repo, `docs/decisions.md` is the authority — the conflicts are listed in the handoff itself, above its phase-1 prompt.

## What this is

One package, one source of truth, three consumers:

| Part | For | What it is |
|---|---|---|
| `@iz/design-system` (this repo) | React apps | React components, TypeScript, CSS Modules, DTCG design tokens |
| `agent/` inside the package | AI agents (Claude Code, Codex, Claude Design) | stdio MCP spec server, `.spec.json` per component, `tokens.dtcg.json`, llms.txt |
| `demo/` | portfolio proof | a small job-search UI (vacancy list + filters, vacancy detail, application form) built only through the package's public exports |

A separate `@iz/elements` web-component package is deliberately *not* in scope for v1; the token and spec layers are built so it can be added later without renames.

This is an independently initiated concept project for learning and portfolio purposes, not client or production work. Design, specification and review decisions are the author's; code is AI-assisted and treated as a proposal until validated.

## Setup (after cloning or receiving the folder)

```bash
git init && git add -A && git commit -m "chore: phase 0 scaffold"   # once, if not yet a repo
npm install                      # exact versions from package-lock.json
# (no `playwright install` needed: tests use your installed Google Chrome — see docs/CAPABILITIES.md)
npm run check                    # lint, css lint, type-check, token checks (stubs until Phase 1), tests
npm run storybook                # http://localhost:6006
```

## Where the rules live

Read these in order — they are the system:

1. `docs/BRIEF.md` — users, scope, non-goals, inventory, authority per artefact, acceptance criteria.
2. `docs/PRINCIPLES.md` — what we borrowed from which design system, and why.
3. `docs/TOKENS.md` — token architecture (DTCG 2025.10), naming, themes, Figma mirror, sync direction.
4. `docs/ACCESSIBILITY.md` — the a11y contract: WCAG 2.2 AA, keyboard maps per category, testing.
5. `docs/UBIQUITOUS-LANGUAGE.md` — the one vocabulary for props, sizes, variants, states.
6. `docs/CONTRIBUTING.md` — how a component is built, the Definition of Done, honesty rules.
7. `docs/SPEC-FORMAT.md` — the `.spec.json` contract that the MCP server serves.
8. `docs/ROADMAP.md` — the learning phases, one inspectable increment at a time.

Living records: `docs/CAPABILITIES.md` (confirmed vs assumed tooling), `docs/decisions.md` (ADR log), `docs/learning-log.md`, `docs/components.manifest.json` (Figma ↔ code mapping, `pending` where unknown), `docs/portfolio-case-study.md` (written last).

`AGENTS.md` holds the agent rules; `CLAUDE.md` imports it with `@AGENTS.md` and adds only Claude-specific notes.

## Component categories

Mirrors ODL's taxonomy, trimmed for v1. Categories drive the folder structure, the Figma pages, the Storybook groups and the `category` field in every spec.

| Category | v1 components | A11y lesson it teaches |
|---|---|---|
| Actions | Button, IconButton, Link | focus-visible, pressed/disabled semantics, name from content |
| Inputs | TextField, TextArea, Checkbox, RadioGroup, Switch, Select, ComboBox | label association, `aria-describedby`, error announcement |
| Display | Badge, Tag, Avatar, Card | decorative vs informative, text alternatives, heading inside a card |
| Navigation | Tabs, Breadcrumb, Menu | roving tabindex, arrow keys, `aria-current` |
| Overlay | Modal, Tooltip, Popover | focus trap, Escape, focus return, `aria-modal` |
| Layout | Stack, Container, Grid | landmarks, heading order, no a11y in CSS-only layout |
| Feedback | Alert, Toast | `aria-live`, `role=status` vs `role=alert`, dismiss by keyboard |
| Template | TablePage, FormPage, DashboardPage | page landmarks, skip link, consistent help (3.2.6) |

Charts are deferred to v2 (React-only, heavy, and chart a11y is its own discipline).

## Planned structure

```
iz-design-system/                 # one npm package: @iz/design-system
├── AGENTS.md                     # agent rules (Codex and others)
├── CLAUDE.md                     # @AGENTS.md + Claude-specific notes
├── docs/                         # the rules + living records
│   └── specs/                    # built .spec.json copies + tokens.dtcg.json (ship in tarball)
├── tokens/                       # DTCG source — canonical
│   ├── primitives/  semantic/  themes/
│   └── figma-export/             # raw Figma JSON exports, diffed against source
├── src/
│   ├── components/<Category>/<Name>/
│   │   ├── Name.tsx  Name.module.css  Name.stories.tsx  Name.mdx
│   │   ├── Name.test.tsx         # Vitest + Testing Library + axe
│   │   ├── Name.e2e.ts           # Playwright keyboard tests
│   │   ├── Name.spec.json        # machine-readable contract (source)
│   │   └── index.ts
│   ├── styles/                   # design-tokens.css (generated), reset, themes
│   └── index.ts                  # the public API — the only import path for consumers
├── agent/                        # MCP server + iz-mcp-setup + gen-llms-txt (ships with the package)
├── demo/                         # job-search demo app (Vite) — consumes the package via public exports
├── fixtures/consumer/            # minimal separate consumer proving the package works through its exports
├── .storybook/
└── scripts/                      # tokens:build, check:contrast, check:specs, tokens:sync
```

## License

MIT
