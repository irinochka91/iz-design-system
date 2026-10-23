# Parking lot

Ideas noticed during a phase that belong to a later one. One line each; nothing here is a commitment.

- Phase 2: `--iz-motion-spring-settle` (stiffness 260 / damping 18 / mass 1) has no DTCG type — decide between a Framer Motion config export and a `$extensions` block.
- Phase 2: a codemod that rewrites handoff token names to canonical ones (or back), so the alias layer in ADR-009 can be retired instead of carried forever.
- Phase 2: `@font-face` / font loading for Space Grotesk, IBM Plex Mono and Archivo (wdth 112) — tokens name the faces, nothing loads them yet.
- Phase 3: `tokens:validate` could assert that every `color.*.bg*` role has an `fg.on-*` partner, instead of the contrast script discovering it.
- Phase 2: Storybook's theme toolbar (`.storybook/preview.ts`) still lists four themes and sets only `data-theme` — linen and linen-dark are built but not selectable in Storybook.
- Phase 2: `dist/` is gitignored, so `dist/css/*.css` and `dist/figma/tokens.json` are build-only; decide whether the Figma mirror should be committed like `docs/specs/tokens.dtcg.json` is.
- Housekeeping: if the `storybook` vitest project fails with "Failed to fetch dynamically imported module … sb-vitest", delete `node_modules/.cache/storybook` — it is a stale cache, not a code failure.
