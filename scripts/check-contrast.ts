// check:contrast — WCAG 2.x contrast for every documented bg/fg pair, in every theme in
// tokens/themes.config.ts. No colour is "accessible" until this passes.
//
// Two sources of pairs (tokens/contrast-pairs.json):
//   pairs    — combinations no naming convention implies (text levels, borders, focus ring)
//   onPairs  — each color.fg.on-* token and the background roles it partners
// Plus a coverage guard: every background role must appear in onPairs. Adding a bg token and
// forgetting its foreground fails the run, which is the point of the on-pair rule.
//
// Thresholds: text 4.5:1 (7:1 where the theme's contrast target is AAA), ui 3:1 — WCAG 1.4.11
// has no AAA non-text level. kind "exempt" is reported but never fails (disabled controls).
import { readFileSync } from 'node:fs';
import { loadTheme, resolve, TOKENS_DIR, THEMES, themeById } from './lib/dtcg.mjs';
import type { ColorValue } from './lib/dtcg.mjs';

export type Kind = 'text' | 'ui' | 'exempt';
export interface Pair { fg: string; bg: string; kind: Kind }
export interface Result extends Pair { theme: string; ratio: number; need: number; ok: boolean; fgHex: string; bgHex: string }

const ALIAS_LAYER = /\.(pairs|handoff)\.json$/;
const IS_BG = (name: string) => /^color\.surface\./.test(name) || /\.bg$/.test(name) || /\.bg-/.test(name);

/** A pair is only meaningful between two colours; anything else is a authoring mistake. */
const asColor = (name: string, value: unknown): ColorValue => {
  const v = value as ColorValue;
  if (!v || !Array.isArray(v.components) || v.components.length !== 3) throw new Error(`"${name}" is not an sRGB colour — contrast-pairs.json may only pair colour tokens`);
  return v;
};

const srgb = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]: number[]) => 0.2126 * srgb(r!) + 0.7152 * srgb(g!) + 0.0722 * srgb(b!);
export const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

const threshold = (kind: Kind, theme: string) =>
  kind === 'ui' ? 3 : themeById(theme).contrast === 'AAA' ? 7 : 4.5;

/** Every pair to check, and the coverage errors found while assembling them. */
export function documentedPairs(): { pairs: Pair[]; errors: string[] } {
  const spec = JSON.parse(readFileSync(`${TOKENS_DIR}contrast-pairs.json`, 'utf8'));
  const pairs: Pair[] = [...spec.pairs];
  for (const { fg, bgs, kind } of spec.onPairs) for (const bg of bgs) pairs.push({ fg, bg, kind });

  const { all, semanticNames } = loadTheme('light');
  const own = (n: string) => !ALIAS_LAYER.test(all.get(n)?.file ?? '');
  const errors: string[] = [];

  const covered = new Set(spec.onPairs.flatMap((p: { bgs: string[] }) => p.bgs));
  for (const name of semanticNames) {
    if (!IS_BG(name) || !own(name)) continue;
    if (!covered.has(name)) errors.push(`background role "${name}" has no onPairs entry — every bg needs an fg.on-* partner (specs/HANDOFF.md § naming)`);
  }
  const declared = new Set(spec.onPairs.map((p: { fg: string }) => p.fg));
  for (const name of semanticNames) {
    if (!/^color\.fg\.on-/.test(name)) continue;
    if (!declared.has(name)) errors.push(`"${name}" is an on-pair token but is not listed in onPairs — nothing checks it`);
  }
  for (const { fg, bg } of pairs) for (const n of [fg, bg]) {
    if (!semanticNames.has(n)) errors.push(`contrast-pairs.json references "${n}", which is not a semantic token`);
  }
  return { pairs, errors };
}

export function check(): { results: Result[]; errors: string[] } {
  const { pairs, errors } = documentedPairs();
  const results: Result[] = [];
  if (errors.length) return { results, errors };
  for (const theme of THEMES) {
    const { all } = loadTheme(theme);
    for (const { fg, bg, kind } of pairs) {
      const f = asColor(fg, resolve(all, fg).value), b = asColor(bg, resolve(all, bg).value);
      const ratio = contrast(f.components, b.components);
      const need = threshold(kind, theme);
      results.push({ theme, fg, bg, kind, ratio, need, ok: kind === 'exempt' || ratio >= need, fgHex: f.hex, bgHex: b.hex });
    }
  }
  return { results, errors };
}

export const failures = (results: Result[]) => results.filter((r) => !r.ok);
export const line = (r: Result) =>
  `${r.ok ? 'ok  ' : 'FAIL'} ${r.theme.padEnd(10)} ${r.ratio.toFixed(2).padStart(6)}:1 (need ${String(r.need).padEnd(3)} ${r.kind}) ${r.fg} on ${r.bg}  [${r.fgHex} on ${r.bgHex}]`;

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const { results, errors } = check();
  if (errors.length) {
    console.error(`[check-contrast] ${errors.length} coverage error(s):\n  - ${errors.join('\n  - ')}`);
    process.exit(1);
  }
  const bad = failures(results);
  const verbose = process.argv.includes('--verbose');
  for (const r of results) if (!r.ok || verbose) console.log(line(r));
  if (bad.length) {
    console.error(`[check-contrast] ${bad.length}/${results.length} pairs below threshold`);
    process.exit(1);
  }
  const graded = results.filter((r) => r.kind !== 'exempt');
  const worst = graded.reduce((a, b) => (b.ratio < a.ratio ? b : a));
  const exempt = results.length - graded.length;
  console.log(`[check-contrast] OK — ${graded.length} pairs across ${THEMES.length} themes (+${exempt} exempt); lowest ${worst.ratio.toFixed(2)}:1 (${worst.theme}: ${worst.fg} on ${worst.bg})`);
}
