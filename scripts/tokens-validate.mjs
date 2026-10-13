// tokens-validate — implemented in Phase 1 (tokens) / Phase 2 (specs). See docs/ROADMAP.md.
import { existsSync } from 'node:fs';
if (!existsSync(new URL('../tokens/primitives', import.meta.url))) {
  console.log('[tokens-validate] skipped: no token source yet (Phase 1). Not a pass.');
  process.exit(0);
}
console.error('[tokens-validate] token source present but script not implemented');
process.exit(1);
