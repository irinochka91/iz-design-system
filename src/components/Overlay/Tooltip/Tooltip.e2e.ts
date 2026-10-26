import { test, expect } from '@playwright/test';

// Tooltip.spec.json in a real browser: keyboard focus shows it and describes the trigger, Escape hides
// it with focus kept, hover shows it, and it is drawn on the inverse surface.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Tooltip', () => {
  test('Tab shows it with aria-describedby; Escape hides it and focus stays', async ({ page }) => {
    await page.goto(story('overlay-tooltip--default'));
    const trigger = page.getByRole('button', { name: 'Open application' });
    await expect(trigger).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText('Open application');
    const id = await tooltip.getAttribute('id');
    await expect(trigger).toHaveAttribute('aria-describedby', id!);
    await page.keyboard.press('Escape');
    await expect(tooltip).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('hover shows it on the inverse surface above the trigger', async ({ page }) => {
    await page.goto(story('overlay-tooltip--default'));
    const trigger = page.getByRole('button', { name: 'Open application' });
    await expect(trigger).toBeVisible(); // rendered = React Aria's global pointer listeners are installed
    // A real mouse moves before it arrives; Playwright's first hover teleports, so pointerenter would
    // precede the pointermove React Aria uses to tell a pointer from a keyboard. Move once first —
    // to somewhere other than (0, 0), where Chromium's cursor already starts (no movement, no event).
    await page.mouse.move(300, 300);
    await trigger.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    // The story's trigger sits at the top of the iframe, so React Aria legitimately flips the
    // requested 'top' to 'bottom'. Measure the space.200 gap on whichever side it landed.
    const placement = await tooltip.getAttribute('data-placement');
    expect(['top', 'bottom']).toContain(placement);
    const t = (await trigger.boundingBox())!;
    const p = (await tooltip.boundingBox())!;
    const gap = placement === 'top' ? t.y - (p.y + p.height) : p.y - (t.y + t.height);
    expect(gap).toBeGreaterThanOrEqual(8);
    const [bg, page_bg] = await Promise.all([
      tooltip.evaluate((el) => getComputedStyle(el).backgroundColor),
      page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    ]);
    expect(bg).not.toBe(page_bg); // inverse surface
  });
});
