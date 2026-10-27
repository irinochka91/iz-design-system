import { test, expect } from '@playwright/test';

// StageChip.spec.json in a real browser: press and Shift+→ advance the controlled stage, Shift+← reverts, the
// label and the emphasis follow, the toast confirms and Undo brings the previous stage back.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('StageChip', () => {
  test('cycling: press → Interview (tint), Shift+→ → Offer (strong, final), Shift+← back; Undo restores', async ({ page }) => {
    await page.goto(story('patterns-stagechip--with-undo'));
    const chip = page.getByRole('button', { name: /^Stage: / });
    await expect(chip).toHaveAccessibleName('Stage: Screen. Press to advance');
    await chip.click();
    await expect(chip).toHaveAccessibleName('Stage: Interview. Press to advance');
    await expect(page.getByRole('status')).toContainText('Stage: Interview');
    await chip.focus();
    await page.keyboard.press('Shift+ArrowRight');
    await expect(chip).toHaveAccessibleName('Stage: Offer. Final stage');
    await expect(chip).toBeFocused(); // the change never moves focus
    await page.mouse.move(600, 400); // hover overrides the emphasis background by design (Chip); measure unhovered
    const strong = await chip.evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.keyboard.press('Shift+ArrowRight'); // final: nothing happens
    await expect(chip).toHaveAccessibleName('Stage: Offer. Final stage');
    await page.keyboard.press('Shift+ArrowLeft');
    await expect(chip).toHaveAccessibleName('Stage: Interview. Press to advance');
    // Chip transitions its background over duration.fast; poll until the tint has replaced the strong.
    await expect.poll(() => chip.evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(strong);
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(chip).toHaveAccessibleName('Stage: Offer. Final stage');
  });

  test('the pill is at least 28 px tall and keeps its outline on keyboard focus', async ({ page }) => {
    await page.goto(story('patterns-stagechip--default'));
    const chip = page.getByRole('button', { name: 'Stage: Screen. Press to advance' });
    await expect(chip).toBeVisible();
    expect((await chip.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(28);
    await page.keyboard.press('Tab');
    await expect(chip).toBeFocused();
    expect(await chip.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
  });
});
