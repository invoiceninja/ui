import type { Page } from '@playwright/test';
import { expect, resetAccountBeforeAll, test, uniqueName } from './fixtures';
import { login } from './helpers';

resetAccountBeforeAll();
test.use({ actionTimeout: 10_000 });

test.beforeEach(async ({ page }) => {
  test.setTimeout(60_000);
  await login(page);
});

function chartResponses(page: Page, range: string) {
  return Promise.all(
    ['totals_v2', 'chart_summary_v2'].map((endpoint) =>
      page.waitForResponse(
        (response) =>
          response.url().includes(`/api/v1/charts/${endpoint}`) &&
          response.request().method() === 'POST' &&
          response.request().postDataJSON().date_range === range
      )
    )
  );
}

function preferencesSaved(page: Page) {
  return page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' &&
      response.url().includes('/api/v1/company_users/') &&
      response.url().includes('/preferences') &&
      response.ok()
  );
}

test('dashboard All time updates both charts and closes the custom picker', async ({
  page,
}) => {
  await page.getByText('This Month', { exact: true }).click();
  await page.getByRole('option', { name: 'Custom', exact: true }).click();
  await expect(page.locator('.ant-picker')).toBeVisible();
  const responses = chartResponses(page, 'all_time');
  await page.getByText('Custom', { exact: true }).click();
  await page.getByRole('option', { name: 'All Time', exact: true }).click();
  for (const response of await responses) {
    expect(response.ok()).toBeTruthy();
  }
  await expect(page.locator('.ant-picker')).toHaveCount(0);
  await expect(page.getByText('All Time', { exact: true })).toBeVisible();
});

test('dashboard preferences saves All time after a custom range', async ({
  page,
}) => {
  // The preferences trigger currently has no accessible label.
  await page
    .locator('div.cursor-pointer')
    .filter({
      has: page.locator('svg circle[cx="9"][cy="8.999"]'),
    })
    .last()
    .click();
  const dialog = page.getByRole('dialog');
  const range = dialog
    .locator('select')
    .filter({ has: page.locator('option[value="all_time"]') });
  await range.selectOption('custom');
  await expect(dialog.locator('.ant-picker')).toBeVisible();
  await range.selectOption('all_time');
  await expect(dialog.locator('.ant-picker')).toHaveCount(0);
  const saved = preferencesSaved(page);
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  await saved;
  await expect(dialog).toBeHidden();
  const restored = chartResponses(page, 'all_time');
  await page.reload();
  for (const response of await restored) {
    expect(response.ok()).toBeTruthy();
  }
  await expect(page.getByText('All Time', { exact: true })).toBeVisible();
});

test('client statement All time replaces custom dates and carries into scheduling', async ({
  page,
  api,
}) => {
  const client = await api.createEntity('clients', {
    name: uniqueName('all-time-statement'),
  });
  // Exercise the real statement form without depending on PDF rendering services.
  await page.route('**/api/v1/client_statement', (route) =>
    route.fulfill({
      contentType: 'application/pdf',
      body: '%PDF-1.4\n%%EOF',
    })
  );
  await page.goto(`/clients/${client.id}/statement`);
  const range = page
    .locator('select')
    .filter({ has: page.locator('option[value="all_time"]') });
  await range.selectOption('custom');
  await page.locator('input[type="date"]').nth(0).fill('2025-01-01');
  await page.locator('input[type="date"]').nth(1).fill('2025-01-31');
  await page.locator('input[type="date"]').nth(1).press('Tab');
  const today = await page.evaluate(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  });
  const request = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/v1/client_statement') &&
      request.method() === 'POST' &&
      request.postDataJSON().dateRangeId === 'all_time'
  );
  await range.selectOption('all_time');
  expect((await request).postDataJSON()).toMatchObject({
    client_id: client.id,
    dateRangeId: 'all_time',
    start_date: '2000-01-01',
    end_date: today,
  });
  await expect(page.locator('input[type="date"]')).toHaveCount(0);
  await page.getByText('More Actions', { exact: true }).click();
  await page.getByText('Schedule', { exact: true }).click();
  await expect(page).toHaveURL(
    /\/settings\/schedules\/create\?template=email_statement/
  );
  await expect(page.getByText('All Time', { exact: true })).toBeVisible();
});

test('export All time clears custom bounds in the report request', async ({
  page,
}) => {
  // Capture submissions without scheduling emailed exports.
  await page.route('**/api/v1/reports/invoices', (route) =>
    route.fulfill({ json: { message: 'Exported' } })
  );
  await page.goto('/settings/import_export');
  const field = (label: string) =>
    page
      .getByRole('term')
      .filter({ hasText: new RegExp(`^${label}$`) })
      .locator('..')
      .getByRole('combobox');
  await field('Export Type').click();
  await page.getByRole('option', { name: 'Invoices', exact: true }).click();
  await field('Date').click();
  await page.getByRole('option', { name: 'Date', exact: true }).click();
  await field('Date Range').click();
  await page.getByRole('option', { name: 'Custom', exact: true }).click();
  await page.locator('input[type="date"]').nth(0).fill('2025-01-01');
  await page.locator('input[type="date"]').nth(0).press('Tab');
  await page.locator('input[type="date"]').nth(1).fill('2025-01-31');
  await page.locator('input[type="date"]').nth(1).press('Tab');
  const customRequest = page.waitForRequest('**/api/v1/reports/invoices');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  expect((await customRequest).postDataJSON()).toMatchObject({
    date_range: 'custom',
    start_date: '2025-01-01',
    end_date: '2025-01-31',
  });
  await expect(
    page.getByRole('button', { name: 'Export', exact: true })
  ).toBeEnabled();
  await field('Date Range').press('ArrowDown');
  await page.getByRole('option', { name: 'All Time', exact: true }).click();
  await expect(page.locator('input[type="date"]')).toHaveCount(0);
  const request = page.waitForRequest('**/api/v1/reports/invoices');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  expect((await request).postDataJSON()).toMatchObject({
    date_key: 'date',
    date_range: 'all_time',
    start_date: '',
    end_date: '',
  });
});
