import { login, logout } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test('Connecting Nordigen', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page.waitForURL('/settings/company_details');

  await page
    .getByRole('link', { name: 'Credit Cards & Banks', exact: true })
    .click();

  await page.waitForURL('/settings/bank_accounts');

  await page
    .getByRole('button', { name: 'Connect Accounts', exact: true })
    .click();

  await expect(
    page.getByRole('heading', { name: 'Connect Accounts', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Connect', exact: true })
  ).toBeDisabled();

  await page.locator('[data-cy="nordigenBox"]').click();

  await expect(
    page.getByRole('button', { name: 'Connect', exact: true })
  ).not.toBeDisabled();

  await page.getByRole('button', { name: 'Connect', exact: true }).click();

  const nordigenConnectionTab = await page.waitForEvent('popup');

  await nordigenConnectionTab.waitForURL('**/nordigen/connect/**');

  await logout(page);
});
