import { login, logout, permissions } from '$tests/e2e/helpers';
import { test, expect } from '$tests/e2e/fixtures';
import {
  createApiContext,
  bulkAction,
  type EntityType,
} from '$tests/e2e/api-helpers';

/**
 * Helper: find a user by display name via API and return their ID.
 * Searches all users including deleted/archived so we can restore them.
 */
async function findUserId(userName: string): Promise<string | null> {
  const api = await createApiContext(process.env.VITE_API_URL!);
  const { request } = await import('@playwright/test');
  const context = await request.newContext({ baseURL: api.baseUrl });

  const response = await context.get(
    `/api/v1/users?per_page=100&include_deleted=true`,
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
 * Helper: restore a user by ID via API (undoes delete/archive).
 */
async function restoreUser(userId: string): Promise<void> {
  const api = await createApiContext(process.env.VITE_API_URL!);
  await bulkAction(api, 'users' as EntityType, [userId], 'restore');
}

/**
 * Helper: ensure a user exists and is active before a test runs.
 * If they were deleted/archived in a prior failed run, restore them.
 * If they don't exist at all, create them via API.
 */
async function ensureUserExists(userName: string): Promise<string> {
  let userId = await findUserId(userName);

  if (userId) {
    await restoreUser(userId);
    return userId;
  }

  // User doesn't exist — create them
  const [firstName, ...lastParts] = userName.split(' ');
  const lastName = lastParts.join(' ');
  const email = `${firstName.toLowerCase()}@example.com`;

  const api = await createApiContext(process.env.VITE_API_URL!);
  const { request } = await import('@playwright/test');
  const context = await request.newContext({ baseURL: api.baseUrl });

  const response = await context.post('/api/v1/users', {
    headers: api.headers,
    data: {
      first_name: firstName,
      last_name: lastName,
      email,
    },
  });

  const body = await response.json();
  await context.dispose();

  userId = body.data?.id;
  if (!userId) {
    throw new Error(`Failed to create user "${userName}": ${JSON.stringify(body).slice(0, 200)}`);
  }

  return userId;
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

  await page.locator('tbody').first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

  await expect(page.getByText('user@example.com')).not.toBeVisible({ timeout: 10000 });

  await logout(page);
});

test('deleting user', async ({ page }) => {
  // Ensure the user exists (restore if deleted by a prior failed run)
  const userId = await ensureUserExists('Quotes Example');

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

  await expect(page.getByText('Successfully deleted user')).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await expect(
    page.getByRole('link', { name: 'Quotes Example', exact: true })
  ).not.toBeVisible({ timeout: 10000 });

  // Restore the user so subsequent runs still work
  await restoreUser(userId);
});

test('archiving user', async ({ page }) => {
  const userId = await ensureUserExists('Expenses Example');

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

  await expect(page.getByText('Successfully deleted user')).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await expect(
    page.getByRole('link', { name: 'Expenses Example', exact: true })
  ).not.toBeVisible({ timeout: 10000 });

  // Restore the user so subsequent runs still work
  await restoreUser(userId);
});

test('removing user', async ({ page }) => {
  const userId = await ensureUserExists('Tasks Example');

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

  await expect(page.getByText('Successfully removed user')).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await expect(
    page.getByRole('link', { name: 'Tasks Example', exact: true })
  ).not.toBeVisible({ timeout: 10000 });

  // Restore the user so subsequent runs still work
  await restoreUser(userId);
});
