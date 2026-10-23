import { test, expect } from '@playwright/test';

// Keyboard contract (Button.spec.json) against the real Storybook in a real browser:
// Tab reaches the button, the focus ring is visible (outline, not none), targets meet WCAG sizes, disabled is skipped.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Button keyboard', () => {
  test('Tab focuses and shows a visible 2px focus ring', async ({ page }) => {
    await page.goto(story('actions-button--primary'));
    const button = page.getByRole('button', { name: 'Save changes' });
    await expect(button).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('data-focus-visible', 'true');
    const outline = await button.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe('none');
    const outlineWidth = await button.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
    expect(outlineWidth).toBeGreaterThanOrEqual(2);

    // Activation by Enter/Space is asserted in the Storybook interaction test (Button.stories.tsx → Keyboard):
    // React Aria calls onPress for keyboard presses without dispatching a native click, so a DOM click
    // listener here would stay at 0. e2e owns what only a real browser can verify: focus ring, tab order, target size.
  });

  test('every size meets the 24px minimum target; lg meets 44px', async ({ page }) => {
    await page.goto(story('actions-button--sizes'));
    for (const [name, min] of [['Small 24px', 24], ['Medium 32px', 32], ['Large 44px', 44]] as const) {
      const box = await page.getByRole('button', { name }).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(min);
    }
  });

  test('disabled button is not in the tab order', async ({ page }) => {
    await page.goto(story('actions-button--disabled'));
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button')).not.toBeFocused();
  });
});
