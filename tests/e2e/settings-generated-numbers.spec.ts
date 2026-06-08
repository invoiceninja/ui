import { login } from '$tests/e2e/helpers';
import {
  extractIdFromUrl,
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { Locator, Page } from '@playwright/test';

resetAccountBeforeAll();

const save = async (page: Page) => {
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
};

const typeTextbox = async (input: Locator, value: string | number) => {
  await input.click();
  await input.press('Control+A');
  await input.press('Backspace');
  await input.pressSequentially(String(value), { delay: 20 });
  await input.press('Tab');
};

const mainTextbox = (page: Page, index = 0) =>
  page.getByRole('main').getByRole('textbox').nth(index);

async function saveCompanySettings(page: Page) {
  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/companies/') &&
      response.request().method() === 'PUT',
    { timeout: 10000 }
  );

  await save(page);

  expect((await updateResponse).ok()).toBeTruthy();
  await expect(
    page.getByText('Successfully updated settings', { exact: true })
  ).toBeVisible({ timeout: 10000 });
}

function trackClientFromUrl(api: ApiFixture, url: string) {
  const id = extractIdFromUrl(url.split('?')[0], 'clients');

  if (!id) {
    throw new Error('Could not extract client id from ' + url);
  }

  api.trackEntity('clients', id);

  return id;
}

test('client generated number pattern is applied to new clients', async ({
  page,
  api,
  settingsGuard,
}) => {
  test.setTimeout(90000);

  await settingsGuard.snapshot();
  await login(page);

  const suffix = Date.now().toString(36).slice(-6);
  const pattern = 'GN-' + suffix + '-{$counter}';
  const counter = 731;
  const expectedNumber = 'GN-' + suffix + '-' + String(counter).padStart(4, '0');
  const clientName = uniqueName('generated-number-client');

  await page.goto('/settings/generated_numbers/clients');
  await page.waitForLoadState('networkidle');
  await expect(mainTextbox(page, 0)).toBeVisible({ timeout: 10000 });

  await typeTextbox(mainTextbox(page, 0), pattern);
  await typeTextbox(mainTextbox(page, 1), counter);
  await saveCompanySettings(page);

  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(mainTextbox(page, 0)).toHaveValue(pattern, { timeout: 10000 });
  await expect(mainTextbox(page, 1)).toHaveValue(String(counter), {
    timeout: 10000,
  });

  await page.goto('/clients/create');
  await page.waitForURL('**/clients/create');
  await page.waitForLoadState('networkidle');

  await page
    .locator('div')
    .filter({ hasText: /^Name$/ })
    .getByRole('textbox')
    .fill(clientName);
  await save(page);

  await expect(
    page.getByText('Successfully created client', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/clients/**');
  trackClientFromUrl(api, page.url());

  await expect(
    page.getByRole('main').getByText(expectedNumber, { exact: true }).first()
  ).toBeVisible({ timeout: 10000 });
});
