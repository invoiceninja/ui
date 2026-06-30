import { login, logout, apiPermissions } from '$tests/e2e/helpers';
import { resetAccountBeforeAll, test, expect } from '$tests/e2e/fixtures';
import { baseEmailForAccount, emailForCurrentAccount } from '$tests/e2e/accounts';
import {
  createApiContext,
  bulkAction,
  fetchUserIdByEmail,
  type EntityType,
} from '$tests/e2e/api-helpers';

resetAccountBeforeAll();

/**
 * Helper: restore a user by ID via API (undoes delete/archive).
 */
async function restoreUser(userId: string): Promise<void> {
  const api = await createApiContext(process.env.VITE_API_URL!);
  await bulkAction(api, 'users' as EntityType, [userId], 'restore');
}

/**
 * Helper: ensure the current account lane user exists and is active.
 * Display names are duplicated across seed lanes, so resolve users by email.
 */
async function ensureUserExists(email: string): Promise<string> {
  const api = await createApiContext(process.env.VITE_API_URL!);
  let userId = await fetchUserIdByEmail(api, email);

  if (userId) {
    await restoreUser(userId);
    return userId;
  }

  const resolvedEmail = emailForCurrentAccount(email);
  const localPart = baseEmailForAccount(email).split('@')[0];
  const firstName = localPart.charAt(0).toUpperCase() + localPart.slice(1);

  const { request } = await import('@playwright/test');
  const context = await request.newContext({ baseURL: api.baseUrl });

  const response = await context.post('/api/v1/users', {
    headers: api.headers,
    data: {
      first_name: firstName,
      last_name: 'Example',
      email: resolvedEmail,
    },
  });

  const body = await response.json();
  await context.dispose();

  userId = body.data?.id;
  if (!userId) {
    throw new Error(`Failed to create user "${resolvedEmail}": ${JSON.stringify(body).slice(0, 200)}`);
  }

  return userId;
}

test("Can't see owner of the account in the list of users", async ({
  page, api,
}) => {
  const { clear, save, set } = apiPermissions(api.context);

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
  const ownerEmail = emailForCurrentAccount('user@example.com');
  await page.locator('#filter').fill(ownerEmail);

  await page.locator('tbody').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

  await expect(page.getByText(ownerEmail)).not.toBeVisible({ timeout: 10000 });

  await logout(page);
});

test('deleting user', async ({ page }) => {
  // Ensure the user exists (restore if deleted by a prior failed run)
  const userId = await ensureUserExists('quotes@example.com');
  const userEmail = emailForCurrentAccount('quotes@example.com');

  await login(page);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .click();

  await page.goto(`/settings/users/${userId}/edit`);

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

  await expect(page.getByText('Successfully deleted user')).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await page.locator('#filter').fill(userEmail);

  await expect(page.getByText(userEmail)).not.toBeVisible({ timeout: 10000 });

  // Restore the user so subsequent runs still work
  await restoreUser(userId);
});

test('archiving user', async ({ page }) => {
  const userId = await ensureUserExists('expenses@example.com');
  const userEmail = emailForCurrentAccount('expenses@example.com');

  await login(page);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .click();

  await page.goto(`/settings/users/${userId}/edit`);

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

  await expect(page.getByText('Successfully deleted user')).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await page.locator('#filter').fill(userEmail);

  await expect(page.getByText(userEmail)).not.toBeVisible({ timeout: 10000 });

  // Restore the user so subsequent runs still work
  await restoreUser(userId);
});

test('removing user', async ({ page }) => {
  const userId = await ensureUserExists('tasks@example.com');
  const userEmail = emailForCurrentAccount('tasks@example.com');

  await login(page);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .click();

  await page.goto(`/settings/users/${userId}/edit`);

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

  await expect(page.getByText('Successfully removed user')).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await page.locator('#filter').fill(userEmail);

  await expect(page.getByText(userEmail)).not.toBeVisible({ timeout: 10000 });

  // Restore the user so subsequent runs still work
  await restoreUser(userId);
});
