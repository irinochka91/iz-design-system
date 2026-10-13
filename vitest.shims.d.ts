/// <reference types="@vitest/browser-playwright" />
import type { AxeMatchers } from 'vitest-axe/matchers';

// vitest-axe augments the legacy `Vi` namespace; Vitest ≥ 2 reads matchers from the 'vitest' module instead.
// Declaration merging requires interfaces here, so the "empty interface" rules are intentionally disabled.
/* eslint-disable @typescript-eslint/no-empty-object-type, @typescript-eslint/no-unused-vars */
declare module 'vitest' {
  interface Assertion<T = unknown> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
