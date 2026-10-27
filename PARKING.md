# Parking lot

Ideas noticed during a phase that belong to a later one. One line each; nothing here is a commitment.

- Phase 2: a codemod that rewrites handoff token names to canonical ones (or back), so the alias layer in ADR-009 can be retired instead of carried forever.
- Phase 2: a `Foundations/Typography` specimen story would make the four faces and nine linen roles reviewable at a glance — the fonts now load in Storybook but no story shows them.
- Phase 3: `tokens:validate` could assert that every `color.*.bg*` role has an `fg.on-*` partner, instead of the contrast script discovering it.
- Phase 3: `tokens:validate` could reject a theme file that overrides a token not in the theme's own colour/type remit, so a future theme cannot quietly widen its scope.
- Housekeeping: if the `storybook` vitest project fails with "Failed to fetch dynamically imported module … sb-vitest", delete `node_modules/.cache/storybook` — it is a stale cache, not a code failure.
- Phase 2: the Figma plugin was verified with a throwaway mock-API dry run (155 + 116 variables, 696 aliases, 0 raw, 0 unset). Make it a permanent test so a token-type change cannot silently break the import.
- Housekeeping: `docs/components.manifest.json` declares `"$schema": "./manifest.schema.json"`, which does not exist — the same class of dangling reference as `specs/ARCHITECTURE.md` was. Write the schema (and let `check:specs` validate the manifest against it) or drop the line.
- Phase 2: no `z.*` tokens exist (docs/TOKENS.md names `z.overlay | z.toast`). Menu and Toast position without z-index for now; add the scale when a second stacking context appears (Dialog over Toast).
- Phase 3: the handoff's ActionRow hover is `bg-sunken at 40%`; stylelint forbids `color-mix` by design (colours are tokens, ADR-027). The row uses opaque `color.surface.sunken`. If it reads too heavy on linen, add a `color.surface.hover` alpha token rather than a mix in CSS.

