import { test, expect } from '@playwright/test';

// Toast.spec.json in a real browser: it appears bottom-centre without stealing focus, Undo is one Tab
// away, Escape inside dismisses, and the light theme shows the overlay shadow.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Toast', () => {
  test('opens as a status without stealing focus; Tab reaches Undo; Escape dismisses', async ({ page }) => {
    await page.goto(story('feedback-toast--playground'));
    const trigger = page.getByRole('button', { name: 'Mark done' });
    await expect(trigger).toBeVisible();
    await trigger.focus();
    await page.keyboard.press('Enter');
    const status = page.getByRole('status');
    await expect(status).toContainText('Done: Email Priya');
    await expect(trigger).toBeFocused(); // never steals focus
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Undo' })).toBeFocused();
    await page.keyboard.press('Escape');
    // closed = the body is hidden; the status node stays mounted (and empty) so AT keeps the live region
    await expect(page.getByRole('status', { includeHidden: true })).toBeEmpty();
    await expect(status).toBeHidden();
  });

  test('sits at the bottom-centre of the viewport, with a shadow on the light theme', async ({ page }) => {
    await page.goto(story('feedback-toast--default'));
    const region = page.getByRole('region', { name: 'Notifications' });
    await expect(region).toBeVisible();
    const viewport = page.viewportSize()!;
    const box = (await region.boundingBox())!;
    expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThan(2);
    expect(viewport.height - (box.y + box.height)).toBeGreaterThanOrEqual(16);
    const shadow = await page.getByRole('status').locator('xpath=..').evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow).not.toBe('none');
  });
});
