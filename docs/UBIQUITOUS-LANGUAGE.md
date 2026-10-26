# Ubiquitous language

One vocabulary across React props, CSS tokens, Figma properties, specs and docs. If a word isn't here, propose it here first.

## Prop names (React) ↔ Figma property names

| Concept | React prop | Figma property | Values |
|---|---|---|---|
| Visual importance | `variant` | `Variant` | `primary \| secondary \| tertiary \| ghost \| danger` (Actions); `outlined \| filled` (Inputs); `surface \| raised` (Display containers — which surface token the box sits on) |
| Size | `size` | `Size` | `sm \| md \| lg` — never `small/medium/large`, never `xs` unless added here |
| Semantic colour | `tone` | `Tone` | `neutral \| info \| success \| warning \| danger` (Display, Feedback) |
| Visual emphasis (no semantic meaning) | `emphasis` | `Emphasis` | `quiet \| tint \| strong` (Chip; one accent per screen — `strong` is the single highlight) |
| Disabled | `isDisabled` | `State = disabled` | boolean |
| Read-only | `isReadOnly` | `State = read-only` | boolean |
| Required | `isRequired` | `Required` | boolean |
| Invalid | `isInvalid` + `errorMessage` | `State = invalid` | boolean + string |
| Selected (controlled) | `isSelected` / `defaultSelected` | `Selected` | boolean |
| Open (controlled) | `isOpen` / `defaultOpen` | `Open` | boolean |
| Loading | `isPending` | `State = pending` | boolean (React Aria's term) |
| Icon slots | `iconStart` / `iconEnd` | `Icon start` / `Icon end` | ReactNode / instance swap |
| Icon only | `aria-label` **required** | `Label` (hidden) | string |
| Label text | `label` | `Label` | string |
| Help text | `description` | `Description` | string |
| Orientation | `orientation` | `Orientation` | `horizontal \| vertical` |
| Full width | `isFullWidth` | `Full width` | boolean |
| Children | `children` | — | — |

Boolean props are `is*` (React Aria convention). Event handlers are `on*` with React Aria names: `onPress` (not `onClick`), `onChange`, `onSelectionChange`, `onOpenChange`.

## State names (everywhere)

`default · hover · focus · active · disabled · invalid · pending · selected · read-only`
Figma uses a single `State` property with these values. CSS uses data attributes from React Aria (`data-hovered`, `data-focus-visible`, `data-pressed`, `data-disabled`, `data-invalid`, `data-selected`) — never `:hover` alone, because touch and keyboard need the same styling.

## Scales

- Size: `sm | md | lg` (components); `xs … 3xl` only for spacing/radius tokens.
- Spacing tokens: `space.{inset|stack|inline}.{xs|sm|md|lg|xl|2xl}` on a 4px grid: 4, 8, 12, 16, 24, 32 (+ 48, 64 as `3xl`, `4xl`).
- Type scale: `font.size.100 … 900` (12, 14, 16, 18, 20, 24, 30, 36, 48 px in rem). Headings reference the scale; the scale never references headings.
- Radius: `radius.{sm|md|lg|full}` = 4, 8, 12, 9999.
- Duration: `fast 100ms · normal 200ms · slow 300ms`.

## Component naming

PascalCase, singular, no prefix in React (`Button`, not `IZButton`); web components get `iz-` (`<iz-button>`). Compound parts use dot-less suffixes: `Tabs`, `TabList`, `Tab`, `TabPanel`; `Menu`, `MenuTrigger`, `MenuItem`; `Modal`, `ModalHeader`, `ModalBody`, `ModalFooter`. Figma: `Category / Name` pages, component set named exactly as the React export.

## Words we use / don't use

| Use | Don't |
|---|---|
| Modal (blocking) / Popover (non-blocking) | Dialog as a product word (it's the role) |
| TextField | Input, TextInput |
| Select (closed list) / ComboBox (filterable) | Dropdown |
| Menu (actions) / Select (choice) | Dropdown |
| Toast (transient) / Alert (persistent, inline) | Notification, Banner, Snackbar |
| Chip (static or interactive — `variant` decides; see Chip.spec.json) | Tag, Pill, Label |
| Tone | Color, Status, Severity, Intent |
| Variant | Type, Kind, Appearance, Style |
| Pending | Loading, Busy |
| Danger | Error, Destructive (as a variant word) |

## Spec and doc vocabulary

- **Pattern** — the APG pattern name a component implements.
- **Compose** — which other system components a component is built from (`Modal` composes `Button`, `IconButton`).
- **Load-bearing rule** — a constraint that isn't obvious from the source and will break a11y or layout if violated (e.g. "Tooltip must not contain interactive content").
- **Template** — a full-page composition made only of public exports.
