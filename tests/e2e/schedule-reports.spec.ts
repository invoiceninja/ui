import { login } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';
import dayjs from 'dayjs';

test('Activity report test', async ({ page }) => {
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
    .getByRole('button', { name: 'More Actions', exact: true })
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

test('Invoice report test', async ({ page }) => {
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
    .getByRole('button', { name: 'More Actions', exact: true })
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
    'test edit client'
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');

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
    'test edit client'
  );

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Profit and loss report test', async ({ page }) => {
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
    .getByRole('button', { name: 'More Actions', exact: true })
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

test('Product sales report test', async ({ page }) => {
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

  await page.getByText('test create product', { exact: true }).first().click();

  await page.getByText('Products', { exact: true }).last().click();

  await page
    .locator('[class=" css-1xc3v61-indicatorContainer"]')
    .last()
    .click();

  await page
    .getByText('test dropdown product', { exact: true })
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
    .getByRole('button', { name: 'More Actions', exact: true })
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
    'test create producttest dropdown product'
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');

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
    'test create producttest dropdown product'
  );
  await expect(
    page.locator('[data-testid="combobox-input-field"]')
  ).not.toBeEmpty();

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Expense report test', async ({ page }) => {
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
    .getByRole('button', { name: 'More Actions', exact: true })
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
}) => {
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
    .getByText('test create client', { exact: true })
    .first()
    .click();

  await page.locator('#projectItemSelector').first().click();

  await page
    .locator('#projectItemSelector')
    .getByText('test assigned project', { exact: true })
    .first()
    .click();

  await page.locator('#expenseCategoryItemSelector').first().click();

  await page
    .locator('#expenseCategoryItemSelector')
    .getByText('testing create expense', { exact: true })
    .first()
    .click();

  await page.locator('[data-cy="includeDeleted"]').check();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
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
    'test create client'
  );
  await expect(page.locator('#projectItemSelector')).toContainText(
    'test assigned project'
  );
  await expect(page.locator('#expenseCategoryItemSelector')).toContainText(
    'testing create expense'
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

  await expect(page.locator('[data-cy="scheduleReportName"]')).toHaveValue(
    'expense'
  );
  await expect(page.locator('[data-cy="scheduleSendEmail"]')).toBeChecked();
  await expect(page.locator('[data-cy="scheduleDateRange"]')).toHaveValue(
    'last7_days'
  );
  await expect(page.locator('#clientItemSelector')).toContainText(
    'test create client'
  );
  await expect(page.locator('#projectItemSelector')).toContainText(
    'test assigned project'
  );
  await expect(page.locator('#expenseCategoryItemSelector')).toContainText(
    'testing create expense'
  );
  await expect(page.locator('[data-cy="includeDeleted"]')).toBeChecked();
  await expect(page.locator('[id="statusSelector"]')).toContainText(
    'PendingInvoiced'
  );

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});

test('Product sales report test with filtering products', async ({ page }) => {
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
    .fill('test actions product');

  await page.waitForTimeout(200);

  await page.getByText('test actions product', { exact: true }).click();

  await page.waitForTimeout(200);

  await page
    .locator('[id="productItemSelector"]')
    .locator('[type="text"]')
    .first()
    .fill('test view product');

  await page.waitForTimeout(200);

  await page.getByText('test view product', { exact: true }).first().click();

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
    .getByRole('button', { name: 'More Actions', exact: true })
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
    'test actions producttest view product'
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await page.waitForURL('**/settings/schedules/**/edit');

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
    'test actions producttest view product'
  );
  await expect(
    page.locator('[data-testid="combobox-input-field"]')
  ).not.toBeEmpty();

  await expect(
    page.locator('h2').filter({ hasText: 'Edit Schedule' })
  ).toBeVisible();
});
