import { login } from '$tests/e2e/helpers';
import { test, expect, uniqueName, extractIdFromUrl } from '$tests/e2e/fixtures';
import {
  createClientViaApi,
  createProductViaApi,
  createProjectViaApi,
  createExpenseCategoryViaApi,
  createApiContext,
  type EntityType,
} from '$tests/e2e/api-helpers';
import dayjs from 'dayjs';
import { Locator, Page } from '@playwright/test';

function trackScheduleFromUrl(page: { url: () => string }, api: { trackEntity: (type: EntityType, id: string) => void }) {
  const id = extractIdFromUrl(page.url(), 'schedules');
  if (id) api.trackEntity('task_schedulers', id);
}

/**
 * Helper to interact with a React Select customSelector dropdown.
 * Finds the Element row by its <dt> label text, then operates on the <dd> containing the React Select.
 */
function getCustomSelectByLabel(page: Page, labelText: string): Locator {
  return page.locator('dt').filter({ hasText: new RegExp(`^${labelText}$`) }).locator('..').locator('dd');
}

async function openCustomSelect(page: Page, labelText: string) {
  const dd = getCustomSelectByLabel(page, labelText);
  await dd.locator('svg').last().click();
}

async function selectCustomOption(page: Page, labelText: string, optionText: string) {
  await openCustomSelect(page, labelText);
  await page.getByText(optionText, { exact: true }).click();
}

async function expectCustomSelectText(page: Page, labelText: string, expectedText: string) {
  const dd = getCustomSelectByLabel(page, labelText);
  await expect(dd).toContainText(expectedText);
}

/**
 * Helper to interact with a CustomMultiSelect by its id.
 * The id is placed on the React Select container by React Select's id prop.
 */
function getMultiSelectById(page: Page, id: string): Locator {
  return page.locator(`[id="${id}"]`);
}

async function openMultiSelect(page: Page, id: string) {
  const container = getMultiSelectById(page, id);
  await container.locator('svg').last().click();
}

test('Activity report test', async ({ page, api }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  // Date range: select "Last 7 Days" via React Select customSelector
  await selectCustomOption(page, 'Range', 'Last 7 Days');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  // On the schedule form, verify report name and date range via React Select text
  await expectCustomSelectText(page, 'Report', 'Activity');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'Last 7 Days');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');
  trackScheduleFromUrl(page, api);

  await expectCustomSelectText(page, 'Report', 'Activity');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'Last 7 Days');

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Invoice report test', async ({ page, api }) => {
  // Create prerequisite client via API
  const apiCtx = await createApiContext(process.env.VITE_API_URL!);
  const client = await createClientViaApi(apiCtx, {
    name: uniqueName('sched-inv-client'),
  });
  api.trackEntity('clients', client.id);

  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  // Select "Invoice" report via React Select customSelector
  await selectCustomOption(page, 'Report', 'Invoice');

  await openMultiSelect(page, 'statusSelector');
  await page.getByText('Draft').click();

  await page.waitForTimeout(200);

  await openMultiSelect(page, 'statusSelector');
  await page.getByText('Paid').first().click();

  // Select "Custom" date range via React Select customSelector
  await selectCustomOption(page, 'Range', 'Custom');

  await page.waitForTimeout(200);

  await page.fill('[data-cy="reportStartDate"]', dayjs().format('YYYY-MM-DD'));

  await page.fill(
    '[data-cy="reportEndDate"]',
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );

  await page.locator('[data-cy="includeDeleted"]').check();
  await page.locator('[data-cy="scheduleDocumentEmailAttachment"]').check();

  await page.locator('[data-testid="combobox-input-field"]').click();

  await page.waitForTimeout(200);

  await page.locator('[role="listbox"]').getByRole('option').first().click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expectCustomSelectText(page, 'Report', 'Invoice');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'Custom');
  await expect(page.locator('[data-cy="scheduleStartDate"]')).toHaveValue(
    dayjs().format('YYYY-MM-DD')
  );
  await expect(page.locator('[data-cy="scheduleEndDate"]')).toHaveValue(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );
  await expect(page.locator('[id="statusSelector"]')).toContainText(
    'DraftPaid'
  );
  await expect(
    page.locator('[data-cy="scheduleDocumentEmailAttachment"]')
  ).toBeChecked();
  await expect(page.locator('[data-cy="includeDeleted"]')).toBeChecked();
  await expect(page.locator('div[data-headlessui-state]').nth(2)).toContainText(
    client.name
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');
  trackScheduleFromUrl(page, api);

  await expectCustomSelectText(page, 'Report', 'Invoice');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'Custom');
  await expect(page.locator('[data-cy="scheduleStartDate"]')).toHaveValue(
    dayjs().format('YYYY-MM-DD')
  );
  await expect(page.locator('[data-cy="scheduleEndDate"]')).toHaveValue(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );
  await expect(page.locator('[id="statusSelector"]')).toContainText(
    'DraftPaid'
  );
  await expect(
    page.locator('[data-cy="scheduleDocumentEmailAttachment"]')
  ).toBeChecked();
  await expect(page.locator('[data-cy="includeDeleted"]')).toBeChecked();
  await expect(page.locator('div[data-headlessui-state]').nth(2)).toContainText(
    client.name
  );

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Profit and loss report test', async ({ page, api }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  // Select "Profit and Loss" report via React Select customSelector
  await selectCustomOption(page, 'Report', 'Profit and Loss');

  await page.locator('[data-cy="expenseBilled"]').check();
  await page.locator('[data-cy="incomeBilled"]').check();
  await page.locator('[data-cy="includeTax"]').check();

  // Select "This Month" date range via React Select customSelector
  await selectCustomOption(page, 'Range', 'This Month');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expectCustomSelectText(page, 'Report', 'Profit and Loss');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="expenseBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="incomeBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="includeTax"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'This Month');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');
  trackScheduleFromUrl(page, api);

  await expectCustomSelectText(page, 'Report', 'Profit and Loss');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="expenseBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="incomeBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="includeTax"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'This Month');

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Product sales report test', async ({ page, api }) => {
  // Create prerequisite products and client via API
  const apiCtx = await createApiContext(process.env.VITE_API_URL!);
  const product1 = await createProductViaApi(apiCtx, {
    product_key: uniqueName('sched-prod-1'),
  });
  api.trackEntity('products', product1.id);
  const product2 = await createProductViaApi(apiCtx, {
    product_key: uniqueName('sched-prod-2'),
  });
  api.trackEntity('products', product2.id);

  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  // Select "Product Sales" report via React Select customSelector
  await selectCustomOption(page, 'Report', 'Product Sales');

  // Open the product multi-select and pick product1
  await openMultiSelect(page, 'productItemSelector');
  await page.getByText(product1.product_key, { exact: true }).first().click();

  // Click away to close the menu, then reopen to pick product2
  await page.getByText('Products', { exact: true }).last().click();

  await openMultiSelect(page, 'productItemSelector');
  await page
    .getByText(product2.product_key, { exact: true })
    .first()
    .click();

  await page.locator('[data-testid="combobox-input-field"]').click();

  await page.waitForTimeout(200);

  await page.locator('[role="listbox"]').getByRole('option').first().click();

  // Select "Custom" date range via React Select customSelector
  await selectCustomOption(page, 'Range', 'Custom');

  await page.waitForTimeout(200);

  await page.fill('[data-cy="reportStartDate"]', dayjs().format('YYYY-MM-DD'));

  await page.fill(
    '[data-cy="reportEndDate"]',
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expectCustomSelectText(page, 'Report', 'Product Sales');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'Custom');
  await expect(page.locator('[data-cy="scheduleStartDate"]')).toHaveValue(
    dayjs().format('YYYY-MM-DD')
  );
  await expect(page.locator('[data-cy="scheduleEndDate"]')).toHaveValue(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );
  await expect(page.locator('[id="productItemSelector"]')).toContainText(
    product1.product_key
  );
  await expect(page.locator('[id="productItemSelector"]')).toContainText(
    product2.product_key
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');
  trackScheduleFromUrl(page, api);

  await expectCustomSelectText(page, 'Report', 'Product Sales');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'Custom');
  await expect(page.locator('[data-cy="scheduleStartDate"]')).toHaveValue(
    dayjs().format('YYYY-MM-DD')
  );
  await expect(page.locator('[data-cy="scheduleEndDate"]')).toHaveValue(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );
  await expect(page.locator('[id="productItemSelector"]')).toContainText(
    product1.product_key
  );
  await expect(page.locator('[id="productItemSelector"]')).toContainText(
    product2.product_key
  );
  await expect(
    page.locator('[data-testid="combobox-input-field"]')
  ).not.toBeEmpty();

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Expense report test', async ({ page, api }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  // Select "Expense" report via React Select customSelector
  await selectCustomOption(page, 'Report', 'Expense');

  await openMultiSelect(page, 'statusSelector');
  await page.getByText('Pending').click();

  await page.waitForTimeout(200);

  await openMultiSelect(page, 'statusSelector');
  await page.getByText('Invoiced').first().click();

  // Select "This Month" date range via React Select customSelector
  await selectCustomOption(page, 'Range', 'This Month');

  await page.locator('[data-cy="scheduleDocumentEmailAttachment"]').check();
  await page.locator('[data-cy="includeDeleted"]').check();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expectCustomSelectText(page, 'Report', 'Expense');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'This Month');
  await expect(page.locator('[id="statusSelector"]')).toContainText(
    'PendingInvoiced'
  );
  await expect(
    page.locator('[data-cy="scheduleDocumentEmailAttachment"]')
  ).toBeChecked();
  await expect(page.locator('[data-cy="includeDeleted"]')).toBeChecked();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');
  trackScheduleFromUrl(page, api);

  await expectCustomSelectText(page, 'Report', 'Expense');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'This Month');
  await expect(page.locator('[id="statusSelector"]')).toContainText(
    'PendingInvoiced'
  );
  await expect(
    page.locator('[data-cy="scheduleDocumentEmailAttachment"]')
  ).toBeChecked();
  await expect(page.locator('[data-cy="includeDeleted"]')).toBeChecked();

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Expense report test with clients, project and categories selectors', async ({
  page,
  api,
}) => {
  // Create prerequisite entities via API
  const apiCtx = await createApiContext(process.env.VITE_API_URL!);
  const client = await createClientViaApi(apiCtx, {
    name: uniqueName('sched-exp-client'),
  });
  api.trackEntity('clients', client.id);

  const project = await createProjectViaApi(apiCtx, {
    name: uniqueName('sched-exp-project'),
    client_id: client.id,
  });
  api.trackEntity('projects', project.id);

  const category = await createExpenseCategoryViaApi(apiCtx, {
    name: uniqueName('sched-exp-cat'),
  });

  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  // Select "Expense" report via React Select customSelector
  await selectCustomOption(page, 'Report', 'Expense');

  await page.waitForTimeout(300);

  await openMultiSelect(page, 'statusSelector');
  await page.getByText('Pending').click();

  await page.waitForTimeout(200);

  await openMultiSelect(page, 'statusSelector');
  await page.getByText('Invoiced').first().click();

  // Select "Last 7 Days" date range via React Select customSelector
  await selectCustomOption(page, 'Range', 'Last 7 Days');

  await openMultiSelect(page, 'clientItemSelector');
  await page
    .locator('#clientItemSelector')
    .getByText(client.name, { exact: true })
    .first()
    .click();

  await openMultiSelect(page, 'projectItemSelector');
  await page
    .locator('#projectItemSelector')
    .getByText(project.name, { exact: true })
    .first()
    .click();

  await openMultiSelect(page, 'expenseCategoryItemSelector');
  await page
    .locator('#expenseCategoryItemSelector')
    .getByText(category.name, { exact: true })
    .first()
    .click();

  await page.locator('[data-cy="includeDeleted"]').check();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expectCustomSelectText(page, 'Report', 'Expense');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'Last 7 Days');
  await expect(page.locator('#clientItemSelector')).toContainText(
    client.name
  );
  await expect(page.locator('#projectItemSelector')).toContainText(
    project.name
  );
  await expect(page.locator('#expenseCategoryItemSelector')).toContainText(
    category.name
  );
  await expect(page.locator('[data-cy="includeDeleted"]')).toBeChecked();
  await expect(page.locator('[id="statusSelector"]')).toContainText(
    'PendingInvoiced'
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');
  trackScheduleFromUrl(page, api);

  await expectCustomSelectText(page, 'Report', 'Expense');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'Last 7 Days');
  await expect(page.locator('#clientItemSelector')).toContainText(
    client.name
  );
  await expect(page.locator('#projectItemSelector')).toContainText(
    project.name
  );
  await expect(page.locator('#expenseCategoryItemSelector')).toContainText(
    category.name
  );
  await expect(page.locator('[data-cy="includeDeleted"]')).toBeChecked();
  await expect(page.locator('[id="statusSelector"]')).toContainText(
    'PendingInvoiced'
  );

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Product sales report test with filtering products', async ({ page, api }) => {
  // Create prerequisite products via API
  const apiCtx = await createApiContext(process.env.VITE_API_URL!);
  const product1 = await createProductViaApi(apiCtx, {
    product_key: uniqueName('sched-filt-prod-1'),
  });
  api.trackEntity('products', product1.id);
  const product2 = await createProductViaApi(apiCtx, {
    product_key: uniqueName('sched-filt-prod-2'),
  });
  api.trackEntity('products', product2.id);

  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  // Select "Product Sales" report via React Select customSelector
  await selectCustomOption(page, 'Report', 'Product Sales');

  // Open the product multi-select and search/select product1
  await openMultiSelect(page, 'productItemSelector');

  await page
    .locator('[id="productItemSelector"]')
    .locator('[type="text"]')
    .first()
    .fill(product1.product_key);

  await page.waitForTimeout(200);

  await page.getByText(product1.product_key, { exact: true }).click();

  await page.waitForTimeout(200);

  // Search and select product2
  await page
    .locator('[id="productItemSelector"]')
    .locator('[type="text"]')
    .first()
    .fill(product2.product_key);

  await page.waitForTimeout(200);

  await page.getByText(product2.product_key, { exact: true }).first().click();

  await page.locator('[data-testid="combobox-input-field"]').click();

  await page.waitForTimeout(200);

  await page.locator('[role="listbox"]').getByRole('option').first().click();

  // Select "Custom" date range via React Select customSelector
  await selectCustomOption(page, 'Range', 'Custom');

  await page.waitForTimeout(200);

  await page.fill('[data-cy="reportStartDate"]', dayjs().format('YYYY-MM-DD'));

  await page.fill(
    '[data-cy="reportEndDate"]',
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expectCustomSelectText(page, 'Report', 'Product Sales');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'Custom');
  await expect(page.locator('[data-cy="scheduleStartDate"]')).toHaveValue(
    dayjs().format('YYYY-MM-DD')
  );
  await expect(page.locator('[data-cy="scheduleEndDate"]')).toHaveValue(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );
  await expect(page.locator('[id="productItemSelector"]')).toContainText(
    product1.product_key
  );
  await expect(page.locator('[id="productItemSelector"]')).toContainText(
    product2.product_key
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');
  trackScheduleFromUrl(page, api);

  await expectCustomSelectText(page, 'Report', 'Product Sales');
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expectCustomSelectText(page, 'Range', 'Custom');
  await expect(page.locator('[data-cy="scheduleStartDate"]')).toHaveValue(
    dayjs().format('YYYY-MM-DD')
  );
  await expect(page.locator('[data-cy="scheduleEndDate"]')).toHaveValue(
    dayjs().add(1, 'day').format('YYYY-MM-DD')
  );
  await expect(page.locator('[id="productItemSelector"]')).toContainText(
    product1.product_key
  );
  await expect(page.locator('[id="productItemSelector"]')).toContainText(
    product2.product_key
  );
  await expect(
    page.locator('[data-testid="combobox-input-field"]')
  ).not.toBeEmpty();

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});
