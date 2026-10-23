# Parking lot

Ideas noticed during a phase that belong to a later one. One line each; nothing here is a commitment.

- Phase 2: `--iz-motion-spring-settle` (stiffness 260 / damping 18 / mass 1) has no DTCG type — decide between a Framer Motion config export and a `$extensions` block.
- Phase 2: a codemod that rewrites handoff token names to canonical ones (or back), so the alias layer in ADR-009 can be retired instead of carried forever.
- Phase 2: the first component to use the display or figure role must set `font-variation-settings: 'wdth' 112` and `font-variant-numeric: tabular-nums` — DTCG has no axis type, so neither can be a token today; decide between a CSS utility, a `$extensions` block, or a documented component rule.
- Phase 2: a `Foundations/Typography` specimen story would make the four faces and nine linen roles reviewable at a glance — the fonts now load in Storybook but no story shows them.
- Phase 3: `tokens:validate` could assert that every `color.*.bg*` role has an `fg.on-*` partner, instead of the contrast script discovering it.
- Phase 3: `tokens:validate` could reject a theme file that overrides a token not in the theme's own colour/type remit, so a future theme cannot quietly widen its scope.
- Housekeeping: if the `storybook` vitest project fails with "Failed to fetch dynamically imported module … sb-vitest", delete `node_modules/.cache/storybook` — it is a stale cache, not a code failure.
