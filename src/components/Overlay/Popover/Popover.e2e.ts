import { test, expect } from '@playwright/test';

// Popover.spec.json in a real browser: keyboard open with focus on the first control, Tab contained,
// Escape returns focus; click outside closes; it sits a token's gap from its trigger with a shadow.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Popover', () => {
  test('keyboard: Enter opens with focus on the field, Tab is contained, Escape returns focus', async ({ page }) => {
    await page.goto(story('overlay-popover--default'));
    const trigger = page.getByRole('button', { name: 'Adjust' });
    await expect(trigger).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Weekly target' });
    await expect(dialog).toBeVisible();
    const field = dialog.getByRole('textbox', { name: 'Applications per week' });
    await expect(field).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Done' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(field).toBeFocused(); // contained (modal for AT)
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('a click outside closes; the popover sits below its trigger with a token gap and a shadow', async ({ page }) => {
    await page.goto(story('overlay-popover--default'));
    const trigger = page.getByRole('button', { name: 'Adjust' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Weekly target' });
    await expect(dialog).toBeVisible();
    const surface = dialog.locator('xpath=..');
    const t = (await trigger.boundingBox())!;
    const p = (await surface.boundingBox())!;
    expect(p.y - (t.y + t.height)).toBeGreaterThanOrEqual(8); // space.200
    expect(await surface.getAttribute('data-placement')).toBe('bottom');
    expect(await surface.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
    await page.mouse.click(5, 5);
    await expect(dialog).toBeHidden();
  });
});
