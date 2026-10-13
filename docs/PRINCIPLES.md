# Principles — what we borrowed, from whom, and why

This system is not invented from scratch. Each rule below names the design system or standard it comes from, so that when a rule feels arbitrary you can go read the original reasoning. Rules without a source are our own.

## 1. One source of truth, many outputs — from ODL, Adobe Spectrum, Style Dictionary

Tokens live once, as DTCG JSON (`tokens/`). Everything else is generated: `design-tokens.css`, Figma variables, TypeScript token types, the `list_tokens` MCP tool. If a value is typed by hand anywhere except the token source, it is a bug.

*Why:* the moment Figma and code each have their own copy of "primary blue", they drift. DTCG 2025.10 is now a stable spec that Figma, Tokens Studio, Style Dictionary and Terrazzo all read, so the interchange format is no longer a bet.

## 2. Three tiers of tokens, aliases never resolved — from ODL, Atlassian, Salesforce Lightning

Primitive → semantic → component. Components only ever consume semantic (or their own component) tokens; never primitives. The semantic tier is where themes live: light/dark/high-contrast change *which primitive a semantic token points to*, not the components.

*Why:* this is what makes a theme a 50-line file instead of a fork of every component. Figma mirrors this exactly: one collection per tier, modes on the semantic collection only.

## 3. Accessibility is a behaviour spec, written before the visual — from GOV.UK, WAI-ARIA APG, React Aria

Every interactive component starts as a keyboard map and an ARIA contract (`docs/ACCESSIBILITY.md`), taken from the WAI-ARIA Authoring Practices pattern it implements. The Figma component must have a `focus` state, and the spec must name the pattern. We build on React Aria Components because it implements APG patterns most strictly (including `aria-activedescendant`, focus restoration and mobile screen readers), and we only add styling.

*Why:* GOV.UK's lesson is that accessibility retrofitted onto finished visuals is always incomplete. Designing the keyboard model first makes it structural.

## 4. WCAG 2.2 AA is the floor, not the goal — from GOV.UK, Deque

Every component meets WCAG 2.2 AA. The high-contrast themes meet AAA for contrast. The four WCAG 2.2 criteria that directly affect component design are built into the Definition of Done: **2.4.11 Focus Not Obscured** (sticky headers and toasts must never cover the focused element), **2.5.8 Target Size** (24×24 CSS px minimum; we use 44×44 on touch by default), **2.5.7 Dragging Movements** (every drag has a non-drag alternative), **3.3.7 Redundant Entry** (forms don't ask twice). 2.4.13 Focus Appearance is AAA but we meet it anyway: a 2px solid ring with 3:1 contrast against adjacent colours, with offset so it's never clipped.

## 5. Headless behaviour, owned styling — from Radix, React Aria, shadcn

The component library owns the visual layer completely (CSS Modules, tokens). Behaviour is delegated to a headless library. We don't fork behaviour and we don't wrap styling libraries.

*Why:* keyboard and screen-reader behaviour is the hardest thing to get right and the easiest to break with a "small fix". Owning it ourselves would be the learning exercise, but not the production answer. We read React Aria's source to learn; we don't rewrite it.

## 6. A shared vocabulary — from ODL's Ubiquitous Language, Polaris, Atlassian

`variant`, `size`, `isDisabled`, `tone` mean the same thing on every component. Size scale is `sm | md | lg` everywhere. See `docs/UBIQUITOUS-LANGUAGE.md`.

*Why:* agents (and people) guess prop names from the components they've already seen. Consistency is what makes the guess right.

## 7. Machine-readable specs, served on demand — from ODL

Every component ships a `.spec.json`: props with intent, tokens consumed, a11y contract, keyboard map, compose relationships, "load-bearing rules" that aren't obvious from the source. An MCP server (`agent/server.mjs`, shipped inside the package) serves them: `get_spec`, `find_by_a11y_role`, `find_by_token`, `list_tokens`, `get_template`.

*Why:* an agent that loads the whole repo into context guesses; an agent that queries `get_spec("Modal")` gets the focus-return rule and the `aria-modal` requirement as facts. This is the "agents" half of the project.

## 8. Page templates are the agent's starting point — from ODL, shadcn registry

A small set of full-page compositions (`TablePage`, `FormPage`, `DashboardPage`) exist as copyable scaffolds. An agent asked for "an employee list page" starts from `TablePage`, not from a blank file.

## 9. Figma mirrors code, not the other way around — from Figma Code Connect, Spectrum

Figma components carry the same names, the same property names and the same variants as the React components. Component descriptions in Figma hold the ARIA role and keyboard map. When the plan allows, Code Connect links each Figma component to its React source so Dev Mode and the Figma MCP server show real code. Until then, naming parity is the link.

## 10. Every component is tested four ways — from ODL, Storybook, Deque

Unit (Vitest + Testing Library), automated a11y (axe via `@storybook/addon-a11y` with `a11y.test: 'error'`), keyboard (Playwright pressing real keys), and a manual screen-reader pass recorded in the spec. Contrast is checked by script across every theme.

## 11. Small, finished, documented — ours

Ten finished components beat seventy half-done ones. A component is not "in the system" until it meets the Definition of Done in `docs/CONTRIBUTING.md`. Nothing ships with `TODO` in its a11y section.

## 12. Prototype-grade is not an excuse — ours, contra ODL's disclaimer

ODL ships with "not for production". We don't: the component count is small enough to hold production quality, and the learning goal is to know what production quality *is*.

## Reference systems (read these, don't copy them)

GOV.UK Design System (accessibility rigour, research-backed patterns), Adobe Spectrum / React Aria (behaviour correctness), Atlassian Design System (token architecture, naming), Shopify Polaris (content & UX writing), Radix Themes (headless + styling split), Material 3 (motion & state layer language), shadcn/ui (copy-in registry model), ODL (spec + MCP model, categories).

## Sources consulted for the 2026 state of standards

- [Design Tokens Technical Reports 2025.10](https://www.designtokens.org/tr/2025.10/) — DTCG format stable since 28 Oct 2025; Resolver module (themes/modes) still a draft.
- [DTCG Format module (draft)](https://www.designtokens.org/tr/drafts/format/) — `$value`/`$type`/`$description`/`$extensions`/`$deprecated`, aliases `{group.token}`, dimension as `{value, unit}`, colour as `{colorSpace, components, hex}`.
- [DTCG Resolver module (draft)](https://www.designtokens.org/tr/drafts/resolver/) — sets, modifiers, contexts for light/dark.
- [What's New in WCAG 2.2 (W3C WAI)](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) — the nine new criteria; 4.1.1 Parsing removed.
- [Storybook accessibility testing (10.x)](https://storybook.js.org/docs/writing-tests/accessibility-testing) — `addon-a11y` + Vitest addon, `parameters.a11y.test`.
- [Style Dictionary — tokens](https://styledictionary.com/info/tokens/) — DTCG input, `include`/`source` theming.
- [Figma Code Connect](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect) — Organization/Enterprise plans only; template-based CLI.
- [Figma MCP server](https://help.figma.com/hc/en-us/articles/35794667554839) — remote server on all plans (Starter: 6 calls/month), desktop server needs Dev/Full seat on a paid plan; works with Claude Code.
- [React Aria vs Radix 2026 (PkgPulse)](https://www.pkgpulse.com/guides/react-aria-vs-radix-primitives-2026) — React Aria for strict APG/mobile SR; Radix for speed.
- [Figma token workflow plugins 2026 (Atomize)](https://atomize.tools/blog/figma-plugins-design-system-token-workflows/) — one collection per tier, keep aliases, modes for light/dark, keep a manual export path.
- [Design tokens 2026 W3C format guide](https://blog.codercops.com/blog/design-tokens-2026-w3c-format-guide) — alias, don't duplicate.
