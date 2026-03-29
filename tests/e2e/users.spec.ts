import { login, logout, permissions } from '$tests/e2e/helpers';
import { test, expect } from '$tests/e2e/fixtures';
import {
  createApiContext,
  bulkAction,
  type EntityType,
} from '$tests/e2e/api-helpers';

/**
 * Helper: find a user by display name via API and return their ID.
 */
async function findUserId(userName: string): Promise<string | null> {
  const api = await createApiContext(process.env.VITE_API_URL!);
  const { request } = await import('@playwright/test');
  const context = await request.newContext({ baseURL: api.baseUrl });

  const response = await context.get(
    `/api/v1/users?per_page=100`,
    { headers: api.headers }
  );

  if (!response.ok()) {
    await context.dispose();
    return null;
  }

  const body = await response.json();
  await context.dispose();

  const user = (body.data || []).find(
    (u: { first_name: string; last_name: string }) =>
      `${u.first_name} ${u.last_name}`.trim() === userName
  );

  return user?.id || null;
}

/**
 * Helper: restore a user by ID via API.
 */
async function restoreUser(userId: string): Promise<void> {
  const api = await createApiContext(process.env.VITE_API_URL!);
  await bulkAction(api, 'users' as EntityType, [userId], 'restore');
}

test("Can't see owner of the account in the list of users", async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page.waitForURL('/settings/company_details');

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .click();

  await page.waitForURL('/settings/users');

  // Filter for the owner's email — should not be visible to non-owners
  await page.locator('#filter').fill('user@example.com');

  await page.waitForTimeout(1000);

  await expect(page.getByText('user@example.com')).not.toBeVisible();

  await logout(page);
});

test('deleting user', async ({ page }) => {
  // Capture user ID before deletion so we can restore afterward
  const userId = await findUserId('Quotes Example');

  await login(page);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .click();

  await page.getByRole('link', { name: 'Quotes Example', exact: true }).click();

  const passwordField = page.getByLabel('Password');
  if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await passwordField.fill('password');
    await passwordField.press('Enter');
  }

  const moreActionsButton = page
    .locator('[data-cy="chevronDownButton"]')
    .first();

  await moreActionsButton.click();

  await page.getByRole('button', { name: 'Delete', exact: true }).click();

  await expect(page.getByText('Successfully deleted user')).toBeVisible();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await expect(
    page.getByRole('link', { name: 'Quotes Example', exact: true })
  ).not.toBeVisible();

  // Restore the user so subsequent runs still work
  if (userId) {
    await restoreUser(userId);
  }
});

test('archiving user', async ({ page }) => {
  const userId = await findUserId('Expenses Example');

  await login(page);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Expenses Example', exact: true })
    .click();

  const passwordField = page.getByLabel('Password');
  if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await passwordField.fill('password');
    await passwordField.press('Enter');
  }

  const moreActionsButton = page
    .locator('[data-cy="chevronDownButton"]')
    .first();

  await moreActionsButton.click();

  await page.getByRole('button', { name: 'Delete', exact: true }).click();

  await expect(page.getByText('Successfully deleted user')).toBeVisible();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await expect(
    page.getByRole('link', { name: 'Expenses Example', exact: true })
  ).not.toBeVisible();

  // Restore the user so subsequent runs still work
  if (userId) {
    await restoreUser(userId);
  }
});

test('removing user', async ({ page }) => {
  const userId = await findUserId('Tasks Example');

  await login(page);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Tasks Example', exact: true })
    .click();

  const passwordField = page.getByLabel('Password');
  if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await passwordField.fill('password');
    await passwordField.press('Enter');
  }

  const moreActionsButton = page
    .locator('[data-cy="chevronDownButton"]')
    .first();

  await moreActionsButton.click();

  await page.getByRole('button', { name: 'Remove', exact: true }).click();

  await expect(page.getByText('Successfully removed user')).toBeVisible();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await expect(
    page.getByRole('link', { name: 'Tasks Example', exact: true })
  ).not.toBeVisible();

  // Restore the user so subsequent runs still work
  if (userId) {
    await restoreUser(userId);
  }
});
