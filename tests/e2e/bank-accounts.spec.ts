import { login, logout } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test('test cloneee', () => {
  const endpoint = process.env.VITE_API_URL;

  expect(endpoint).toEqual('http://ninja.test:8000');
});

test('API URL correct Reachable', () => {
  const endpoint = process.env.VITE_API_URL;

  expect(endpoint).toEqual('http://ninja.test:8000');
});

test('should create a bug report', async ({ request }) => {
  const endpoint = process.env.VITE_API_URL;

  const result = await request.get(`${endpoint}/api/v1/ping`);

  expect(result.ok());
});

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

  const nordigenConnectionTab = await page.waitForEvent('popup');

  await nordigenConnectionTab.waitForURL('**/nordigen/connect/**');

  await logout(page);
});
