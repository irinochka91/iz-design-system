import { test, expect } from '@playwright/test';

// Keyboard contract (Chip.spec.json) against the real Storybook in a real browser:
// static chips are skipped by Tab, a filter chip gets the ring and toggles, the pill is 28 px.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Chip keyboard', () => {
  test('Tab skips the static chip, focuses the filter and shows a visible 2px ring', async ({ page }) => {
    // Not the Keyboard story: Storybook runs a story's play() on load, which would already have tabbed.
    await page.goto(story('display-chip--static-then-filter'));
    const toggle = page.getByRole('button', { name: 'Toggle me' });
    await expect(toggle).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    expect(await toggle.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
    expect(await toggle.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
  });

  test('Space toggles aria-pressed', async ({ page }) => {
    await page.goto(story('display-chip--filter'));
    const toggle = page.getByRole('button', { name: 'Matches my priorities' });
    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  test('the pill is at least 28px tall', async ({ page }) => {
    await page.goto(story('display-chip--filter'));
    const box = await page.getByRole('button', { name: 'Matches my priorities' }).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(28);
  });
});
