// gen:llms — writes agent/llms.txt (https://llmstxt.org) from the validated specs in docs/specs/ and the
// theme registry, so an agent reads what the repo enforces instead of guessing. Deterministic: no
// timestamps, so `--check` can fail CI when the committed file is stale (same model as the token output).
// Run after check:specs; the file ships with the package (package.json "files": agent).
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { THEME_DEFS, loadTheme } from './lib/dtcg.mjs';

const root = new URL('../', import.meta.url).pathname;
const out = root + 'agent/llms.txt';
const check = process.argv.includes('--check');
const CATEGORY_ORDER = ['Actions', 'Inputs', 'Display', 'Feedback', 'Overlay', 'Navigation', 'Layout', 'Pattern', 'Template'];

const specs = readdirSync(root + 'docs/specs')
  .filter((f) => f.endsWith('.spec.json'))
  .map((f) => JSON.parse(readFileSync(root + 'docs/specs/' + f, 'utf8')))
  .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.name.localeCompare(b.name));
const manifest = JSON.parse(readFileSync(root + 'docs/components.manifest.json', 'utf8'));
const importOf = (name) => manifest.components.find((c) => c.name === name)?.code?.import ?? `import { ${name} } from '@iz/design-system'`;
const { semanticNames } = loadTheme('light');
const firstSentence = (s) => s.split(/(?<=\.)\s/)[0];

const lines = [];
const p = (...l) => lines.push(...l);
p('# IZ Design System', '');
p('> A React component library on React Aria Components, driven by DTCG design tokens with six themes. Every component ships a machine-readable spec (`docs/specs/<Name>.spec.json`): role, props with intent, states, keyboard map, WCAG criteria, the tokens it consumes, and the rules a reviewer applies. Read the spec before using or extending a component; CI enforces what the spec says.', '');
p('## How to use it', '');
p("- Import from the package root: `import { Button, TextField } from '@iz/design-system'`; styles: `@iz/design-system/styles.css`; tokens: `@iz/design-system/tokens.css`.");
p(`- Themes: set \`data-iz-theme\` on \`<html>\` to one of ${THEME_DEFS.filter((t) => t.attribute).map((t) => `\`${t.attribute}\``).join(', ')} (the base theme \`light\` needs no attribute). Themes override semantic tokens only; no component code changes between themes.`);
p(`- Tokens: ${semanticNames.size} semantic tokens, CSS prefix \`--iz-\`, path \`category.concept.property.variant.state\` → \`--iz-category-concept-property-variant-state\`. In app and pattern code use \`var(--iz-*)\` only — a raw hex or px literal fails lint (\`iz/no-raw-colors\`, \`iz/no-raw-spacing\`, stylelint).`);
p('- Hover, focus-visible and pressed are browser states, never props. Public props are semantic: `isDisabled`, `isInvalid`, `isSelected`, `isExpanded`, `isPending`.');
p('- Validation is controlled by the form, not the field: `isInvalid` + `errorMessage`; native `required` is not used (ADR-022). Overlays are modal for assistive technology except the ComboBox list (ADR-029).');
p('- Do not add a component or token without a spec and an ADR (`docs/CONTRIBUTING.md`, `docs/decisions.md`). Out-of-scope ideas go to `PARKING.md`, one line each.', '');
for (const cat of CATEGORY_ORDER) {
  const group = specs.filter((s) => s.category === cat);
  if (!group.length) continue;
  p(cat === 'Pattern' ? '## Patterns (Job Search HQ) — composed from the components above' : `## Components — ${cat}`, '');
  for (const s of group) {
    p(`- [${s.name}](docs/specs/${s.name}.spec.json): ${firstSentence(s.summary)} role=\`${s.role}\`, status ${s.status}. \`${importOf(s.name)}\``);
  }
  p('');
}
p('## Tokens', '');
p('- [tokens.dtcg.json](docs/specs/tokens.dtcg.json): every semantic token with its resolved value per theme (DTCG 2025.10).');
p('- [docs/TOKENS.md](docs/TOKENS.md): three tiers (primitive → semantic → component), naming, what a theme may override, the contrast gate.');
p('- [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md): the keyboard and screen-reader contract per component family; WCAG 2.2 AA is the floor, hc-* themes are AAA.', '');
p('## Decisions and process', '');
p('- [docs/decisions.md](docs/decisions.md): ADRs — what was decided, why, and which option was rejected. Check here before proposing a change that "fixes" a deliberate choice.');
p('- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md): the component cycle — spec → code → stories → unit tests → Playwright e2e → MDX → manifest → learning log.');
p('- [docs/SPEC-FORMAT.md](docs/SPEC-FORMAT.md): the spec schema and the MCP tools planned over it.');
p('- [docs/components.manifest.json](docs/components.manifest.json): code ↔ Figma mapping per component and its review status.', '');
p('## Optional', '');
p('- [docs/learning-log.md](docs/learning-log.md): what each component taught, including React Aria facts the tests got wrong before the component did.');
p('- [PARKING.md](PARKING.md): ideas deferred to a later phase.');
p('- [specs/HANDOFF.md](specs/HANDOFF.md): the product brief this system is built against (Job Search HQ).');
const text = lines.join('\n') + '\n';

if (check) {
  const current = existsSync(out) ? readFileSync(out, 'utf8') : '';
  if (current !== text) { console.error('[gen-llms-txt] agent/llms.txt is stale — run `npm run gen:llms` and commit the result'); process.exit(1); }
  console.log(`[gen-llms-txt] OK — agent/llms.txt is current (${specs.length} components)`);
} else {
  writeFileSync(out, text);
  console.log(`[gen-llms-txt] wrote agent/llms.txt — ${specs.length} components, ${semanticNames.size} tokens, ${THEME_DEFS.length} themes`);
}
