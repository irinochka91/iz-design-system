# Learning log

One entry per phase. Format: concept · traced example · my exercise · what I can now explain.

## Phase 0 — environment and contract

- **Concept:** guard-rails are the design system. Before a single component exists, the repo already enforces: no raw units/colours/`!important` in CSS (stylelint), no inline styles and jsx-a11y strict (ESLint), every story is an axe test that fails CI (`a11y.test: 'error'`), strict TypeScript, public API only through `src/index.ts`.
- **Traced example:** the first draft of `reset.css` contained a `prefers-reduced-motion` block with `0.01ms !important`. stylelint rejected it. The fix was not an exception — it was moving reduced-motion into the token layer (duration tokens → 0), exactly as `TOKENS.md` already said. The tool caught a rule the human had just broken.
- **Negative test:** an `<img>` without `alt` injected into the Welcome story made `vitest --project storybook` fail with `image-alt`. A green test suite that cannot go red proves nothing; now we know this one can.
- **My exercise:** *(pending — see the Phase 0 report)*
- **I can now explain:** *(pending — the author fills this in at the checkpoint)*
