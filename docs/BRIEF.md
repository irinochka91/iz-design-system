# Project brief

## What

A small, accessible, token-first design system: a Figma library and a matching React component library, built from one DTCG token source, documented for humans and for AI agents (Claude Code, Codex, Claude Design). Independently initiated concept project; its purpose is learning design-system engineering from the inside and producing an honest portfolio case study.

## Who it is for

- **Primary:** the author, as designer-engineer learning how real design systems are built.
- **Secondary:** AI coding agents that must build UI with the system without guessing.
- **Demo users (fictional):** job seekers browsing vacancies and applying — the demo exists to prove the system in a realistic flow, not to be a product.

## Use cases the system must support

Form-heavy flows (filters, application form with validation), list/detail navigation, modal confirmation, inline and transient feedback, responsive layouts from 320 px to desktop, English and Ukrainian content (long strings, Cyrillic typography).

## Scope (v1)

- One brand, one React implementation (React 19, TypeScript, Vite, CSS Modules, Storybook).
- Behaviour via React Aria Components on every interactive component.
- Four themes via semantic aliases: light, dark, hc-light, hc-dark. Light is built first and complete before dark; hc themes follow.
- Component inventory (target, in build order): Button, IconButton, Link · TextField, TextArea, Checkbox, RadioGroup, Switch, Select, ComboBox · Badge, Tag, Avatar, Card · Tabs, Breadcrumb, Menu · Modal, Tooltip, Popover · Stack, Container, Grid · Alert, Toast · TablePage, FormPage, DashboardPage templates.
- Demo: vacancy list with filters and a no-results state; vacancy detail; application form with validation and submission feedback. Domain components (`VacancyCard`, `FilterPanel`) live in `demo/`, never in the library.
- Agent layer: `.spec.json` per component, MCP server, `AGENTS.md`/`CLAUDE.md`, Claude Design source bundle.

## Non-goals

No backend, no auth, no real job data, no multiple framework implementations, no web-component package, no charts, no publishing to npm or to the Figma Community, no deployment — unless explicitly requested later.

## Visual direction

Calm, neutral, content-first. One accent hue for actions, one for danger, a neutral ramp carrying most of the UI. Generous targets, visible focus, restrained motion. The system should look "obviously accessible" rather than "styled around accessibility".

## Principles (short form; see PRINCIPLES.md)

Tokens before components; behaviour before visuals; WCAG 2.2 AA is the floor; one vocabulary; specs are the contract; small and finished; honest claims only.

## Authority per artefact

| Artefact | Authoritative for | Not authoritative for |
|---|---|---|
| `tokens/*.json` (DTCG, Git) | every token value and alias | — |
| Figma library | approved visual composition, layout specs, design review | behaviour, prop API, token values |
| Code (`src/`) | actual behaviour, public component API, accessibility implementation | visual approval |
| `*.spec.json` | the contract both sides are checked against | — |
| `docs/components.manifest.json` | Figma ↔ code mapping | — |

Differences between Figma and code are logged in `docs/decisions.md` and resolved by changing whichever side is *not* authoritative for that aspect.

## Milestone v0.1 (portfolio-ready first cut)

Tokens with four themes · Button, TextField, Checkbox, Card, Modal at `stable` · the same five in Figma · specs + MCP server with one recorded Claude Code test · one demo screen (application form) · consumer fixture · case study with real evidence. Defined in full in `docs/ROADMAP.md`. v0.1 is shippable to the resume on its own; everything else is 0.2+.

## Acceptance criteria (v1 done)

- Every inventory component exists in code with stable status per the Definition of Done, and in Figma or with an explicit `pending` entry in the manifest.
- The package is consumable from `fixtures/consumer/` through public exports only.
- Token build, alias/cycle/type validation and contrast checks pass for all four themes.
- Documented examples compile against the real API (`check:specs`).
- The three demo screens use the library through public exports; the list → detail → form flow works by keyboard alone.
- Recorded results exist for axe, keyboard tests, 320 px/200 % reflow, reduced motion, and a manual screen-reader spot check; audit scope and limitations are written down.
- `AGENTS.md`/`CLAUDE.md` are consistent with `docs/`; every AI-tool integration is marked tested / partially tested / untested with version.
- `docs/portfolio-case-study.md` exists with real findings, no invented metrics.
