// Theme registry — the single list of themes. scripts/lib/dtcg.mjs imports this at build time
// (Node 22 strips the types), so adding a theme here is the only step needed for
// tokens:validate, tokens:build and check:contrast to pick it up.
//
// A theme file holds ONLY the semantic tokens that differ from what it extends (Primer's model,
// specs/HANDOFF.md § Design system architecture). `light` is the complete base and has no file.

export type ColorScheme = 'light' | 'dark';
export type ContrastTarget = 'AA' | 'AAA';

export interface ThemeDef {
  /** Stable id. Also the generated filename: dist/css/<id>.css */
  readonly id: string;
  /** Value for data-theme / data-iz-theme. `null` for the base theme, which lives on :root. */
  readonly attribute: string | null;
  /** File in tokens/themes/, or null for the base theme. */
  readonly file: string | null;
  /** Theme whose overrides apply before this one's. */
  readonly extends?: string;
  readonly colorScheme: ColorScheme;
  /** Thresholds for check:contrast — AA = 4.5:1 text, AAA = 7:1 text. UI stays 3:1: WCAG 1.4.11 has no AAA non-text level (docs/TOKENS.md). */
  readonly contrast: ContrastTarget;
  /** Bridged from an OS preference when the app has not set an attribute. */
  readonly osBridge?: 'prefers-color-scheme: dark' | 'prefers-contrast: more' | 'prefers-contrast: more and dark';
  readonly description: string;
}

export const themes: readonly ThemeDef[] = [
  { id: 'light', attribute: null, file: null, colorScheme: 'light', contrast: 'AA',
    description: 'Base theme. Complete: every semantic token resolves here.' },
  { id: 'dark', attribute: 'dark', file: 'dark.json', colorScheme: 'dark', contrast: 'AA',
    osBridge: 'prefers-color-scheme: dark', description: 'Neutral/blue dark.' },
  { id: 'hc-light', attribute: 'hc-light', file: 'hc-light.json', colorScheme: 'light', contrast: 'AAA',
    osBridge: 'prefers-contrast: more', description: 'High-contrast light, AAA.' },
  { id: 'hc-dark', attribute: 'hc-dark', file: 'hc-dark.json', colorScheme: 'dark', contrast: 'AAA',
    osBridge: 'prefers-contrast: more and dark', description: 'High-contrast dark, AAA.' },
  { id: 'linen', attribute: 'linen', file: 'linen.json', colorScheme: 'light', contrast: 'AA',
    description: 'Job Search HQ — warm paper, ultramarine accent (specs/HANDOFF.md § Linen theme tokens).' },
  { id: 'linen.dark', attribute: 'linen-dark', file: 'linen.dark.json', extends: 'linen', colorScheme: 'dark', contrast: 'AA',
    description: 'Linen dark mode. Overrides colour only — it inherits linen\'s type from the parent.' },
];

export const byId = (id: string): ThemeDef => {
  const t = themes.find((x) => x.id === id);
  if (!t) throw new Error(`unknown theme "${id}" — add it to tokens/themes.config.ts`);
  return t;
};

/** Override files that apply to a theme, outermost ancestor first. */
export const chain = (id: string): readonly ThemeDef[] => {
  const t = byId(id);
  return t.extends ? [...chain(t.extends), t] : [t];
};

export const themeIds = themes.map((t) => t.id);
