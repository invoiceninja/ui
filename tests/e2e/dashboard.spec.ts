import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test("Can't view dashboard without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Dashboard'
  );

  await logout(page);
});

test('Can view dashboard with permission', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_dashboard');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).toContainText(
    'Dashboard'
  );

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Dashboard' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Welcome! Glad to see you.' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Overview' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Recent Activity' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Recent Payments' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Upcoming Invoices' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Past Due Invoices' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Expired Quotes' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Upcoming Quotes' })
      .first()
  ).toBeVisible();

  await logout(page);
});
