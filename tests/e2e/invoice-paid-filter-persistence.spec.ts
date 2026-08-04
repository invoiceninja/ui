import { login, waitForTableData } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { request as playwrightRequest, type Page } from '@playwright/test';

resetAccountBeforeAll();

test('paid status filter persists into client overview but clears after leaving the record scope', async ({
  page,
  api,
}) => {
  test.setTimeout(90_000);

  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page.waitForURL('**/invoices');

  const hasInvoices = await waitForTableData(page);

  if (!hasInvoices) {
    const { clientName } = await createPaidInvoice(api);

    await page.reload();
    await page.waitForURL('**/invoices');
    await waitForTableData(page);

    await expect(
      page.locator('[data-cy="dataTable"]').getByText(clientName).first()
    ).toBeVisible({ timeout: 10000 });
  }

  await setStatusFilter(page, 'Paid');
  await expectStatusFilterValue(page, 'Paid');
  await waitForTableData(page);

  // Table filter preferences are debounced 1500ms before they are stored and
  // available for the client overview to inherit.
  await page.waitForTimeout(2000);

  const clientLink = page
    .locator('[data-cy="dataTable"] tbody a[href*="/clients/"]')
    .first();

  await expect(clientLink).toBeVisible({ timeout: 10000 });
  await clientLink.click();

  await page.waitForURL('**/clients/**');
  await waitForTableData(page);

  await expectStatusFilterValue(page, 'Paid');

  await clearStatusFilter(page);
  await expectStatusFilterValue(page, '');
  await waitForTableData(page);

  await page
    .locator('[data-cy="dataTable"] tbody a[href*="/invoices/"]')
    .first()
    .click();

  await page.waitForURL('**/invoices/**');

  await page
    .getByRole('main')
    .getByRole('link', { name: 'View', exact: true })
    .first()
    .click();

  await page.waitForURL('**/clients/**');
  await waitForTableData(page);

  await expectStatusFilterValue(page, '');
});

async function createPaidInvoice(api: ApiFixture) {
  const clientName = uniqueName('paid-filter-client');
  const client = await api.createEntity('clients', {
    name: clientName,
    contacts: [
      {
        first_name: 'Paid',
        last_name: 'Filter',
        email: `${clientName}@example.test`,
      },
    ],
  });

  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const blankResponse = await context.get('/api/v1/invoices/create', {
      headers: api.context.headers,
    });

    if (!blankResponse.ok()) {
      throw new Error(
        `Failed to fetch blank invoice (${blankResponse.status()})`
      );
    }

    const blank = (await blankResponse.json()).data;

    const createResponse = await context.post('/api/v1/invoices', {
      headers: api.context.headers,
      data: {
        ...blank,
        client_id: client.id,
        date: '2026-08-01',
        line_items: [
          {
            product_key: uniqueName('paid-filter-item'),
            notes: 'Paid filter persistence item',
            cost: 25,
            quantity: 1,
          },
        ],
      },
    });

    if (!createResponse.ok()) {
      throw new Error(
        `Failed to create invoice (${createResponse.status()}): ${(
          await createResponse.text()
        ).slice(0, 300)}`
      );
    }

    const invoice = (await createResponse.json()).data;
    api.trackEntity('invoices', invoice.id);

    const paidResponse = await context.post('/api/v1/invoices/bulk', {
      headers: api.context.headers,
      data: { action: 'mark_paid', ids: [invoice.id] },
    });

    if (!paidResponse.ok()) {
      throw new Error(
        `Failed to mark invoice paid (${paidResponse.status()}): ${(
          await paidResponse.text()
        ).slice(0, 300)}`
      );
    }

    return { clientName, clientId: client.id as string, invoiceId: invoice.id };
  } finally {
    await context.dispose();
  }
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

  // Reset first so a leftover selection does not toggle the option off.
  await menu.getByRole('button', { name: 'Reset', exact: true }).click();

  await menu.getByText(label, { exact: true }).click();
  await menu.getByRole('button', { name: 'Apply', exact: true }).click();
}

async function clearStatusFilter(page: Page) {
  await openStatusFilter(page);

  const menu = statusFilterMenu(page);

  // Toggle off the active status instead of Reset — the fixed menu can block Reset clicks.
  await menu.getByText('Paid', { exact: true }).click();
  await menu.getByRole('button', { name: 'Apply', exact: true }).click({ force: true });
}

async function expectStatusFilterValue(page: Page, value: string) {
  await expect(statusFilterControl(page).locator('span.truncate')).toHaveText(
    value,
    { timeout: 10000 }
  );
}
