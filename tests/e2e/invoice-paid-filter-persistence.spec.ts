import { login, waitForTableData } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { request as playwrightRequest, type Page } from '@playwright/test';
import { createClient } from './client-helpers';

resetAccountBeforeAll();

test('paid status filter persists into client overview but clears after leaving the record scope', async ({
  page,
  api,
}) => {

  const clientName = uniqueName('paid-filter-client');

  // 1. Login with the admin user.
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page.waitForURL('**/invoices');

  const hasInvoices = await waitForTableData(page);

  // 2. If no invoices are present, create a new invoice and mark it as paid.
  if (!hasInvoices) {
    await createAndMarkPaidInvoiceViaUI(page, api, clientName);

    await page
      .locator('[data-cy="navigationBar"]')
      .getByRole('link', { name: 'Invoices', exact: true })
      .click();

    await page.waitForURL('**/invoices');
    await waitForTableData(page);
  }

  // 3. From the invoices list view, set the paid status filter on.
  await setStatusFilter(page, 'Paid');
  await expectStatusFilterValue(page, 'Paid');
  await waitForTableData(page);

  // Table filter preferences are debounced before the client overview can inherit them.
  await page.waitForTimeout(2000);

  // 4. Click the client on the first invoice to navigate to the client overview.
  const clientLink = page
    .locator('[data-cy="dataTable"] tbody a[href*="/clients/"]')
    .first();

  await expect(clientLink).toBeVisible({ timeout: 10000 });
  await clientLink.click();

  await page.waitForURL('**/clients/**');

  // 5. Confirm the paid filter exists on the client overview invoices tab.
  await waitForTableData(page);
  await expectStatusFilterValue(page, 'Paid');

  // 6. Remove the paid status filter on the client overview.
  await clearStatusFilter(page);
  await expectStatusFilterEmpty(page);
  await waitForTableData(page);

  // Persist the cleared filter in the client scope before navigating away.
  await page.waitForTimeout(2000);

  // 7. Open the invoice from the client overview.
  await page
    .locator('[data-cy="dataTable"] tbody a[href*="/invoices/"]')
    .first()
    .click();

  await page.waitForURL('**/invoices/**/edit');

  // 8. Click the View client action on the invoice to return to the overview.
  await clickViewClientFromInvoice(page);

  await page.waitForURL('**/clients/**');
  await waitForTableData(page);

  // 9. The status filter must be empty — Paid should not be applied.
  await expectStatusFilterEmpty(page);
});

async function createAndMarkPaidInvoiceViaUI(
  page: Page,
  api: ApiFixture,
  clientName: string
) {
  await createClient({
    page,
    withNavigation: true,
    createIfNotExist: false,
    name: clientName,
  });

  const clientId = page.url().match(/clients\/([^/]+)/)?.[1];
  if (clientId) api.trackEntity('clients', clientId);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Invoice' })
    .click();

  const clientCombobox = page.getByRole('combobox', { name: 'Client' });
  await clientCombobox.click();
  await clientCombobox.fill(clientName);
  await page.getByRole('option', { name: clientName }).first().click();

  await page.getByRole('button', { name: 'Add Item' }).click();
  await page.locator('#notes').fill('Paid filter test item');
  await page.locator('#notes').press('Tab');

  const lineItemRow = page.getByRole('row', { name: /Paid filter test item/ });
  await lineItemRow.getByRole('textbox').nth(2).fill('1');
  await lineItemRow.getByRole('textbox').nth(3).fill('25');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created invoice', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

  await clickInvoiceDropdownAction(page, 'Mark Paid');

  await expect(page.getByText('Paid', { exact: true }).first()).toBeVisible({
    timeout: 10000,
  });

}

async function markInvoicePaidViaApi(api: ApiFixture, invoiceId: string) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const response = await context.post('/api/v1/invoices/bulk', {
      headers: api.context.headers,
      data: { action: 'mark_paid', ids: [invoiceId] },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to mark invoice paid (${response.status()}): ${(
          await response.text()
        ).slice(0, 300)}`
      );
    }
  } finally {
    await context.dispose();
  }
}

async function clickInvoiceDropdownAction(page: Page, actionName: string) {
  await page.keyboard.press('Escape');

  const chevron = page
    .locator('[data-cy="topNavbar"]')
    .locator('[data-cy="chevronDownButton"]');

  await chevron.click();

  const dropdown = page.locator('[data-cy="invoiceActionDropdown"]');
  await expect(dropdown).toBeVisible({ timeout: 5000 });
  await dropdown.getByText(actionName, { exact: true }).click();
}

async function clickViewClientFromInvoice(page: Page) {
  await page
    // .locator('div')
    // .filter({ has: page.getByRole('combobox', { name: 'Client' }) })
    // .getByRole('link', { name: 'View', exact: true })
    // .click();

    page.getByRole('link', { name: 'View', exact: true }).click();
}

function statusFilterControl(page: Page) {
  return page
    .locator('[data-cy="dataTable"]')
    .locator('div.flex.xl\\:space-x-1')
    .filter({ has: page.locator('span', { hasText: /^Status:$/ }) })
    .first();
}

function statusFilterMenu(page: Page) {
  return page
    .locator('[class*="-menu"]')
    .filter({ has: page.getByRole('button', { name: 'Apply', exact: true }) })
    .last();
}

async function openStatusFilter(page: Page) {
  await statusFilterControl(page).click();

  await expect(
    statusFilterMenu(page).getByRole('button', { name: 'Apply', exact: true })
  ).toBeVisible({ timeout: 5000 });
}

async function setStatusFilter(page: Page, label: string) {
  await openStatusFilter(page);

  const menu = statusFilterMenu(page);

  await menu.getByRole('button', { name: 'Reset', exact: true }).click();
  await menu.getByText(label, { exact: true }).click();
  await menu.getByRole('button', { name: 'Apply', exact: true }).click();
}

async function clearStatusFilter(page: Page) {
  await openStatusFilter(page);

  const menu = statusFilterMenu(page);

  await menu.getByRole('button', { name: 'Reset', exact: true }).click({ force: true });
  await menu.getByRole('button', { name: 'Apply', exact: true }).click({ force: true });
}

async function expectStatusFilterValue(page: Page, value: string) {
  await expect(statusFilterControl(page).locator('span.truncate')).toHaveText(
    value,
    { timeout: 10000 }
  );
}

async function expectStatusFilterEmpty(page: Page) {
  const statusValue = statusFilterControl(page).locator('span.truncate');

  await expect(statusValue).toHaveText('', { timeout: 10000 });
  await expect(statusFilterControl(page)).not.toContainText('Paid');
}
