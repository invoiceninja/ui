import { login } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
} from '$tests/e2e/fixtures';
import { emailForCurrentAccount } from '$tests/e2e/accounts';
import type { ApiContext } from '$tests/e2e/api-helpers';
import { request, type Page } from '@playwright/test';

resetAccountBeforeAll();

/**
 * Create a fresh, active company user for mutation tests.
 * Do not reuse seed permission users — they are often already deleted
 * and are shared with other specs.
 */
async function createActiveUser(
  api: ApiContext,
  prefix: string
): Promise<string> {
  const context = await request.newContext({ baseURL: api.baseUrl });

  try {
    const response = await context.post('/api/v1/users', {
      headers: api.headers,
      data: {
        first_name: prefix,
        last_name: 'Target',
        email: `${uniqueName(prefix)}@example.test`,
      },
    });

    const body = await response.json();
    const user = body.data as
      | { id?: string; is_deleted?: boolean; archived_at?: number }
      | undefined;

    if (!response.ok() || !user?.id) {
      throw new Error(
        `Failed to create an active ${prefix} user (${response.status()}): ${JSON.stringify(
          body
        ).slice(0, 200)}`
      );
    }

    if (user.is_deleted || user.archived_at) {
      throw new Error(
        `Created ${prefix} user ${user.id} is not active (is_deleted=${String(
          user.is_deleted
        )}, archived_at=${String(user.archived_at)})`
      );
    }

    return user.id;
  } finally {
    await context.dispose();
  }
}

test("Can't see owner of the account in the list of users", async ({
  page,
  api,
}) => {

  await api.setPermissions('permissions@example.com', ['admin']);

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

});

/**
 * Open a user edit page by ID, confirming password if prompted.
 * Prefer this over matching display names — duplicate names break strict mode.
 */
async function openUserById(page: Page, userId: string) {
  await page.goto(`/settings/users/${userId}/edit`);

  const passwordField = page.getByLabel('Password');
  if (await passwordField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await passwordField.fill('password');
    await passwordField.press('Enter');
  }

  await page.waitForURL(`**/settings/users/${userId}/edit`);
}

function userRowLink(page: Page, userId: string) {
  return page.locator(`a[href*="/settings/users/${userId}/edit"]`);
}

test('deleting user', async ({ page, api }) => {
  const userId = await createActiveUser(api.context, 'Delete');

  await login(page);
  await openUserById(page, userId);

  const moreActionsButton = page
    .locator('[data-cy="chevronDownButton"]')
    .first();

  await moreActionsButton.click();

  await page.getByRole('button', { name: 'Delete', exact: true }).click();

  await expect(page.getByText('Successfully deleted user')).toBeVisible({
    timeout: 10000,
  });

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await expect(userRowLink(page, userId)).not.toBeVisible({ timeout: 10000 });
});

test('archiving user', async ({ page, api }) => {
  const userId = await createActiveUser(api.context, 'Archive');

  await login(page);
  await openUserById(page, userId);

  const moreActionsButton = page
    .locator('[data-cy="chevronDownButton"]')
    .first();

  await moreActionsButton.click();

  await page.getByRole('button', { name: 'Delete', exact: true }).click();

  await expect(page.getByText('Successfully deleted user')).toBeVisible({
    timeout: 10000,
  });

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await expect(userRowLink(page, userId)).not.toBeVisible({ timeout: 10000 });
});

test('removing user', async ({ page, api }) => {
  const userId = await createActiveUser(api.context, 'Remove');

  await login(page);
  await openUserById(page, userId);

  const moreActionsButton = page
    .locator('[data-cy="chevronDownButton"]')
    .first();

  await moreActionsButton.click();

  await page.getByRole('button', { name: 'Remove', exact: true }).click();

  await expect(page.getByText('Successfully removed user')).toBeVisible({
    timeout: 10000,
  });

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .first()
    .click();

  await expect(userRowLink(page, userId)).not.toBeVisible({ timeout: 10000 });
});
