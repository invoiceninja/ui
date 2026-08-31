import { expect, type Locator, type Page, type Route } from '@playwright/test';
import type { ApiFixture } from './fixtures';

export type ReportField =
  | 'activity_type_id'
  | 'categories'
  | 'client'
  | 'clients'
  | 'document_email_attachment'
  | 'expense_billed'
  | 'group_by'
  | 'include_deleted'
  | 'include_tax'
  | 'income_billed'
  | 'pdf_email_attachment'
  | 'products'
  | 'projects'
  | 'status'
  | 'tags'
  | 'template_id'
  | 'vendors';

export interface ReportCase {
  customColumnSourceIds?: string[];
  identifier: string;
  label: string;
  scheduleIdentifier?: string;
  scheduleSaveSupported?: boolean;
  supportsPreview: boolean;
  reportFields: ReportField[];
  scheduleFields: ReportField[];
}

export interface ReportScheduleVariation {
  checkedFields?: ReportField[];
  endDate?: string;
  groupBy?: boolean;
  name: string;
  range: string;
  startDate?: string;
  statusOptions?: string[];
}

export interface AppliedReportScheduleVariation
  extends ReportScheduleVariation {
  groupByText?: string;
}

interface ScheduleSaveAssertions {
  report: ReportCase;
  variation?: AppliedReportScheduleVariation;
}

interface SchedulePayload {
  parameters?: Record<string, unknown>;
  template?: string;
}

export const REPORT_CASES: ReportCase[] = [
  {
    identifier: 'activity',
    label: 'Activity',
    supportsPreview: false,
    reportFields: ['activity_type_id'],
    scheduleFields: [],
  },
  {
    identifier: 'client',
    label: 'Client',
    customColumnSourceIds: ['0'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'include_deleted',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'document_email_attachment',
      'include_deleted',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'contact',
    label: 'Contact',
    customColumnSourceIds: ['10'],
    scheduleSaveSupported: false,
    supportsPreview: true,
    reportFields: ['group_by'],
    scheduleFields: ['template_id', 'group_by'],
  },
  {
    identifier: 'credit',
    label: 'Credit',
    customColumnSourceIds: ['0', '2', '4'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'include_deleted',
      'status',
      'client',
      'pdf_email_attachment',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'document_email_attachment',
      'include_deleted',
      'status',
      'client',
      'pdf_email_attachment',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'document',
    label: 'Document',
    supportsPreview: true,
    reportFields: ['document_email_attachment'],
    scheduleFields: ['document_email_attachment'],
  },
  {
    identifier: 'expense',
    label: 'Expense',
    customColumnSourceIds: ['8', '0', '5'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'clients',
      'vendors',
      'projects',
      'categories',
      'include_deleted',
      'status',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'document_email_attachment',
      'clients',
      'vendors',
      'projects',
      'categories',
      'status',
      'include_deleted',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'invoice',
    label: 'Invoice',
    customColumnSourceIds: ['0', '1', '4'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'status',
      'include_deleted',
      'client',
      'pdf_email_attachment',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'document_email_attachment',
      'status',
      'include_deleted',
      'client',
      'pdf_email_attachment',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'invoice_item',
    label: 'Invoice Item',
    customColumnSourceIds: ['0', '1', '4'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'products',
      'include_deleted',
      'status',
      'client',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'products',
      'document_email_attachment',
      'status',
      'include_deleted',
      'client',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'purchase_order',
    label: 'Purchase Order',
    customColumnSourceIds: ['5', '6'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'include_deleted',
      'status',
      'pdf_email_attachment',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'document_email_attachment',
      'status',
      'include_deleted',
      'pdf_email_attachment',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'purchase_order_item',
    label: 'Purchase Order Item',
    customColumnSourceIds: ['5', '6'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'include_deleted',
      'status',
      'products',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'document_email_attachment',
      'status',
      'include_deleted',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'quote',
    label: 'Quote',
    customColumnSourceIds: ['0', '3'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'include_deleted',
      'status',
      'client',
      'pdf_email_attachment',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'document_email_attachment',
      'status',
      'include_deleted',
      'client',
      'pdf_email_attachment',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'quote_item',
    label: 'Quote Item',
    customColumnSourceIds: ['0', '3'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'include_deleted',
      'status',
      'client',
      'products',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'document_email_attachment',
      'status',
      'include_deleted',
      'client',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'recurring_invoice',
    label: 'Recurring Invoice',
    customColumnSourceIds: ['9', '0'],
    supportsPreview: true,
    reportFields: [
      'include_deleted',
      'status',
      'client',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'status',
      'include_deleted',
      'client',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'recurring_invoice_item',
    label: 'Recurring Invoice Item',
    customColumnSourceIds: ['0', '9'],
    scheduleSaveSupported: false,
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'products',
      'include_deleted',
      'status',
      'client',
      'template_id',
      'group_by',
    ],
    scheduleFields: [],
  },
  {
    identifier: 'payment',
    label: 'Payment',
    customColumnSourceIds: ['0', '1', '4'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'status',
      'client',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'document_email_attachment',
      'status',
      'client',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'product',
    label: 'Product',
    supportsPreview: true,
    reportFields: ['document_email_attachment', 'template_id'],
    scheduleFields: ['document_email_attachment', 'template_id'],
  },
  {
    identifier: 'product_sales',
    label: 'Product Sales',
    supportsPreview: false,
    reportFields: ['products', 'client'],
    scheduleFields: ['products', 'client'],
  },
  {
    identifier: 'task',
    label: 'Task',
    customColumnSourceIds: ['7', '0', '1'],
    supportsPreview: true,
    reportFields: [
      'document_email_attachment',
      'include_deleted',
      'status',
      'client',
      'tags',
      'template_id',
      'group_by',
    ],
    scheduleFields: [
      'document_email_attachment',
      'status',
      'include_deleted',
      'client',
      'tags',
      'template_id',
      'group_by',
    ],
  },
  {
    identifier: 'vendor',
    label: 'Vendor',
    customColumnSourceIds: ['5'],
    supportsPreview: true,
    reportFields: ['document_email_attachment', 'template_id', 'group_by'],
    scheduleFields: ['document_email_attachment', 'template_id', 'group_by'],
  },
  {
    identifier: 'profitloss',
    label: 'Profit and Loss',
    supportsPreview: false,
    reportFields: ['expense_billed', 'income_billed', 'include_tax'],
    scheduleFields: ['expense_billed', 'income_billed', 'include_tax'],
  },
  {
    identifier: 'aged_receivable_detailed_report',
    scheduleIdentifier: 'ar_detailed',
    label: 'Aged Receivable Detailed Report',
    supportsPreview: false,
    reportFields: [],
    scheduleFields: [],
  },
  {
    identifier: 'aged_receivable_summary_report',
    scheduleIdentifier: 'ar_summary',
    label: 'Aged Receivable Summary Report',
    supportsPreview: false,
    reportFields: [],
    scheduleFields: [],
  },
  {
    identifier: 'client_balance_report',
    scheduleIdentifier: 'client_balance',
    label: 'Customer balance report',
    supportsPreview: false,
    reportFields: [],
    scheduleFields: [],
  },
  {
    identifier: 'client_sales_report',
    scheduleIdentifier: 'client_sales',
    label: 'Customer sales report',
    supportsPreview: false,
    reportFields: [],
    scheduleFields: [],
  },
  {
    identifier: 'tax_summary_report',
    scheduleIdentifier: 'tax_summary',
    label: 'Tax Summary Report',
    supportsPreview: false,
    reportFields: [],
    scheduleFields: [],
  },
  {
    identifier: 'tax_period_report',
    scheduleIdentifier: 'tax_period',
    label: 'Tax Period Report',
    scheduleSaveSupported: false,
    supportsPreview: false,
    reportFields: ['income_billed'],
    scheduleFields: [],
  },
  {
    identifier: 'user_sales_report',
    scheduleIdentifier: 'user_sales',
    label: 'User sales report',
    supportsPreview: false,
    reportFields: [],
    scheduleFields: [],
  },
  {
    identifier: 'project',
    scheduleIdentifier: 'project',
    label: 'Project',
    scheduleSaveSupported: false,
    supportsPreview: false,
    reportFields: ['clients', 'projects', 'tags'],
    scheduleFields: ['clients', 'projects', 'tags'],
  },
];

export const CUSTOM_COLUMN_REPORT_CASES = REPORT_CASES.filter(
  (report) => report.customColumnSourceIds?.length
);

export function getCustomSelectByLabel(page: Page, labelText: string): Locator {
  return getElementByLabel(page, labelText).locator('dd').first();
}

export async function selectCustomOption(
  page: Page,
  labelText: string,
  optionText: string
) {
  await openCustomSelect(page, labelText);

  const option = page
    .getByRole('option', { name: optionText, exact: true })
    .last();

  await option.waitFor({ state: 'visible', timeout: 5000 }).catch(async () => {
    await page.getByText(optionText, { exact: true }).last().waitFor({
      state: 'visible',
      timeout: 5000,
    });
  });

  if (await option.isVisible().catch(() => false)) {
    await option.click();
  } else {
    await page.getByText(optionText, { exact: true }).last().click();
  }
}

export async function expectCustomSelectText(
  page: Page,
  labelText: string,
  expectedText: string
) {
  await expect(getCustomSelectByLabel(page, labelText)).toContainText(
    expectedText,
    { timeout: 10000 }
  );
}

export async function expectReportPageBaseline(page: Page, report: ReportCase) {
  await expectCustomSelectText(page, 'Report', report.label);
  await expectLabelVisible(page, 'Send Email');
  await expectCustomSelectText(page, 'Range', 'All');
  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Actions', exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Export', exact: true })
  ).toBeVisible({ timeout: 10000 });
}

export async function expectReportActions(page: Page, report: ReportCase) {
  await openReportsActions(page);

  const topNavbar = page.locator('[data-cy="topNavbar"]');
  await expect(
    topNavbar.getByRole('button', { name: 'Schedule', exact: true })
  ).toBeVisible({ timeout: 10000 });

  const previewButton = topNavbar.getByRole('button', {
    name: 'Preview',
    exact: true,
  });

  if (report.supportsPreview) {
    await expect(previewButton).toBeVisible({ timeout: 10000 });
  } else {
    await expect(previewButton).toBeHidden({ timeout: 10000 });
  }

  await page.keyboard.press('Escape');
}

export async function expectReportFields(page: Page, report: ReportCase) {
  for (const field of report.reportFields) {
    await expectFieldVisible(page, field);
  }
}

export async function expectScheduleBaseline(
  page: Page,
  report: ReportCase,
  expectedRange = 'Last 7 Days'
) {
  await expect(
    page.locator('h2').filter({ hasText: 'New Schedule' })
  ).toBeVisible({
    timeout: 10000,
  });
  await expectCustomSelectText(page, 'Report', report.label);
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked({
    timeout: 10000,
  });
  await expectCustomSelectText(page, 'Range', expectedRange);
}

export async function expectScheduleFields(page: Page, report: ReportCase) {
  for (const field of report.scheduleFields) {
    await expectFieldVisible(page, field);
  }
}

export function getReportScheduleVariations(
  report: ReportCase
): ReportScheduleVariation[] {
  const checkedFields = getCheckedScheduleFields(report);
  const statusOptions = STATUS_VARIATIONS[report.identifier];
  const groupBy = GROUP_BY_VARIATION_REPORTS.has(report.identifier);

  return [
    {
      name: 'custom parameter transfer',
      range: 'Custom',
      startDate: '2026-06-01',
      endDate: '2026-06-10',
      ...(checkedFields.length && { checkedFields }),
      ...(statusOptions && { statusOptions }),
      ...(groupBy && { groupBy }),
    },
  ];
}

export async function applyReportScheduleVariation(
  page: Page,
  variation: ReportScheduleVariation
): Promise<AppliedReportScheduleVariation> {
  const appliedVariation: AppliedReportScheduleVariation = { ...variation };

  await selectCustomOption(page, 'Range', variation.range);

  if (variation.range === 'Custom') {
    await page
      .locator('[data-cy="reportStartDate"]')
      .waitFor({ state: 'visible', timeout: 10000 });

    await page
      .locator('[data-cy="reportStartDate"]')
      .fill(variation.startDate || '');
    await page
      .locator('[data-cy="reportEndDate"]')
      .fill(variation.endDate || '');
  }

  if (variation.statusOptions?.length) {
    await selectMultiSelectOptions(
      page,
      'statusSelector',
      variation.statusOptions
    );
  }

  for (const field of variation.checkedFields || []) {
    await setToggle(page, field, true);
  }

  if (variation.groupBy) {
    appliedVariation.groupByText = await selectFirstGroupByOption(page);
  }

  return appliedVariation;
}

export async function expectScheduleVariation(
  page: Page,
  variation: AppliedReportScheduleVariation
) {
  await expectCustomSelectText(page, 'Range', variation.range);

  if (variation.range === 'Custom') {
    await expect(page.locator('[data-cy="scheduleStartDate"]')).toHaveValue(
      variation.startDate || ''
    );
    await expect(page.locator('[data-cy="scheduleEndDate"]')).toHaveValue(
      variation.endDate || ''
    );
  }

  if (variation.statusOptions?.length) {
    for (const option of variation.statusOptions) {
      await expect(page.locator('#statusSelector')).toContainText(option, {
        timeout: 10000,
      });
    }
  }

  for (const field of variation.checkedFields || []) {
    await expect(getToggleLocator(page, field)).toBeChecked({ timeout: 10000 });
  }

  if (variation.groupByText) {
    await expectCustomSelectText(page, 'Group by', variation.groupByText);
  }
}

export async function scheduleCurrentReport(page: Page) {
  await openReportsActions(page);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/create?template=email_report', {
    timeout: 10000,
  });
}

export async function saveScheduleAndTrack(
  page: Page,
  api: ApiFixture,
  assertions?: ScheduleSaveAssertions
) {
  const saveResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/task_schedulers') &&
      response.request().method() === 'POST',
    { timeout: 30000 }
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  const response = await saveResponse;
  const requestPayload = response.request().postDataJSON() as SchedulePayload;
  const responseBody = (await response.json()) as {
    data?: SchedulePayload;
  };

  expect(response.ok()).toBeTruthy();

  if (assertions) {
    expectSavedSchedulePayload(requestPayload, responseBody.data, assertions);
  }

  await page.waitForURL('**/settings/schedules/**/edit', { timeout: 30000 });

  const id = page.url().match(/\/settings\/schedules\/([^/]+)\/edit/)?.[1];

  if (id) {
    api.trackEntity('task_schedulers', id);
  }

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible({
    timeout: 10000,
  });
}

export async function populateAndReorderCustomColumns(
  page: Page,
  report: ReportCase
) {
  if (!report.customColumnSourceIds?.length) {
    throw new Error(`${report.label} does not expose custom columns`);
  }

  await setLabeledToggle(page, 'Customize Columns', true);

  const sortableColumns = page.locator('[data-cy="sortable-columns"]');
  await expect(sortableColumns).toBeVisible({ timeout: 10000 });

  const sourceColumnId = report.customColumnSourceIds[0];
  const addAllButton = sortableColumns.locator(
    `[data-cy="report-column-add-all-${sourceColumnId}"]`
  );

  await addAllButton.scrollIntoViewIfNeeded();
  await addAllButton.click();

  const reportColumn = page.locator('[data-cy="report-column-11"]');
  await reportColumn.scrollIntoViewIfNeeded();

  const items = reportColumn.locator('[data-cy="report-column-item"]');
  await expect(items.nth(1)).toBeVisible({ timeout: 10000 });

  const before = await getReportColumnValues(page);
  await moveFirstReportColumnItemDown(page, before);

  const after = await getReportColumnValues(page);

  expect(after.length).toBe(before.length);
  expect(after[0]).toBe(before[1]);
  expect(after[1]).toBe(before[0]);

  return after;
}

export async function exportCurrentReportAndExpectReportKeys(
  page: Page,
  expectedReportKeys: string[]
) {
  await setLabeledToggle(page, 'Send Email', true);

  const reportsRoute = '**/api/v1/reports/**';
  const routeHandler = async (route: Route) => {
    const request = route.request();

    if (
      request.method() === 'POST' &&
      !request.url().includes('/reports/preview/')
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'queued' }),
      });
      return;
    }

    await route.continue();
  };

  await page.route(reportsRoute, routeHandler);

  try {
    const exportRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().includes('/api/v1/reports/') &&
        !request.url().includes('/reports/preview/'),
      { timeout: 30000 }
    );

    await page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Export', exact: true })
      .click();

    const request = await exportRequest;
    const payload = request.postDataJSON() as Record<string, unknown>;

    expect(payload.send_email).toBe(true);
    expect(payload.report_keys).toEqual(expectedReportKeys);
  } finally {
    await page.unroute(reportsRoute, routeHandler);
  }
}

function expectSavedSchedulePayload(
  requestPayload: SchedulePayload,
  responsePayload: SchedulePayload | undefined,
  assertions: ScheduleSaveAssertions
) {
  const requestParameters = requestPayload.parameters || {};
  const responseParameters = responsePayload?.parameters || {};
  const expectedReportName =
    assertions.report.scheduleIdentifier || assertions.report.identifier;

  expect(requestPayload.template).toBe('email_report');
  expect(requestParameters.report_name).toBe(expectedReportName);
  expect(responseParameters.report_name).toBe(expectedReportName);

  if (!assertions.variation) {
    return;
  }

  const variation = assertions.variation;
  const expectedDateRange = RANGE_PAYLOAD_VALUES[variation.range];

  expect(requestParameters.date_range).toBe(expectedDateRange);
  expect(responseParameters.date_range).toBe(expectedDateRange);

  if (variation.range === 'Custom') {
    expect(requestParameters.start_date).toBe(variation.startDate);
    expect(requestParameters.end_date).toBe(variation.endDate);
    expect(responseParameters.start_date).toBe(variation.startDate);
    expect(responseParameters.end_date).toBe(variation.endDate);
  }

  for (const field of variation.checkedFields || []) {
    const parameter = TOGGLE_FIELD_PARAMETERS[field];

    if (parameter) {
      expect(requestParameters[parameter]).toBeTruthy();
      expect(responseParameters[parameter]).toBeTruthy();
    }
  }

  if (variation.statusOptions?.length) {
    expect(String(requestParameters.status || '')).not.toBe('');
    expect(responseParameters.status).toBe(requestParameters.status);
  }

  if (variation.groupByText) {
    expect(String(requestParameters.group_by || '')).not.toBe('');
    expect(responseParameters.group_by).toBe(requestParameters.group_by);
  }
}

async function openCustomSelect(page: Page, labelText: string) {
  await getCustomSelectByLabel(page, labelText).locator('svg').last().click();
}

async function openReportsActions(page: Page) {
  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();
}

async function selectMultiSelectOptions(
  page: Page,
  selectorId: string,
  optionLabels: string[]
) {
  const selector = page.locator(`#${selectorId}`);

  await openMultiSelect(page, selectorId);

  for (const optionLabel of optionLabels) {
    const option = selector
      .getByRole('option', {
        name: new RegExp(`^${escapeRegExp(optionLabel)}$`),
      })
      .first();

    await option.waitFor({ state: 'visible', timeout: 10000 });
    await option.click();
  }

  await page.keyboard.press('Escape');

  for (const optionLabel of optionLabels) {
    await expect(selector).toContainText(optionLabel, { timeout: 10000 });
  }
}

async function openMultiSelect(page: Page, selectorId: string) {
  const selector = page.locator(`#${selectorId}`);

  await selector.locator('div[class*="cursor-pointer"]').first().click();
  await selector
    .getByRole('option')
    .first()
    .waitFor({ state: 'visible', timeout: 10000 });
}

async function setToggle(page: Page, field: ReportField, checked: boolean) {
  const toggle = getToggleLocator(page, field);
  await setToggleLocator(toggle, checked);
}

async function setLabeledToggle(
  page: Page,
  labelText: string,
  checked: boolean
) {
  await setToggleLocator(
    getElementByLabel(page, labelText).getByRole('switch'),
    checked
  );
}

async function setToggleLocator(toggle: Locator, checked: boolean) {
  const isChecked = (await toggle.getAttribute('aria-checked')) === 'true';

  if (isChecked !== checked) {
    await toggle.click();
  }

  if (checked) {
    await expect(toggle).toBeChecked({ timeout: 10000 });
  } else {
    await expect(toggle).not.toBeChecked({ timeout: 10000 });
  }
}

async function getReportColumnValues(page: Page) {
  return page
    .locator('[data-cy="report-column-11"] [data-cy="report-column-item"]')
    .evaluateAll((items) =>
      items.map((item) => item.getAttribute('data-report-column-value') || '')
    );
}

async function moveFirstReportColumnItemDown(page: Page, before: string[]) {
  const item = page
    .locator('[data-cy="report-column-11"] [data-cy="report-column-item"]')
    .first();

  await item.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Space');

  try {
    await expect
      .poll(() => getReportColumnValues(page), { timeout: 5000 })
      .toEqual([before[1], before[0], ...before.slice(2)]);
  } catch {
    await page.keyboard.press('Escape').catch(() => {});
    await dragFirstReportColumnItemDownWithMouse(page);
    await expect
      .poll(() => getReportColumnValues(page), { timeout: 10000 })
      .toEqual([before[1], before[0], ...before.slice(2)]);
  }
}

async function dragFirstReportColumnItemDownWithMouse(page: Page) {
  const items = page.locator(
    '[data-cy="report-column-11"] [data-cy="report-column-item"]'
  );
  const sourceBox = await items.nth(0).boundingBox();
  const targetBox = await items.nth(1).boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error('Unable to resolve report column drag targets');
  }

  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height * 0.8,
    { steps: 12 }
  );
  await page.mouse.up();
}

async function selectFirstGroupByOption(page: Page) {
  await openCustomSelect(page, 'Group by');

  const option = page.getByRole('option').nth(1);

  await option.waitFor({ state: 'visible', timeout: 10000 });

  const optionText = normalizeText(await option.innerText());

  await option.click();

  return optionText;
}

async function expectFieldVisible(page: Page, field: ReportField) {
  const selector = FIELD_SELECTORS[field];

  if (selector) {
    await expect(page.locator(selector)).toBeVisible({ timeout: 10000 });
    return;
  }

  await expectLabelVisible(page, FIELD_LABELS[field]);
}

async function expectLabelVisible(page: Page, labelText: string) {
  await expect(getElementByLabel(page, labelText)).toBeVisible({
    timeout: 10000,
  });
}

function getElementByLabel(page: Page, labelText: string): Locator {
  return page
    .locator('dt')
    .filter({ hasText: new RegExp(`^${escapeRegExp(labelText)}$`, 'i') })
    .locator('..')
    .first();
}

function getToggleLocator(page: Page, field: ReportField) {
  const selector = FIELD_SELECTORS[field];

  if (selector) {
    return page.locator(selector);
  }

  return getElementByLabel(page, FIELD_LABELS[field]).getByRole('switch');
}

function getCheckedScheduleFields(report: ReportCase): ReportField[] {
  return TOGGLE_VARIATION_FIELDS.filter((field) =>
    report.scheduleFields.includes(field)
  );
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const FIELD_SELECTORS: Partial<Record<ReportField, string>> = {
  categories: '#expenseCategoryItemSelector',
  clients: '#clientItemSelector',
  document_email_attachment: '[data-cy="scheduleDocumentEmailAttachment"]',
  expense_billed: '[data-cy="expenseBilled"]',
  include_deleted: '[data-cy="includeDeleted"]',
  include_tax: '[data-cy="includeTax"]',
  income_billed: '[data-cy="incomeBilled"]',
  products: '#productItemSelector',
  projects: '#projectItemSelector',
  status: '#statusSelector',
  tags: '#tagItemSelector',
  vendors: '#vendorItemSelector',
};

const FIELD_LABELS: Record<ReportField, string> = {
  activity_type_id: 'Activity',
  categories: 'Expense Categories',
  client: 'Client',
  clients: 'Clients',
  document_email_attachment: 'Attach Documents',
  expense_billed: 'Expensed reporting',
  group_by: 'Group by',
  include_deleted: 'Include Deleted',
  include_tax: 'Include tax',
  income_billed: 'Accrual accounting',
  pdf_email_attachment: 'Attach PDF',
  products: 'Products',
  projects: 'Projects',
  status: 'Status',
  tags: 'Tags',
  template_id: 'Template',
  vendors: 'Vendors',
};

const TOGGLE_VARIATION_FIELDS: ReportField[] = [
  'document_email_attachment',
  'expense_billed',
  'include_deleted',
  'include_tax',
  'income_billed',
  'pdf_email_attachment',
];

const TOGGLE_FIELD_PARAMETERS: Partial<Record<ReportField, string>> = {
  document_email_attachment: 'document_email_attachment',
  expense_billed: 'is_expense_billed',
  include_deleted: 'include_deleted',
  include_tax: 'include_tax',
  income_billed: 'is_income_billed',
  pdf_email_attachment: 'pdf_email_attachment',
};

const RANGE_PAYLOAD_VALUES: Record<string, string> = {
  Custom: 'custom',
  'Last 7 Days': 'last7_days',
};

const GROUP_BY_VARIATION_REPORTS = new Set<string>([
  'client',
  'contact',
  'credit',
  'expense',
  'invoice',
  'invoice_item',
  'payment',
  'purchase_order',
  'purchase_order_item',
  'quote',
  'quote_item',
  'recurring_invoice',
  'task',
  'vendor',
]);

const STATUS_VARIATIONS: Record<string, string[]> = {
  credit: ['Applied'],
  expense: ['Invoiced'],
  invoice: ['Paid'],
  invoice_item: ['Draft'],
  payment: ['Completed'],
  purchase_order: ['Draft'],
  purchase_order_item: ['Draft'],
  quote: ['Approved'],
  quote_item: ['Approved'],
  recurring_invoice: ['Paused'],
  task: ['Uninvoiced'],
};
