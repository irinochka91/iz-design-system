import { test, expect } from '@playwright/test';

// Keyboard contract (TextField.spec.json) against the real Storybook in a real browser:
// Tab reaches the input, the ring is drawn on the field box, targets meet 40 / 44 px, Enter/Escape are left alone.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('TextField keyboard', () => {
  test('Tab focuses the input and the field box shows a visible 2px focus ring', async ({ page }) => {
    await page.goto(story('inputs-textfield--default'));
    const input = page.getByRole('textbox', { name: 'Company' });
    await expect(input).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    // the ring lives on the box around the input, not on the bare <input>
    const box = input.locator('xpath=..');
    const outline = await box.evaluate((el) => getComputedStyle(el).outlineStyle);
    const width = await box.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
    expect(outline).not.toBe('none');
    expect(width).toBeGreaterThanOrEqual(2);
  });

  test('md is at least 40px tall and lg at least 44px', async ({ page }) => {
    await page.goto(story('inputs-textfield--sizes'));
    for (const [name, min] of [['Medium 40px', 40], ['Large 44px', 44]] as const) {
      const box = await page.getByRole('textbox', { name }).locator('xpath=..').boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(min);
    }
  });

  test('Enter and Escape do not clear the value — the field does not own them', async ({ page }) => {
    await page.goto(story('inputs-textfield--keyboard'));
    const input = page.getByRole('textbox', { name: 'Type here' });
    await input.fill('Orbit');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    await expect(input).toHaveValue('Orbit');
  });
});
