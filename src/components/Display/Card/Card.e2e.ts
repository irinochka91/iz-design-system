import { test, expect } from '@playwright/test';

// The load-bearing rules of Card.spec.json, checked in a real browser: no shadow, no outer margin,
// the 1 px edge is really there, and nothing in the card chrome is focusable.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('Card chrome', () => {
  test('no shadow, no margin, a 1px border', async ({ page }) => {
    await page.goto(story('display-card--surface'));
    // The card is the parent of its heading; a text filter would match Storybook's root wrapper first.
    const card = page.getByRole('heading', { name: 'Orbit — Senior Product Designer' }).locator('xpath=..');
    await expect(card).toBeVisible();
    const style = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { boxShadow: s.boxShadow, margin: s.margin, borderWidth: s.borderTopWidth, borderStyle: s.borderTopStyle };
    });
    expect(style.boxShadow).toBe('none');
    expect(style.margin).toBe('0px');
    expect(style.borderWidth).toBe('1px');
    expect(style.borderStyle).toBe('solid');
  });

  test('the triage card has the 14px radius and 16px padding', async ({ page }) => {
    await page.goto(story('display-card--triage'));
    const card = page.getByRole('article');
    await expect(card).toBeVisible();
    const style = await card.evaluate((el) => ({ radius: getComputedStyle(el).borderTopLeftRadius, padding: getComputedStyle(el).paddingTop }));
    expect(style.radius).toBe('14px');
    expect(style.padding).toBe('16px');
  });

  test('Tab goes straight to the first button inside; the card itself is never focused', async ({ page }) => {
    await page.goto(story('display-card--triage'));
    await expect(page.getByRole('article')).toBeVisible(); // Tab before the story mounts lands on nothing
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Apply' })).toBeFocused();
  });
});
