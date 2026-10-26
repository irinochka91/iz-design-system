// tokens:validate — fails the build on: unknown alias, alias cycle, wrong $type / $value shape,
// raw values in the semantic tier, duplicate names across files, theme overriding a non-semantic token.
import { loadTheme, resolve, isAlias, aliasTarget, TYPES, THEMES } from './lib/dtcg.mjs';

// An alias layer file maps HANDOFF names / on-pairs onto canonical semantic tokens. Only these
// files may alias semantic → semantic, and a theme must never override one (it would fork the pair).
const isAliasLayer = (file) => /\.(pairs|handoff)\.json$/.test(file ?? '');

const errors = [];
const shape = {
  color: (v) => v && v.colorSpace === 'srgb' && Array.isArray(v.components) && v.components.length === 3 && /^#[0-9A-F]{6}$/.test(v.hex ?? '')
    && (v.alpha === undefined || (typeof v.alpha === 'number' && v.alpha >= 0 && v.alpha <= 1)),
  // DTCG shadow composite: every part is an alias (to a colour / dimension primitive) — never a raw value.
  shadow: (v) => v && ['color', 'offsetX', 'offsetY', 'blur', 'spread'].every((k) => isAlias(v[k])),
  dimension: (v) => v && typeof v.value === 'number' && ['px', 'rem', 'em'].includes(v.unit),
  duration: (v) => v && typeof v.value === 'number' && ['ms', 's'].includes(v.unit),
  cubicBezier: (v) => Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number'),
  fontFamily: (v) => typeof v === 'string' || (Array.isArray(v) && v.every((s) => typeof s === 'string')),
  fontWeight: (v) => typeof v === 'number' && v >= 1 && v <= 1000,
  number: (v) => typeof v === 'number',
};

for (const theme of THEMES) {
  const { all, primitiveNames, semanticNames, themeNames } = loadTheme(theme);
  for (const [name, t] of all) {
    if (!TYPES.has(t.type)) errors.push(`${theme}: ${name} has unsupported $type "${t.type}"`);
    if (isAlias(t.value)) {
      try { const r = resolve(all, name); if (r.type !== t.type) errors.push(`${theme}: ${name} (${t.type}) aliases a ${r.type} token`); }
      catch (e) { errors.push(`${theme}: ${name}: ${e.message}`); }
    } else if (shape[t.type] && !shape[t.type](t.value)) {
      errors.push(`${theme}: ${name} has a malformed ${t.type} $value: ${JSON.stringify(t.value)}`);
    }
    // A composite (shadow) is "all aliases" by its shape check; its parts point at primitives.
    if (semanticNames.has(name) && !isAlias(t.value) && t.type !== 'shadow') errors.push(`${theme}: semantic token ${name} holds a raw value — alias a primitive instead`);
    if (semanticNames.has(name) && isAlias(t.value) && semanticNames.has(aliasTarget(t.value)) && !isAliasLayer(t.file))
      errors.push(`${theme}: semantic token ${name} aliases another semantic token (${aliasTarget(t.value)}) — only *.pairs.json / *.handoff.json may do that`);
    if (primitiveNames.has(name) && isAlias(t.value)) errors.push(`${theme}: primitive token ${name} must not alias`);
    if (t.overrides && theme === 'light') errors.push(`duplicate token ${name} in ${t.file} and ${t.overrides}`);
  }
  for (const name of themeNames) {
    if (!semanticNames.has(name)) errors.push(`${theme}: theme overrides "${name}", which is not a semantic token`);
    else if (isAliasLayer(all.get(name)?.overrides)) errors.push(`${theme}: theme overrides alias-layer token "${name}" — override the canonical token it points at instead`);
  }
}

if (errors.length) {
  console.error(`[tokens-validate] ${errors.length} error(s):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
const { all, primitiveNames, semanticNames } = loadTheme('light');
console.log(`[tokens-validate] OK — ${primitiveNames.size} primitive, ${semanticNames.size} semantic tokens; ${THEMES.length} themes; ${all.size} total; all aliases resolve, no cycles.`);
