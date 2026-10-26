import { test, expect } from '@playwright/test';

// Keyboard contract (Switch.spec.json) against the real Storybook in a real browser:
// Tab reaches the switch and shows the ring on the track, Space toggles aria-checked and the thumb
// actually moves (on is never colour-only), rows meet 24 / 44 px.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Switch keyboard', () => {
  test('Tab focuses the switch and shows a visible 2px focus ring on the track', async ({ page }) => {
    await page.goto(story('inputs-switch--default'));
    const input = page.getByRole('switch', { name: 'Focus timer' });
    await expect(input).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    // React Aria wraps the hidden input in its own visually-hidden span; the track is the aria-hidden one.
    const track = input.locator('xpath=ancestor::label[1]').locator('span[aria-hidden="true"]');
    expect(await track.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
    expect(await track.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
  });

  test('Space toggles and the thumb moves; Enter does not toggle', async ({ page }) => {
    await page.goto(story('inputs-switch--default'));
    const input = page.getByRole('switch', { name: 'Focus timer' });
    await input.focus();
    const thumb = input.locator('xpath=ancestor::label[1]').locator('span[aria-hidden="true"] > span');
    const before = (await thumb.boundingBox())!.x;
    await page.keyboard.press('Space');
    await expect(input).toBeChecked();
    await expect.poll(async () => (await thumb.boundingBox())!.x).toBeGreaterThan(before + 8);
    await page.keyboard.press('Enter');
    await expect(input).toBeChecked();
  });

  test('md row is at least 24px tall and lg at least 44px', async ({ page }) => {
    await page.goto(story('inputs-switch--sizes'));
    for (const [name, min] of [['Medium row 24px', 24], ['Large row 44px', 44]] as const) {
      const root = page.getByRole('switch', { name }).locator('xpath=ancestor::*[contains(@class,"root")][1]');
      const box = await root.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(min);
    }
  });
});
