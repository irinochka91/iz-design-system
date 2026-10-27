import { test, expect } from '@playwright/test';

// WeeklyGoal.spec.json in a real browser: bar geometry from tokens, the moment on the fifth Done (700 ms spring
// on the last bar, rolled digit, crossfaded footer), and the reduced-motion path where it all lands at once.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('WeeklyGoal', () => {
  test('five 14 × 36 bars with three lit; the meter carries the value', async ({ page }) => {
    await page.goto(story('patterns-weeklygoal--default'));
    const meter = page.getByRole('meter', { name: 'Weekly goal' });
    await expect(meter).toBeVisible();
    await expect(meter).toHaveAttribute('aria-valuetext', '3 of 5 quality applications');
    const bars = meter.locator('[class*="bar"]:not([class*="bars"])');
    await expect(bars).toHaveCount(5);
    const box = (await bars.first().boundingBox())!;
    expect(Math.round(box.width)).toBe(14);
    expect(Math.round(box.height)).toBe(36);
    await expect(meter.locator('[data-lit]')).toHaveCount(3);
  });

  test('the moment: the fifth Done springs the last bar over duration.moment, rolls the digit, crossfades the footer', async ({ page }) => {
    await page.goto(story('patterns-weeklygoal--moment'));
    const meter = page.getByRole('meter', { name: 'Weekly goal' });
    await expect(meter).toHaveAttribute('aria-valuenow', '4');
    await page.getByRole('button', { name: 'Mark one done' }).click();
    await expect(meter).toHaveAttribute('data-met', 'true');
    await expect(meter).toHaveAttribute('aria-valuenow', '5');
    const latest = meter.locator('[data-latest]');
    const anim = await latest.evaluate((el) => {
      const cs = getComputedStyle(el, '::after');
      return { name: cs.animationName, duration: cs.animationDuration };
    });
    expect(anim.name).toContain('spring');
    expect(anim.duration).toBe('0.7s');
    await expect(meter).toContainText('5 / 5');
    await expect(meter.getByRole('paragraph')).toHaveText('Goal met · 7-week streak');
  });

  test('reduced motion: the same moment lands at once — every animation is 0 s', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(story('patterns-weeklygoal--moment'));
    const meter = page.getByRole('meter', { name: 'Weekly goal' });
    await page.getByRole('button', { name: 'Mark one done' }).click();
    await expect(meter).toHaveAttribute('data-met', 'true');
    const durations = await meter.evaluate((root) => {
      const latest = root.querySelector('[data-latest]')!;
      const roll = root.querySelector('[class*="roll"]:not([class*="rollBox"])')!;
      const footer = root.querySelector('[class*="footerText"]')!;
      return [getComputedStyle(latest, '::after').animationDuration, getComputedStyle(roll).animationDuration, getComputedStyle(footer).animationDuration];
    });
    expect(durations).toEqual(['0s', '0s', '0s']);
    await expect(meter.getByRole('paragraph')).toHaveText('Goal met · 7-week streak');
  });
});
