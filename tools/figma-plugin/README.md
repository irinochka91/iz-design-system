# IZ tokens → Variables (Figma plugin)

Creates the `Primitives` and `Semantic` variable collections in the open Figma file from
`dist/figma/tokens.json`. Development plugin — not published, not part of the library tarball.

## Install (once)

1. `npm run build` in this repo — it writes `dist/figma/tokens.json`.
2. Figma → menu → **Plugins → Development → Import plugin from manifest…**
3. Choose `tools/figma-plugin/manifest.json`.

## Run

Open the target Figma file → **Plugins → Development → IZ tokens → Variables** → pick
`dist/figma/tokens.json` → **Import**. The panel prints what it did.

It reads a file you choose from your own disk. `networkAccess` is `none`: nothing is sent anywhere.

## What it creates

| Collection | Modes | Contents |
|---|---|---|
| `Primitives` | one, hidden from publishing | 155 variables — raw values, so designers can only pick Semantic ones |
| `Semantic` | `light`, `dark`, `hc-light`, `hc-dark`, `linen`, `linen-dark` | 116 variables, **696 alias assignments** (116 × 6) — every value in every mode points at a Primitive |

Mode names match `attribute` in `tokens/themes.config.ts`, so a Figma mode maps 1:1 to `data-iz-theme`.

**Re-running is how a token change reaches Figma.** It is idempotent: variables are matched by name,
values and aliases are updated, nothing is duplicated. A variable whose token changed `$type` is
removed and recreated, because Figma cannot change a variable's type.

## Figma plans: modes are paid

Variable **modes** are a paid feature — Starter has none, Professional allows 10 per collection,
Organization 20. The six modes here fit Professional.

The plugin degrades rather than failing: it imports every mode the plan allows, names the ones Figma
refused, and says what to do. On Starter you get all 271 variables with `light` values and one mode.
Re-running after an upgrade fills the rest in — it updates in place, so nothing is duplicated and
nothing has to be undone. Verified by running `code.js` against a mock whose `addMode` throws:
155 + 116 variables, 116 aliases, 0 raw, 0 unset, 5 modes reported as refused.

## What it cannot do, and why

- **Easing (6 tokens).** `curve/*` and `easing/*` are `cubicBezier`; Figma has no variable type for a
  curve. Set these by hand on prototype interactions. The plugin lists them as skipped — that list
  being exactly 6 is the check that nothing else was dropped.
- **Shadows and composite type styles.** Figma holds them as effect and text styles, not variables.
  `docs/figma/PHASE-1-FIGMA.md` has the manual steps.
- **Components.** It imports variables only. The Button component set is manual — a component is a
  design decision, not a data transform.

## Conversions it makes

| Token | Figma |
|---|---|
| `color` → sRGB components | `COLOR` (alpha 1) |
| `dimension` px | `FLOAT`, same number |
| `dimension` rem | `FLOAT` × 16 (16 px base) |
| `dimension` em (tracking) | `FLOAT` × 100 — Figma letter-spacing is a percentage |
| `duration` | `FLOAT` in ms |
| `number`, `fontWeight` | `FLOAT` |
| `fontFamily` | `STRING`, first family in the stack (Figma takes one name) |

Verified before first use by running `code.js` against a mock Plugin API and the real
`dist/figma/tokens.json`: 155 + 116 variables, 696 aliases, 0 raw values, 0 unset, 6 expected skips.
