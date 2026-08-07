import { login } from '$tests/e2e/helpers';
import { resetAccountBeforeAll, test, expect } from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';

resetAccountBeforeAll();

/**
 * GatewaysTable embeds SelectWithApplyButton for lifecycle filtering.
 * defaultValue must be SelectOption[] (e.g. [options[0]]), not a single option.
 */

const navigateToOnlinePayments = async (page: Page) => {
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Payment Settings', exact: true })
    .click();

  await page.waitForURL('**/settings/online_payments');
};

const gatewaysToolbar = (page: Page) =>
  page
    .locator('.flex.flex-col')
    .filter({ has: page.getByRole('button', { name: 'Add Gateway', exact: true }) })
    .first();

const openStatusFilterMenu = async (page: Page) => {
  await gatewaysToolbar(page).getByText('Status:', { exact: true }).click();

  await expect(
    page.getByRole('option', { name: 'Active', exact: true })
  ).toBeVisible();
};

const statusFilterMenu = (page: Page) =>
  page.locator('[class*="menu"]').filter({
    has: page.getByRole('option', { name: 'Active', exact: true }),
  });

const applyStatusFilter = async (page: Page, status: 'Active' | 'Archived') => {
  await openStatusFilterMenu(page);

  const menu = statusFilterMenu(page);
  const options = menu.getByRole('option');
  const optionCount = await options.count();

  for (let index = 0; index < optionCount; index++) {
    const option = options.nth(index);
    const label =
      (await option.locator('span.text-sm').textContent())?.trim() ?? '';
    const shouldBeSelected = label === status;
    const checkbox = option.getByRole('checkbox');
    const isChecked = await checkbox.isChecked();

    if (isChecked !== shouldBeSelected) {
      await option.scrollIntoViewIfNeeded();
      await option.click();
    }
  }

  await expect(
    options.filter({ hasText: status }).first().getByRole('checkbox')
  ).toBeChecked();

  const applyButton = menu.getByRole('button', { name: 'Apply', exact: true });

  await applyButton.evaluate((button) => {
    (button as HTMLButtonElement).click();
  });
};

test('gateways status filter renders without throwing', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await login(page);
  await navigateToOnlinePayments(page);

  await expect(
    page.getByRole('button', { name: 'Add Gateway', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(gatewaysToolbar(page).getByText('Status:', { exact: true })).toBeVisible();
  await expect(gatewaysToolbar(page).getByText('Active', { exact: true })).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test('gateways status filter can apply archived lifecycle', async ({ page }) => {
  await login(page);
  await navigateToOnlinePayments(page);

  const archivedGatewaysRequest = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.url().includes('/api/v1/company_gateways?') &&
      response.url().includes('status=archived') &&
      response.ok(),
    { timeout: 15000 }
  );

  await applyStatusFilter(page, 'Archived');
  await archivedGatewaysRequest;

  await expect(gatewaysToolbar(page).getByText('Archived', { exact: true })).toBeVisible();
});
