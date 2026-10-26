import { test, expect } from '@playwright/test';

// Keyboard contract (RadioGroup.spec.json) against the real Storybook in a real browser: one tab stop,
// a visible ring on the focused circle, arrows move and select, Tab leaves the group, rows meet 24 / 44 px.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('RadioGroup keyboard', () => {
  test('Tab lands on the first radio with a visible 2px ring on its circle; arrows move and select; Tab leaves', async ({ page }) => {
    await page.goto(story('inputs-radiogroup--default'));
    const radios = page.getByRole('radio');
    await expect(radios).toHaveCount(3);
    await page.keyboard.press('Tab');
    await expect(radios.nth(0)).toBeFocused();
    const ring = radios.nth(0).locator('xpath=ancestor::label[1]').locator('span[aria-hidden="true"] > span');
    expect(await ring.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
    expect(await ring.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
    await page.keyboard.press('ArrowDown');
    await expect(radios.nth(1)).toBeFocused();
    await expect(radios.nth(1)).toBeChecked();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp'); // wraps to the last
    await expect(radios.nth(2)).toBeChecked();
    await page.keyboard.press('Tab');
    for (let i = 0; i < 3; i += 1) await expect(radios.nth(i)).not.toBeFocused();
  });

  test('Tab lands on the selected radio when there is one', async ({ page }) => {
    await page.goto(story('inputs-radiogroup--selected'));
    const lead = page.getByRole('radio', { name: 'Lead' });
    await expect(lead).toBeChecked();
    await page.keyboard.press('Tab');
    await expect(lead).toBeFocused();
  });

  test('md rows are at least 24px tall and lg at least 44px', async ({ page }) => {
    await page.goto(story('inputs-radiogroup--sizes'));
    for (const [name, min] of [['Medium rows 24px', 24], ['Large rows 44px', 44]] as const) {
      const row = page.getByRole('radiogroup', { name }).getByRole('radio').first().locator('xpath=ancestor::label[1]');
      const box = await row.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(min);
    }
  });
});
