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

function trackScheduleFromUrl(page: { url: () => string }, api: { trackEntity: (type: EntityType, id: string) => void }) {
  const id = extractIdFromUrl(page.url(), 'schedules');
  if (id) api.trackEntity('task_schedulers', id);
}

test('Activity report test', async ({ page, api }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  await page
    .locator('[data-cy="reportDateRange"]')
    .selectOption({ label: 'Last 7 Days' });

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'activity'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'last7_days'
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');
  trackScheduleFromUrl(page, api);

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'activity'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'last7_days'
  );

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

  await page
    .locator('[data-cy="reportNameSelector"]')
    .selectOption({ label: 'Invoice' });

  await page.locator('[id="statusSelector"]').click();

  await page.getByText('Draft').click();

  await page.waitForTimeout(200);

  await page.locator('[id="statusSelector"]').click();

  await page.getByText('Paid').first().click();

  await page
    .locator('[data-cy="reportDateRange"]')
    .selectOption({ label: 'Custom' });

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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'invoice'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'custom'
  );
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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'invoice'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'custom'
  );
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

  await page
    .locator('[data-cy="reportNameSelector"]')
    .selectOption({ label: 'Profit and Loss' });

  await page.locator('[data-cy="expenseBilled"]').check();
  await page.locator('[data-cy="incomeBilled"]').check();
  await page.locator('[data-cy="includeTax"]').check();

  await page
    .locator('[data-cy="reportDateRange"]')
    .selectOption({ label: 'This Month' });

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Schedule', exact: true })
    .click();

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'profitloss'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="expenseBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="incomeBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="includeTax"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'this_month'
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');
  trackScheduleFromUrl(page, api);

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'profitloss'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="expenseBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="incomeBilled"]')).toBeChecked();
  await expect(page.locator('[data-cy="includeTax"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'this_month'
  );

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

  await page
    .locator('[data-cy="reportNameSelector"]')
    .selectOption({ label: 'Product Sales' });

  await page
    .locator('[class=" css-1xc3v61-indicatorContainer"]')
    .last()
    .click();

  await page.getByText(product1.product_key, { exact: true }).first().click();

  await page.getByText('Products', { exact: true }).last().click();

  await page
    .locator('[class=" css-1xc3v61-indicatorContainer"]')
    .last()
    .click();

  await page
    .getByText(product2.product_key, { exact: true })
    .first()
    .click();

  await page.locator('[data-testid="combobox-input-field"]').click();

  await page.waitForTimeout(200);

  await page.locator('[role="listbox"]').getByRole('option').first().click();

  await page
    .locator('[data-cy="reportDateRange"]')
    .selectOption({ label: 'Custom' });

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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'product_sales'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'custom'
  );
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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'product_sales'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'custom'
  );
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

  await page
    .locator('[data-cy="reportNameSelector"]')
    .selectOption({ label: 'Expense' });

  await page.locator('[id="statusSelector"]').click();

  await page.getByText('Pending').click();

  await page.waitForTimeout(200);

  await page.locator('[id="statusSelector"]').click();

  await page.getByText('Invoiced').first().click();

  await page
    .locator('[data-cy="reportDateRange"]')
    .selectOption({ label: 'This Month' });

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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'expense'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'this_month'
  );
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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'expense'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'this_month'
  );
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

  await page
    .locator('[data-cy="reportNameSelector"]')
    .selectOption({ label: 'Expense' });

  await page.waitForTimeout(300);

  await page.locator('[id="statusSelector"]').click();

  await page.getByText('Pending').click();

  await page.waitForTimeout(200);

  await page.locator('[id="statusSelector"]').click();

  await page.getByText('Invoiced').first().click();

  await page
    .locator('[data-cy="reportDateRange"]')
    .selectOption({ label: 'Last 7 Days' });

  await page.locator('#clientItemSelector').first().click();

  await page
    .locator('#clientItemSelector')
    .getByText(client.name, { exact: true })
    .first()
    .click();

  await page.locator('#projectItemSelector').first().click();

  await page
    .locator('#projectItemSelector')
    .getByText(project.name, { exact: true })
    .first()
    .click();

  await page.locator('#expenseCategoryItemSelector').first().click();

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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'expense'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'last7_days'
  );
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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'expense'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'last7_days'
  );
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

  await page
    .locator('[data-cy="reportNameSelector"]')
    .selectOption({ label: 'Product Sales' });

  await page.locator('[id="productItemSelector"]').click();

  await page
    .locator('[id="productItemSelector"]')
    .locator('[type="text"]')
    .first()
    .fill(product1.product_key);

  await page.waitForTimeout(200);

  await page.getByText(product1.product_key, { exact: true }).click();

  await page.waitForTimeout(200);

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

  await page
    .locator('[data-cy="reportDateRange"]')
    .selectOption({ label: 'Custom' });

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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'product_sales'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'custom'
  );
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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'product_sales'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'custom'
  );
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
