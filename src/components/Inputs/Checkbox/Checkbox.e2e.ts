import { test, expect } from '@playwright/test';

// Keyboard contract (Checkbox.spec.json) against the real Storybook in a real browser:
// Tab reaches the box and shows the ring on it, Space toggles aria-checked, rows meet 24 / 44 px.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Checkbox keyboard', () => {
  test('Tab focuses the box and shows a visible 2px focus ring on it', async ({ page }) => {
    await page.goto(story('inputs-checkbox--default'));
    const input = page.getByRole('checkbox', { name: 'Open to remote roles' });
    await expect(input).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    const box = input.locator('xpath=ancestor::label[1]').locator('svg'); // the square is the SVG inside the label
    expect(await box.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
    expect(await box.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
  });

  test('Space toggles; Enter does not', async ({ page }) => {
    await page.goto(story('inputs-checkbox--keyboard'));
    const input = page.getByRole('checkbox', { name: 'Press Space' });
    await input.focus();
    await page.keyboard.press('Space');
    await expect(input).toBeChecked();
    await page.keyboard.press('Enter');
    await expect(input).toBeChecked();
  });

  test('md row is at least 24px tall and lg at least 44px', async ({ page }) => {
    await page.goto(story('inputs-checkbox--sizes'));
    for (const [name, min] of [['Medium row 24px', 24], ['Large row 44px', 44]] as const) {
      const root = page.getByRole('checkbox', { name }).locator('xpath=ancestor::*[contains(@class,"root")][1]');
      const box = await root.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(min);
    }
  });
});
