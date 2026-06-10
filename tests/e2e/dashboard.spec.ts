import { apiPermissions, login, logout } from '$tests/e2e/helpers';
import { resetAccountBeforeAll, test, expect } from '$tests/e2e/fixtures';

resetAccountBeforeAll();

test("Can't view dashboard without permission", async ({ page, api }) => {
  test.setTimeout(60000);
  const { clear, save } = apiPermissions(api.context);

  await clear();
  await save();

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Dashboard'
  );

  await logout(page);
});

test('Can view dashboard with permission', async ({ page, api }) => {
  test.setTimeout(60000);
  const { clear, save, set } = apiPermissions(api.context);

  await clear();
  await set('view_dashboard');
  await save();

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).toContainText(
    'Dashboard'
  );

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Dashboard' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText('Welcome! Glad to see you.').first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Overview' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Recent Activity' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Recent Payments' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Upcoming Invoices' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Past Due Invoices' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Expired Quotes' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('heading', { exact: true })
      .filter({ hasText: 'Upcoming Quotes' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await logout(page);
});
