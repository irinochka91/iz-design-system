import { test, expect } from '@playwright/test';

// ComboBox.spec.json in a real browser: typing filters and opens a list as wide as the field, arrows
// highlight without moving focus, Enter picks and closes, Escape cancels, the list caps at 8 rows.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('ComboBox', () => {
  test('type → filtered list as wide as the field; ArrowDown highlights (focus stays); Enter picks and closes', async ({ page }) => {
    await page.goto(story('inputs-combobox--default'));
    const input = page.getByRole('combobox', { name: 'Company' });
    await expect(input).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(input).toBeFocused();
    await page.keyboard.type('or');
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    await expect(listbox.getByRole('option')).toHaveCount(2);
    const field = input.locator('xpath=..');
    const [f, p] = await Promise.all([field.boundingBox(), listbox.locator('xpath=ancestor::*[@data-rac and contains(@class,"popover")][1]').boundingBox()]);
    expect(Math.abs((p?.width ?? 0) - (f?.width ?? 0))).toBeLessThanOrEqual(1); // as wide as the field box (its triggerRef)
    expect(Math.abs((p?.x ?? 0) - (f?.x ?? 0))).toBeLessThanOrEqual(1); // and aligned with it
    expect((p?.y ?? 0) - ((f?.y ?? 0) + (f?.height ?? 0))).toBeGreaterThanOrEqual(8); // space.200 gap
    await page.keyboard.press('ArrowDown');
    await expect(input).toBeFocused();
    const first = listbox.getByRole('option').first();
    await expect(input).toHaveAttribute('aria-activedescendant', (await first.getAttribute('id'))!);
    await page.keyboard.press('Enter');
    await expect(listbox).toBeHidden();
    await expect(input).toHaveValue('Orbit');
    await expect(input).toBeFocused();
  });

  test('Escape cancels (closes, reverts the text); the full list caps at 8 rows and scrolls', async ({ page }) => {
    await page.goto(story('inputs-combobox--default'));
    const input = page.getByRole('combobox', { name: 'Company' });
    await input.click();
    await page.getByRole('button', { name: /Show suggestions/ }).click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    await expect(listbox.getByRole('option')).toHaveCount(12);
    const box = await listbox.boundingBox();
    expect(box?.height ?? 0).toBeLessThanOrEqual(8 * 40 + 1);
    expect(await listbox.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    await page.keyboard.type('Ki');
    await expect(listbox.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    await expect(input).toHaveValue(''); // nothing selected: the edit is discarded
    await expect(input).toBeFocused();
  });
});
