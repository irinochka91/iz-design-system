# Phase 1 — Figma: variables and the Button component set

Status: **pending** (no Figma file URL was provided; Figma MCP not connected). These are exact manual steps. When done, paste the file URL and the Button component-set node ID into `docs/components.manifest.json` (`figma.url`, `figma.nodeId`) — never invent them.

Source of truth for every value below: `docs/specs/tokens.dtcg.json` (generated). Do not type values from memory; copy from that file.

## 1. File and pages

Create a Figma file **IZ Design System**. Pages, in this order: `Start here`, `Foundations`, `Components`, `Patterns`, `Product examples`, `Changelog`. (Only `Foundations` and `Components` get content in Phase 1.)

## 2. Variable collections (mirror the token tiers)

Open *Local variables* (right panel → Variables).

**Collection `Primitives`** — no modes.
Create colour variables named exactly like the token paths with `/` instead of `.`: `color/neutral/50` … `color/neutral/950`, `color/blue/50` … `color/blue/900`, `color/red/*`, `color/green/*`, `color/amber/*`, `color/white`, `color/black`. Values: the `hex` from `tokens/primitives/color.json`.
Create number variables: `space/1` = 4 … `space/16` = 64, `size/6` = 24, `size/8` = 32, `size/11` = 44, `radius-scale/1` = 4, `radius-scale/2` = 8, `radius-scale/3` = 12, `radius-scale/full` = 9999, `border-width/1` = 1, `border-width/2` = 2.
Set the scope of primitives to *hidden from publishing* (collection settings → Hide from publishing) so designers can only pick semantic variables.

**Collection `Semantic`** — modes: `Light` (default), `Dark`, `HC Light`, `HC Dark`.
Create one variable per semantic token (87; the colour ones matter first): `color/action/primary/bg`, `color/action/primary/bg-hover`, `color/action/primary/bg-active`, `color/action/primary/fg`, `color/action/secondary/*`, `color/action/danger/*`, `color/action/disabled/*`, `color/text/*`, `color/surface/*`, `color/border/*`, `color/status/*/*`.
**Every value is an alias**: click the value → the variable icon → pick the primitive. Per mode, use the `alias` field in `docs/specs/tokens.dtcg.json` → `themes.<theme>.<token>.alias` (e.g. Light `color/action/primary/bg` → `color/blue/600`, Dark → `color/blue/400`, HC Light → `color/blue/800`, HC Dark → `color/blue/300`). Never type a hex into the Semantic collection.
Number variables (no mode differences): `space/inset/sm` → `space/2`, `space/inset/md` → `space/4`, `space/inset/lg` → `space/6`, `space/inline/sm` → `space/2`, `size/target/min` → `size/6`, `size/target/md` → `size/8`, `size/target/touch` → `size/11`, `radius/md` → `radius-scale/2`, `border/width/sm` → `border-width/1`, `border/width/focus` → `border-width/2`.

Text styles (Foundations page): `Body` (Inter 16/24 Regular), `Label` (Inter 14/17 Medium), `Control` (Inter 16 Medium), `Heading` (Inter 30/36 Semibold). Bind sizes to variables where Figma allows.

## 3. Button component set (Components page)

Frame → Auto Layout, horizontal, *Hug* width, *Fixed* height bound to `size/target/md` (32). Padding left/right bound to `space/inset/md`, gap `space/inline/sm`. Corner radius `radius/md`. Stroke 1 bound to `border/width/sm`, colour `color/action/secondary/border`. Fill `color/action/secondary/bg`. Text layer "Label", style `Control`, colour `color/text/primary`.

Make it a component, then add **component properties** (right panel → +):

| Property | Kind | Values | Maps to (code) |
|---|---|---|---|
| `Variant` | Variant | `primary`, `secondary`, `tertiary`, `danger` | `variant` |
| `Size` | Variant | `sm`, `md`, `lg` | `size` |
| `State` | Variant | `default`, `hover`, `focus`, `active`, `disabled`, `pending` | browser states + `isDisabled` / `isPending` |
| `Label` | Text | "Save changes" | `children` |
| `Icon start` | Boolean + Instance swap | off | `iconStart` |
| `Icon end` | Boolean + Instance swap | off | `iconEnd` |
| `Full width` | Boolean | off | `isFullWidth` |

That is 4 × 3 × 6 = 72 variants — acceptable for the system's core control; do not add more axes.

Per variant, bind fills/strokes/text to the semantic variables exactly as `Button.module.css` does:
- `primary`: fill `color/action/primary/bg`, text `color/text/on-action`, stroke = fill. hover → `bg-hover`, active → `bg-active`.
- `secondary`: fill `color/action/secondary/bg`, stroke `color/action/secondary/border`, text `color/text/primary`; hover → `bg-hover`, active → `bg-active`.
- `tertiary`: no fill, no stroke, text `color/action/primary/fg`; hover → fill `color/action/secondary/bg-hover`.
- `danger`: as primary with `color/action/danger/*`.
- `disabled`: fill `color/action/disabled/bg`, text `color/action/disabled/fg`, stroke = fill.
- `focus` (every variant): add an outer stroke 2 (`border/width/focus`) in `color/border/focus`, positioned *outside*, with a 2 px gap — in Figma, use a second rectangle/stroke layer named "Focus ring" 4 px larger than the button on each side. The ring must be on every variant; it is the single most-forgotten state.
- `pending`: label at 0 % opacity (not hidden — mirrors `opacity: 0` in code), a 16 px "Spinner" instance centred.
- Sizes: `sm` height `size/target/min` (24), padding `space/inset/sm`, text style `Label`; `lg` height `size/target/touch` (44), padding `space/inset/lg`.

Set *Component description* to (copy verbatim):

```
Pattern: WAI-ARIA APG Button. Role: button.
Keyboard: Tab/Shift+Tab focus · Enter activates (key down) · Space activates (key up).
Focus ring: 2px outline color/border/focus, offset 2px, on every variant.
Targets: sm 24px (AA minimum) · md 32 · lg 44 (touch).
Props: variant, size, isDisabled, isPending, isFullWidth, iconStart, iconEnd; icon-only requires aria-label.
Never use for navigation (Link). Never disable submit to signal invalid form.
Spec: src/components/Actions/Button/Button.spec.json
```

## 4. Check the mirror

Switch the Semantic collection mode on a frame containing all four Button variants: Light → Dark → HC Light → HC Dark. Every fill/stroke/text must change without touching the component. If anything stays the same, that property is bound to a primitive or a raw value — fix the binding.

## 5. Export and diff

Right-click the `Semantic` collection → *Export to JSON* (if available on your plan/version). Save as `tokens/figma-export/semantic.json` and run `npm run tokens:sync` (Phase 2) to diff against the source. Until then, the manual check in step 4 is the verification.

## What this is not

A JSON export, a screenshot or these instructions are **not** a Figma component library. The manifest entry stays `pending` until the component set exists and its node ID is pasted in.
