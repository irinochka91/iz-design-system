// check:package — every path package.json promises must exist after a build.
// Runs as the last step of `npm run build`, because `vite build` empties dist/ and the token
// outputs are written after it; this is what catches a wrong order or a renamed output.
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(`${root}package.json`, 'utf8'));
const errors = [];
const seen = [];

const check = (label, target) => {
  if (!target || typeof target !== 'string' || !target.startsWith('./')) return;
  const rel = target.slice(2);
  // A wildcard export is satisfied by its directory existing.
  const path = rel.includes('*') ? rel.slice(0, rel.indexOf('*')) : rel;
  seen.push(`${label} → ${target}`);
  if (!existsSync(`${root}${path}`)) errors.push(`${label} → ${target} does not exist (looked for ${path})`);
};

check('main', pkg.main);
check('module', pkg.module);
check('types', pkg.types);
for (const [key, value] of Object.entries(pkg.exports ?? {})) {
  if (typeof value === 'string') check(`exports["${key}"]`, value);
  else for (const [cond, target] of Object.entries(value)) check(`exports["${key}"].${cond}`, target);
}
// `files` entries may legitimately not exist yet (agent/ arrives in Phase 2) — report, never fail.
const missingFiles = (pkg.files ?? []).filter((f) => !existsSync(`${root}${f}`));

if (errors.length) {
  console.error(`[check-package] ${errors.length} broken path(s):\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(`[check-package] OK — ${seen.length} declared paths resolve${missingFiles.length ? `; "files" not yet present (fine before their phase): ${missingFiles.join(', ')}` : ''}`);
