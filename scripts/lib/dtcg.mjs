// Minimal DTCG 2025.10 reader shared by tokens:validate, tokens:build and check:contrast.
// Deliberately small and readable: this is the whole "token pipeline" (see ADR-006 in docs/decisions.md).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

// The theme list lives in tokens/themes.config.ts so it is typed for the app too (Node 22 strips
// the types on import). Adding a theme there is the only step: validate, build and contrast follow.
import { themes as THEME_DEFS, byId as themeById, chain as themeChain } from '../../tokens/themes.config.ts';

// Found by walking up from the working directory, so the same code works whether Node runs this
// file directly or a bundler (vitest) has rewritten import.meta.url. src/test/contrast.test.ts
// exercises the second path.
const findTokensDir = () => {
  let dir = process.cwd();
  for (;;) {
    const candidate = join(dir, 'tokens');
    if (existsSync(join(candidate, 'themes.config.ts'))) return `${candidate}/`;
    const up = dirname(dir);
    if (up === dir) throw new Error('cannot find tokens/ above ' + process.cwd());
    dir = up;
  }
};
export const TOKENS_DIR = findTokensDir();
export { THEME_DEFS, themeById, themeChain };
export const THEMES = THEME_DEFS.map((t) => t.id);
export const TYPES = new Set(['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'strokeStyle', 'border', 'transition', 'shadow', 'gradient', 'typography']);

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const listJson = (dir) => readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => join(dir, f));

/** Flatten a DTCG tree into Map<path, {type, value, description, file}>; $type inherits from groups. */
export function flatten(tree, file, out = new Map(), path = [], inheritedType) {
  const type = tree.$type ?? inheritedType;
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith('$')) continue;
    if (node && typeof node === 'object' && '$value' in node) {
      const name = [...path, key].join('.');
      const prev = out.get(name);
      out.set(name, { type: node.$type ?? type, value: node.$value, description: node.$description, file, overrides: prev?.file });
    } else if (node && typeof node === 'object') {
      flatten(node, file, out, [...path, key], type);
    }
  }
  return out;
}

export function loadLayer(dir) {
  const out = new Map();
  for (const f of listJson(dir)) flatten(readJson(f), f.replace(TOKENS_DIR, 'tokens/'), out);
  return out;
}

/** primitives + semantic (light base) + optional theme override, as one flat map. */
export function loadTheme(theme = 'light') {
  const prim = loadLayer(join(TOKENS_DIR, 'primitives'));
  const sem = loadLayer(join(TOKENS_DIR, 'semantic'));
  const all = new Map([...prim, ...sem]);
  const semanticNames = new Set(sem.keys());
  const themeNames = new Set();
  // Apply every override file in the extends chain, outermost ancestor first.
  for (const def of themeChain(theme)) {
    if (!def.file) continue;
    const over = flatten(readJson(join(TOKENS_DIR, 'themes', def.file)), `tokens/themes/${def.file}`);
    for (const [k, v] of over) {
      all.set(k, { ...v, overrides: all.get(k)?.overrides ?? all.get(k)?.file });
      themeNames.add(k);
    }
  }
  return { all, primitiveNames: new Set(prim.keys()), semanticNames, themeNames };
}

export const isAlias = (v) => typeof v === 'string' && /^\{[^{}]+\}$/.test(v);
export const aliasTarget = (v) => v.slice(1, -1);

/** Resolve a token's value through aliases; throws on missing target or cycle. */
export function resolve(all, name, seen = []) {
  const t = all.get(name);
  if (!t) throw new Error(`unknown token "${name}" (referenced from ${seen.at(-1) ?? '?'})`);
  if (seen.includes(name)) throw new Error(`alias cycle: ${[...seen, name].join(' → ')}`);
  if (isAlias(t.value)) return resolve(all, aliasTarget(t.value), [...seen, name]);
  return { ...t, value: t.value, resolvedFrom: seen.length ? name : undefined };
}

export const cssName = (name) => `--iz-${name.replace(/\./g, '-')}`;

/** `all` is needed only for composites (shadow), whose parts are aliases resolved here. */
export function toCss(type, value, all) {
  switch (type) {
    case 'color': {
      const rgb = value.components.map((c) => Math.round(c * 255)).join(' ');
      if (value.alpha !== undefined && value.alpha < 1) return `rgb(${rgb} / ${value.alpha})`;
      return value.hex ?? `rgb(${rgb})`;
    }
    case 'shadow': {
      if (!all) throw new Error('toCss(shadow) needs the token map to resolve its parts');
      const part = (k) => { const r = resolve(all, aliasTarget(value[k])); return toCss(r.type, r.value, all); };
      return `${part('offsetX')} ${part('offsetY')} ${part('blur')} ${part('spread')} ${part('color')}`;
    }
    case 'dimension': return `${value.value}${value.unit}`;
    case 'duration': return `${value.value}${value.unit}`;
    case 'cubicBezier': return `cubic-bezier(${value.join(', ')})`;
    case 'fontFamily': return (Array.isArray(value) ? value : [value]).map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
    case 'fontWeight':
    case 'number': return String(value);
    default: return JSON.stringify(value);
  }
}
