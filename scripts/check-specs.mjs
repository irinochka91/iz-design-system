// check-specs — implemented in Phase 1 (tokens) / Phase 2 (specs). See docs/ROADMAP.md.
import { existsSync } from 'node:fs';
if (!existsSync(new URL('../tokens/primitives', import.meta.url))) {
  console.log('[check-specs] skipped: no token source yet (Phase 1). Not a pass.');
  process.exit(0);
}
console.error('[check-specs] token source present but script not implemented');
process.exit(1);
