// check:specs — every component's .spec.json must: have the required fields; list only tokens that exist;
// list every --iz-* semantic token its CSS consumes (and nothing it doesn't); have a keyboard map and a
// focus state if interactive. Valid specs are copied to docs/specs/ (shipped, read by the MCP server).
// Prop ↔ TypeScript cross-check arrives in Phase 2 (needs the TS compiler API).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { globSync } from 'node:fs';
import { loadTheme, cssName } from './lib/dtcg.mjs';

const root = new URL('../', import.meta.url).pathname;
const { semanticNames } = loadTheme('light');
const CATEGORIES = ['Actions', 'Inputs', 'Display', 'Navigation', 'Overlay', 'Layout', 'Feedback', 'Pattern', 'Template'];
const REQUIRED = ['name', 'category', 'status', 'summary', 'role', 'props', 'states', 'keyboard', 'a11y', 'tokens', 'rules', 'figma'];
const errors = [];
// Patterns (src/patterns/<product>/<Name>/) are specified and checked exactly like components (ADR-033).
const specs = [...globSync('src/components/**/*.spec.json', { cwd: root }), ...globSync('src/patterns/**/*.spec.json', { cwd: root })];

for (const rel of specs) {
  const spec = JSON.parse(readFileSync(root + rel, 'utf8'));
  const dir = rel.replace(/[^/]+$/, '');
  const where = `${rel}:`;
  for (const k of REQUIRED) if (!(k in spec)) errors.push(`${where} missing "${k}"`);
  if (!CATEGORIES.includes(spec.category)) errors.push(`${where} category "${spec.category}" is not one of ${CATEGORIES.join('/')}`);
  if (spec.name !== rel.split('/').at(-1).replace('.spec.json', '')) errors.push(`${where} name "${spec.name}" ≠ file name`);
  const interactive = !['presentation', 'none', undefined].includes(spec.role);
  if (interactive && !(spec.keyboard?.length)) errors.push(`${where} interactive component without a keyboard map`);
  if (interactive && !spec.states?.includes('focus')) errors.push(`${where} interactive component without a "focus" state`);
  if (spec.status === 'stable' && !spec.a11y?.screenReaderNotes) errors.push(`${where} status "stable" requires a11y.screenReaderNotes`);

  // tokens ↔ CSS
  for (const t of spec.tokens ?? []) if (!semanticNames.has(t)) errors.push(`${where} token "${t}" does not exist (see src/styles/tokens.d.ts)`);
  const cssFile = root + dir + spec.name + '.module.css';
  if (existsSync(cssFile)) {
    const css = readFileSync(cssFile, 'utf8');
    const used = new Set([...css.matchAll(/var\((--iz-[a-z0-9-]+)\)/g)].map((m) => m[1]));
    const declared = new Set((spec.tokens ?? []).map(cssName));
    const componentScoped = (v) => v.startsWith(`--iz-${spec.name.toLowerCase()}-`);
    for (const v of used) if (!componentScoped(v) && !declared.has(v)) errors.push(`${where} CSS uses ${v} but spec.tokens does not list it`);
    for (const v of declared) if (!used.has(v)) errors.push(`${where} spec.tokens lists ${v} but the CSS never uses it`);
  }
  // publish
  mkdirSync(root + 'docs/specs', { recursive: true });
  writeFileSync(`${root}docs/specs/${spec.name}.spec.json`, JSON.stringify({ ...spec, source: rel }, null, 2));
}

if (errors.length) { console.error(`[check-specs] ${errors.length} error(s):\n  - ${errors.join('\n  - ')}`); process.exit(1); }
console.log(`[check-specs] OK — ${specs.length} spec(s) valid; tokens ↔ CSS consistent; copied to docs/specs/`);
