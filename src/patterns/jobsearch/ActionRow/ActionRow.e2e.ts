import { test, expect } from '@playwright/test';

// ActionRow.spec.json in a real browser: 44 px targets, the done moment collapses the row, Undo restores it in
// place, the overdue ring is the danger colour, and the row outline follows focus within.
const story = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe('ActionRow', () => {
  test('every control is a 44 px target; the row shows an outline while focus is within', async ({ page }) => {
    await page.goto(story('patterns-actionrow--default'));
    const ring = page.getByRole('button', { name: 'Mark done: Email Priya' });
    await expect(ring).toBeVisible();
    for (const name of ['Mark done: Email Priya', 'Snooze', 'Snooze options: Email Priya', 'Open: Email Priya']) {
      const box = await page.getByRole('button', { name, exact: true }).boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }
    await page.keyboard.press('Tab');
    await expect(ring).toBeFocused();
    const inner = page.getByRole('listitem').locator('> div > div'); // .content: padding, hover and the outline
    expect(await inner.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
    expect(await inner.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThanOrEqual(2);
  });

  test('done collapses the row and Undo in the toast restores it in place', async ({ page }) => {
    await page.goto(story('patterns-actionrow--with-undo'));
    const row = page.getByRole('listitem').filter({ hasText: 'Email Priya' });
    const before = (await row.boundingBox())!.height;
    expect(before).toBeGreaterThanOrEqual(56);
    await page.getByRole('button', { name: 'Mark done: Email Priya' }).click();
    await expect(row).toHaveAttribute('data-done', 'true');
    await expect.poll(async () => (await row.boundingBox())!.height).toBeLessThanOrEqual(1);
    await expect(page.getByRole('status')).toContainText('Done: Email Priya');
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(row).not.toHaveAttribute('data-done');
    await expect.poll(async () => (await row.boundingBox())!.height).toBeGreaterThanOrEqual(before - 1);
    await expect(page.getByRole('button', { name: 'Mark done: Email Priya' })).toBeVisible();
  });

  test('overdue: the ring and the due label are the danger colour; the title is not', async ({ page }) => {
    await page.goto(story('patterns-actionrow--overdue'));
    const item = page.getByRole('listitem');
    await expect(item).toHaveAttribute('data-group', 'overdue');
    // The ring takes color.border.danger and the label color.text.danger — two danger tokens, one meaning.
    const token = (name: string) => page.evaluate((n) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${n})`;
      document.body.append(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    }, name);
    const [ringStroke, dueColor, titleColor, borderDanger, textDanger] = await Promise.all([
      item.locator('circle').evaluate((el) => getComputedStyle(el).stroke),
      page.getByText('2 days ago').evaluate((el) => getComputedStyle(el).color),
      page.getByText('Follow up with Lumen Health').evaluate((el) => getComputedStyle(el).color),
      token('--iz-color-border-danger'),
      token('--iz-color-text-danger'),
    ]);
    expect(ringStroke).toBe(borderDanger);
    expect(dueColor).toBe(textDanger);
    expect(titleColor).not.toBe(dueColor);
    expect(titleColor).not.toBe(ringStroke);
  });
});
