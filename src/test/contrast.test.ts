// The contrast budget is a test, not a report: a token change that drops a pair below its
// threshold fails `npm test`, in the same run as the component tests.
import { describe, expect, it } from 'vitest';
import { check, documentedPairs, failures, line } from '../../scripts/check-contrast.ts';
import { themes } from '../../tokens/themes.config.ts';

const { results, errors } = check();

describe('contrast', () => {
  it('documents a foreground for every background role, in both directions', () => {
    expect(documentedPairs().errors).toEqual([]);
  });

  it('checks every documented pair in every registered theme', () => {
    expect(errors).toEqual([]);
    const checkedThemes = new Set(results.map((r) => r.theme));
    expect([...checkedThemes].sort()).toEqual(themes.map((t) => t.id).sort());
    expect(results.length).toBeGreaterThan(0);
  });

  it.each(themes.map((t) => t.id))('meets WCAG AA (AAA where declared) in %s', (theme) => {
    const bad = failures(results.filter((r) => r.theme === theme));
    expect(bad.map(line)).toEqual([]);
  });
});
