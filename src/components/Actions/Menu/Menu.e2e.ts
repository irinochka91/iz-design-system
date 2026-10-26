import { test, expect } from '@playwright/test';

// Menu.spec.json in a real browser: keyboard open / choose / escape with focus return, click outside
// closes, 40 px rows, and the overlay shadow on the light theme.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Menu', () => {
  test('keyboard: Enter opens on the first item, End + Enter chooses and returns focus', async ({ page }) => {
    await page.goto(story('actions-menu--snooze'));
    const trigger = page.getByRole('button', { name: 'Snooze' });
    await expect(trigger).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Tomorrow' })).toBeFocused();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('Escape closes with focus on the trigger; a click outside closes too', async ({ page }) => {
    await page.goto(story('actions-menu--snooze'));
    const trigger = page.getByRole('button', { name: 'Snooze' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('menu')).toBeHidden();
  });

  test('Tab is contained: focus stays on the current item and the menu stays open; Escape exits', async ({ page }) => {
    // The popover is modal for assistive technology (ADR-029); Tab has nowhere to go and does nothing.
    await page.goto(story('actions-menu--snooze'));
    const trigger = page.getByRole('button', { name: 'Snooze' });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    const first = page.getByRole('menuitem', { name: 'Tomorrow' });
    await expect(first).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(first).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(first).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('items are 40px rows and the popover carries the overlay shadow', async ({ page }) => {
    await page.goto(story('actions-menu--snooze'));
    await page.getByRole('button', { name: 'Snooze' }).click();
    const item = page.getByRole('menuitem', { name: 'Tomorrow' });
    await expect(item).toBeVisible();
    expect((await item.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(40);
    const shadow = await page.getByRole('menu').locator('xpath=..').evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');
  });
});
