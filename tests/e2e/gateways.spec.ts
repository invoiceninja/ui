import { login } from '$tests/e2e/helpers';
import {
  bulkAction,
  type EntityType,
} from '$tests/e2e/api-helpers';
import {
  extractIdFromUrl,
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
} from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';

resetAccountBeforeAll();

/**
 * GatewaysTable embeds SelectWithApplyButton for lifecycle filtering.
 * defaultValue must be SelectOption[] (e.g. [options[0]]), not a single option.
 *
 * Bulk Actions only renders when at least one row checkbox is selected.
 */

const COMPANY_GATEWAYS = 'company_gateways' as EntityType;
const ADD_GATEWAY_LABEL = 'Add Payment Gateway';

let createdGatewayIds: string[] = [];

test.beforeEach(() => {
  createdGatewayIds = [];
});

test.afterEach(async ({ api }) => {
  if (!createdGatewayIds.length) return;

  try {
    await bulkAction(api.context, COMPANY_GATEWAYS, createdGatewayIds, 'archive');
    await bulkAction(api.context, COMPANY_GATEWAYS, createdGatewayIds, 'delete');
  } catch {
    // Best-effort cleanup.
  }
});

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
    .filter({
      has: page.getByRole('link', { name: ADD_GATEWAY_LABEL, exact: true }),
    })
    .first();

const gatewayTableRows = (page: Page) =>
  page.locator('table tbody a[href*="/settings/gateways/"]');

const actionsButton = (page: Page) =>
  gatewaysToolbar(page).getByRole('button', { name: 'Actions', exact: true });

const saveSettingsForm = async (page: Page) => {
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
};

const confirmDuplicateGatewayIfPresent = async (page: Page) => {
  const yesButton = page.getByRole('button', { name: 'Yes', exact: true });

  try {
    await yesButton.waitFor({ state: 'visible', timeout: 3000 });
    await yesButton.click();
  } catch {
    // No duplicate-gateway confirmation for this provider.
  }
};

const trackGatewayFromUrl = (url: string) => {
  const id = extractIdFromUrl(url.split('?')[0], 'gateways');

  if (!id) {
    throw new Error(`Could not extract gateway id from ${url}`);
  }

  createdGatewayIds.push(id);

  return id;
};

const createCustomGateway = async (page: Page) => {
  const label = uniqueName('custom-gateway');

  await page.getByRole('link', { name: ADD_GATEWAY_LABEL, exact: true }).click();
  await page.waitForURL('**/settings/gateways/create');
  await page.waitForLoadState('networkidle');

  await page.getByRole('main').getByRole('combobox').click();
  await page.getByRole('option', { name: 'Custom', exact: true }).click();

  await confirmDuplicateGatewayIfPresent(page);

  await page
    .locator('[data-cy="tabs"]')
    .getByRole('button', { name: 'Settings', exact: true })
    .click();

  const labelInput = page
    .locator('dt:has-text("Label")')
    .locator('..')
    .locator('input')
    .first();

  await labelInput.click();
  await labelInput.fill(label);

  await saveSettingsForm(page);

  await expect(
    page.getByText('Successfully created gateway', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.waitForURL('**/settings/gateways/**/edit**');

  trackGatewayFromUrl(page.url());

  await navigateToOnlinePayments(page);

  await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible({
    timeout: 10000,
  });

  return label;
};

/** Create a Custom gateway when the active gateways table is empty. */
const ensureCustomGateway = async (page: Page): Promise<string> => {
  await navigateToOnlinePayments(page);

  if ((await gatewayTableRows(page).count()) > 0) {
    const label = await gatewayTableRows(page).first().textContent();
    return label?.trim() ?? '';
  }

  return createCustomGateway(page);
};

const selectGatewayRow = async (page: Page, label: string) => {
  const row = page.locator('table tbody tr').filter({
    has: page.getByRole('link', { name: label, exact: true }),
  });

  await row.locator('input.child-checkbox').click();
};

const runGatewayBulkAction = async (
  page: Page,
  action: 'Archive' | 'Restore' | 'Delete'
) => {
  await actionsButton(page).click();
  await page.getByRole('button', { name: action, exact: true }).click();
};

const waitForCompanyGateways = (page: Page, status: string) =>
  page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.url().includes('/api/v1/company_gateways?') &&
      response.url().includes(`status=${status}`) &&
      response.ok(),
    { timeout: 15000 }
  );

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
  const response = waitForCompanyGateways(page, status.toLowerCase());

  await openStatusFilterMenu(page);

  const menu = statusFilterMenu(page);
  const options = menu.getByRole('option');
  const optionCount = await options.count();

  for (let index = 0; index < optionCount; index++) {
    const option = options.nth(index);
    const optionLabel =
      (await option.locator('span.text-sm').textContent())?.trim() ?? '';
    const shouldBeSelected = optionLabel === status;
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

  await response;
};

test('gateways status filter renders without throwing', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await login(page);
  await ensureCustomGateway(page);

  await expect(
    page.getByRole('link', { name: ADD_GATEWAY_LABEL, exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(gatewaysToolbar(page).getByText('Status:', { exact: true })).toBeVisible();
  await expect(
    gatewaysToolbar(page).getByText('Active', { exact: true }).first()
  ).toBeVisible();

  expect(pageErrors).toEqual([]);
});

test('gateways bulk actions appear only when a gateway row is selected', async ({
  page,
}) => {
  await login(page);

  const label = await ensureCustomGateway(page);

  await expect(actionsButton(page)).toHaveCount(0);

  await selectGatewayRow(page, label);

  await expect(actionsButton(page)).toBeVisible({ timeout: 10000 });
  await actionsButton(page).click();
  await expect(
    page.getByRole('button', { name: 'Archive', exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByRole('button', { name: 'Delete', exact: true })
  ).toBeVisible({ timeout: 10000 });
});

test('gateways can archive and restore via bulk actions', async ({ page }) => {
  test.setTimeout(90_000);

  await login(page);

  const label = await ensureCustomGateway(page);

  await expect(actionsButton(page)).toHaveCount(0);

  await selectGatewayRow(page, label);

  await runGatewayBulkAction(page, 'Archive');

  await expect(
    page.getByText('Successfully archived gateway', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(page.getByRole('link', { name: label, exact: true })).not.toBeVisible({
    timeout: 10000,
  });

  await applyStatusFilter(page, 'Archived');

  await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible({
    timeout: 10000,
  });

  await selectGatewayRow(page, label);

  await runGatewayBulkAction(page, 'Restore');

  await expect(
    page.getByText('Successfully restored gateway', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await applyStatusFilter(page, 'Active');

  await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible({
    timeout: 10000,
  });
});
