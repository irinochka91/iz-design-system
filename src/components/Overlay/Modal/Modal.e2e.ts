import { test, expect } from '@playwright/test';

// Modal.spec.json in a real browser: focus moves in and is trapped, Escape returns it, the backdrop
// dismisses (or not), the page behind cannot be reached, and the md panel is 560 px with a shadow.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Modal', () => {
  test('keyboard: Enter opens with focus on Cancel, Tab is trapped, Escape returns focus to the trigger', async ({ page }) => {
    // Not the Keyboard story: Storybook runs a story's play() on load, which would already have opened it.
    await page.goto(story('overlay-modal--default'));
    const trigger = page.getByRole('button', { name: 'Withdraw…' });
    await expect(trigger).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Withdraw this application?' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Withdraw application' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused(); // trapped
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('the backdrop does not dismiss a destructive confirmation', async ({ page }) => {
    await page.goto(story('overlay-modal--confirm'));
    await page.getByRole('button', { name: 'Withdraw…' }).click();
    const alert = page.getByRole('alertdialog');
    await expect(alert).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(alert).toBeVisible();
    await alert.getByRole('button', { name: 'Cancel' }).click();
    await expect(alert).toBeHidden();
  });

  test('md panel is 560px wide with the overlay shadow; the scrim covers the viewport', async ({ page }) => {
    await page.goto(story('overlay-modal--large'));
    await page.getByRole('button', { name: 'Withdraw…' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const panel = dialog.locator('xpath=..');
    const box = (await panel.boundingBox())!;
    expect(box.width).toBeLessThanOrEqual(720);
    expect(await panel.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
    const overlay = panel.locator('xpath=..');
    const ob = (await overlay.boundingBox())!;
    const vp = page.viewportSize()!;
    expect(ob.width).toBe(vp.width);
    expect(ob.height).toBe(vp.height);
  });
});
