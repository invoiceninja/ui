import { login, logout } from '$tests/e2e/helpers';
import test from '@playwright/test';

test.skip('Connecting Nordigen', async ({ page }) => {
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

  const nordigenConnectionTab = await page.waitForEvent('popup');

  await nordigenConnectionTab.waitForURL('**/nordigen/connect/**');

  await logout(page);
});
