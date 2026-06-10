import { login } from '$tests/e2e/helpers';
import {
  extractIdFromUrl,
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';

resetAccountBeforeAll();

const save = async (page: Page) => {
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
};

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
}

async function enableMilitaryTime(page: Page) {
  await page.goto('/settings/localization');
  await page.waitForLoadState('networkidle');

  const toggle = page.locator('[data-cy="militaryTimeToggle"]');
  await expect(toggle).toBeVisible({ timeout: 10000 });

  if ((await toggle.getAttribute('aria-checked')) !== 'true') {
    await toggle.click();
  }

  await expect(toggle).toHaveAttribute('aria-checked', 'true', {
    timeout: 10000,
  });
  await saveCompanySettings(page);
}

async function createClient(page: Page, api: ApiFixture, name: string) {
  await page.goto('/clients/create');
  await page.waitForURL('**/clients/create');
  await page.waitForLoadState('networkidle');

  await page
    .locator('div')
    .filter({ hasText: /^Name$/ })
    .getByRole('textbox')
    .fill(name);
  await save(page);

  await expect(
    page.getByText('Successfully created client', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/clients/**');
  trackClientFromUrl(api, page.url());
}

test('company localization defaults are inherited by new clients', async ({
  page,
  api,
  settingsGuard,
}) => {
  test.setTimeout(90000);

  await settingsGuard.snapshot();
  await login(page);

  await enableMilitaryTime(page);
  await createClient(page, api, uniqueName('localization-default-client'));

  await expect(page.locator('[data-cy="settingsTestingSpan"]')).toContainText(
    'Company: true',
    { timeout: 10000 }
  );
});
