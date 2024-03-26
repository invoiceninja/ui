import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

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

  await page.locator('#filter').fill('');

  await page.waitForTimeout(500);

  await expect(page.getByText('user@example.com')).not.toBeVisible();

  await page.locator('[data-cy="dataTableChevronRight"]').click();

  await page.waitForTimeout(500);

  await expect(page.getByText('user@example.com')).not.toBeVisible();

  await logout(page);
});

test('deleting user', async ({ page }) => {
  await login(page);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .click();

  await page.getByRole('link', { name: 'Quotes Example', exact: true }).click();

  await page.getByLabel('Password').fill('password');
  await page.getByLabel('Password').press('Enter');

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
});

test('archiving user', async ({ page }) => {
  await login(page);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Products Example', exact: true })
    .click();

  await page.getByLabel('Password').fill('password');
  await page.getByLabel('Password').press('Enter');

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
    page.getByRole('link', { name: 'Products Example', exact: true })
  ).not.toBeVisible();
});

test('removing user', async ({ page }) => {
  await login(page);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await page
    .getByRole('link', { name: 'User Management', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Credits Example', exact: true })
    .click();

  await page.getByLabel('Password').fill('password');
  await page.getByLabel('Password').press('Enter');

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
    page.getByRole('link', { name: 'Credits Example', exact: true })
  ).not.toBeVisible();
});
