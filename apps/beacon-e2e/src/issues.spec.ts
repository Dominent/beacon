import { expect, test } from '@playwright/test';

/**
 * End-to-end happy path for the issues domain: list renders from the API,
 * debounced search filters it, a row navigates to detail, and an optimistic
 * status change is reflected. Exercises the full stack (Angular + express API).
 */
test('issues: list, search, open detail, change status', async ({ page }) => {
  await page.goto('/issues');

  // The list renders as a grid of rows fetched from the API.
  const rows = page.locator('.list__row');
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(0);

  // Debounced server-side search narrows the list to matching titles.
  await page.locator('.list__search').fill('keyboard');
  await expect(page.locator('.card__title').first()).toContainText(/keyboard/i);

  // Clicking a row navigates to the issue detail page.
  await rows.first().click();
  await expect(page).toHaveURL(/\/issues\/i\d+/);
  await expect(page.locator('.detail__title')).toBeVisible();

  // Optimistic status change is reflected in the status badge.
  await page.getByRole('button', { name: 'In Progress' }).click();
  await expect(page.locator('bc-status-badge')).toContainText('In Progress');
});
