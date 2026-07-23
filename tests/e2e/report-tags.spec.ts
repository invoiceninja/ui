import { login, logout } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  extractIdFromUrl,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { type EntityType } from '$tests/e2e/api-helpers';
import { type Page } from '@playwright/test';

resetAccountBeforeAll();

const TAGS = 'tags' as EntityType;

interface ReportCase {
  label: string;
  tagEntityType: string;
  scheduleReportName: string;
}

const REPORT_CASES: ReportCase[] = [
  { label: 'Client', tagEntityType: 'client', scheduleReportName: 'client' },
  { label: 'Invoice', tagEntityType: 'invoice', scheduleReportName: 'invoice' },
  {
    label: 'Invoice Item',
    tagEntityType: 'invoice',
    scheduleReportName: 'invoice_item',
  },
  { label: 'Quote', tagEntityType: 'quote', scheduleReportName: 'quote' },
  {
    label: 'Quote Item',
    tagEntityType: 'quote',
    scheduleReportName: 'quote_item',
  },
  { label: 'Credit', tagEntityType: 'credit', scheduleReportName: 'credit' },
  { label: 'Payment', tagEntityType: 'payment', scheduleReportName: 'payment' },
  { label: 'Expense', tagEntityType: 'expense', scheduleReportName: 'expense' },
  { label: 'Task', tagEntityType: 'task', scheduleReportName: 'task' },
  { label: 'Product', tagEntityType: 'product', scheduleReportName: 'product' },
  { label: 'Vendor', tagEntityType: 'vendor', scheduleReportName: 'vendor' },
  {
    label: 'Purchase Order',
    tagEntityType: 'purchase_order',
    scheduleReportName: 'purchase_order',
  },
  {
    label: 'Purchase Order Item',
    tagEntityType: 'purchase_order',
    scheduleReportName: 'purchase_order_item',
  },
  {
    label: 'Recurring Invoice',
    tagEntityType: 'recurring_invoice',
    scheduleReportName: 'recurring_invoice',
  },
  {
    label: 'Recurring Invoice Item',
    tagEntityType: 'recurring_invoice',
    scheduleReportName: 'recurring_invoice_item',
  },
  { label: 'Project', tagEntityType: 'project', scheduleReportName: 'project' },
];

async function goToReports(page: Page) {
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();
  await page.waitForURL('**/reports');
}

async function selectReport(page: Page, label: string) {
  const reportSelect = page
    .locator('dt')
    .filter({ hasText: /^Report$/ })
    .locator('..')
    .locator('dd');

  await reportSelect.locator('svg').last().click();

  const option = page.getByRole('option', { name: label, exact: true });
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();
}

function tagSelector(page: Page) {
  return page.locator('#tagItemSelector');
}

async function selectTag(page: Page, tagName: string) {
  const selector = tagSelector(page);
  await expect(selector).toBeVisible({ timeout: 10000 });

  await selector.locator('div[class*="cursor-pointer"]').first().click();

  await selector.getByPlaceholder('Search').fill(tagName);

  const option = selector
    .locator('[role="option"]')
    .filter({ hasText: tagName })
    .first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();

  await page.getByText('Report', { exact: true }).first().click();

  await expect(selector).toContainText(tagName);
}

async function createTag(api: ApiFixture, entityType: string) {
  const name = uniqueName('report-tag');
  const tag = await api.createEntity(TAGS, {
    name,
    entity_type: entityType,
    color: '#2196F3',
  });
  if (tag.id) api.trackEntity(TAGS, tag.id as string);
  return { id: tag.id as string, name };
}

for (const reportCase of REPORT_CASES) {
  test(`reports: tags are present and selectable for the ${reportCase.label} report`, async ({
    page,
    api,
  }) => {
    await login(page);

    const tag = await createTag(api, reportCase.tagEntityType);

    await goToReports(page);
    await selectReport(page, reportCase.label);

    await expect(tagSelector(page)).toBeVisible({ timeout: 10000 });

    await selectTag(page, tag.name);

    await logout(page);
  });
}

for (const reportCase of REPORT_CASES) {
  test(`schedule: tags carry over to a scheduled ${reportCase.label} report`, async ({
    page,
    api,
  }) => {
    await login(page);

    const tag = await createTag(api, reportCase.tagEntityType);

    await goToReports(page);
    await selectReport(page, reportCase.label);
    await selectTag(page, tag.name);

    await page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Actions', exact: true })
      .click();
    await page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Schedule', exact: true })
      .click();

    await page.waitForURL(/\/settings\/schedules\/create/);

    await expect(tagSelector(page)).toContainText(tag.name, { timeout: 10000 });

    const savePost = page.waitForRequest(
      (request) =>
        request.url().includes('/api/v1/task_schedulers') &&
        request.method() === 'POST'
    );

    await page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
      .click();

    const body = JSON.parse((await savePost).postData() || '{}');
    expect(body.parameters.report_name).toBe(reportCase.scheduleReportName);
    expect(body.parameters.tag_ids).toContain(tag.id);

    await expect(page.getByText('Successfully created schedule')).toBeVisible({
      timeout: 10000,
    });

    await page.waitForURL('**/settings/schedules/**/edit');
    const scheduleId = extractIdFromUrl(page.url(), 'schedules');
    if (scheduleId) api.trackEntity('task_schedulers', scheduleId);

    await logout(page);
  });
}

test('reports: no tags field for a non-entity report (Profit and Loss)', async ({
  page,
}) => {
  await login(page);

  await goToReports(page);
  await selectReport(page, 'Profit and Loss');

  await expect(tagSelector(page)).not.toBeVisible();

  await logout(page);
});
