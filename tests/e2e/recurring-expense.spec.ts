import {
  Permission,
  checkDropdownActions,
  checkTableEditability,
  login,
  logout,
  permissions,
  useHasPermission,
  waitForTableData,
} from '$tests/e2e/helpers';
import { test, expect, uniqueName } from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';
import { Action } from './clients.spec';

interface Params {
  permissions: Permission[];
}
function useRecurringExpensesActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Clone',
      visible: hasPermission('create_recurring_expense'),
    },
    {
      label: 'Clone to Expense',
      visible: hasPermission('create_expense'),
    },
  ];

  return actions;
}

const checkEditPage = async (page: Page, isEditable: boolean) => {
  await page.waitForURL('**/recurring_expenses/**/edit');

  if (isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).toBeVisible({ timeout: 10000 });
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).not.toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).not.toBeVisible({ timeout: 10000 });
  }
};

interface CreateParams {
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
  returnCreditNumber?: boolean;
}
const createRecurringExpense = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo, returnCreditNumber } = params;

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Recurring Expense' })
    .click();

  await page.waitForURL('**/recurring_expenses/create');

  if (assignTo) {
    const assignedUserInput = page.getByTestId('combobox-input-field').nth(4);
    await assignedUserInput.click();
    await assignedUserInput.fill(assignTo.split(' ')[0]);

    const option = page.getByRole('option', { name: assignTo }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created recurring expense')
  ).toBeVisible({ timeout: 10000 });

  if (returnCreditNumber) {
    await page.waitForURL('**/recurring_expenses/**/edit');

    return await page.locator('[id="number"]').inputValue();
  }
};

test("can't view recurring expenses without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Recurring Expenses'
  );

  await logout(page);
});

test('can view recurring expense', async ({ page, api }) => {
  test.setTimeout(60000); 
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('view_recurring_expense');
  await save();

  await createRecurringExpense({ page });

  await page.waitForURL('**/recurring_expenses/**/edit');
  const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_expenses', createdId);

  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, false);

  await logout(page);
});

test('can edit recurring expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useRecurringExpensesActions({
    permissions: ['edit_recurring_expense'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('edit_recurring_expense');
  await save();

  await createRecurringExpense({ page });

  await page.waitForURL('**/recurring_expenses/**/edit');
  const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_expenses', createdId);

  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await checkTableEditability(page, true);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring expense', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'recurringExpenseActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('can create a recurring expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useRecurringExpensesActions({
    permissions: ['create_recurring_expense'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('create_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await createRecurringExpense({ page, isTableEditable: false });

  await page.waitForURL('**/recurring_expenses/**/edit');
  const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_expenses', createdId);

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring expense', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'recurringExpenseActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('can view and edit assigned recurring expense with create_recurring_expense', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useRecurringExpensesActions({
    permissions: ['create_recurring_expense'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('create_recurring_expense');
  await save();

  const recurringExpenseNumber = await createRecurringExpense({
    page,
    assignTo: 'Expenses Example',
    returnCreditNumber: true,
  });

  await page.waitForURL('**/recurring_expenses/**/edit');
  const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_expenses', createdId);

  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: recurringExpenseNumber, exact: true })
    .click();

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring expense', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'recurringExpenseActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('deleting recurring expense with edit_recurring_expense', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_recurring_expense', 'edit_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/recurring_expenses');

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createRecurringExpense({ page });

    await page.waitForURL('**/recurring_expenses/**/edit');
    const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('recurring_expenses', createdId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByRole('button', { name: 'Delete', exact: true }).click();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByRole('button', { name: 'Delete', exact: true }).click();
  }

  await expect(
    page.getByText('Successfully deleted recurring expense')
  ).toBeVisible({ timeout: 10000 });
});

test('archiving recurring expense with edit_recurring_expense', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_recurring_expense', 'edit_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await page.waitForURL('**/recurring_expenses');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createRecurringExpense({ page });

    await page.waitForURL('**/recurring_expenses/**/edit');
    const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('recurring_expenses', createdId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByRole('button', { name: 'Archive', exact: true }).click();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible({ timeout: 10000 });
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByRole('button', { name: 'Archive', exact: true }).click();
  }

  await expect(
    page.getByText('Successfully archived recurring expense')
  ).toBeVisible({ timeout: 10000 });
});

test('recurring expense documents preview with edit_recurring_expense', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_recurring_expense', 'edit_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await page.waitForURL('**/recurring_expenses');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createRecurringExpense({ page });

    await page.waitForURL('**/recurring_expenses/**/edit');
    const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('recurring_expenses', createdId);
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/recurring_expenses/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/recurring_expenses/**/documents');

  await expect(page.getByText('Drop files or click to upload')).toBeVisible({ timeout: 10000 });
});

test('recurring expense documents uploading with edit_recurring_expense', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_recurring_expense', 'edit_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await page.waitForURL('**/recurring_expenses');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createRecurringExpense({ page });

    await page.waitForURL('**/recurring_expenses/**/edit');
    const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('recurring_expenses', createdId);
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/recurring_expenses/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/recurring_expenses/**/documents');

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible({ timeout: 10000 });
});

test('all actions in dropdown displayed with admin permission', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useRecurringExpensesActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await createRecurringExpense({ page });

  await page.waitForURL('**/recurring_expenses/**/edit');
  const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_expenses', createdId);

  await checkEditPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'recurringExpenseActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('all clone actions displayed with creation permissions', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useRecurringExpensesActions({
    permissions: ['create_expense', 'create_recurring_expense'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('create_expense', 'create_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await createRecurringExpense({ page, isTableEditable: false });

  await page.waitForURL('**/recurring_expenses/**/edit');
  const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_expenses', createdId);

  await checkEditPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'recurringExpenseActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('cloning recurring expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_recurring_expense', 'edit_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await page.waitForURL('**/recurring_expenses');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createRecurringExpense({ page });

    await page.waitForURL('**/recurring_expenses/**/edit');
    const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('recurring_expenses', createdId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();
  }

  await page.getByText('Clone').first().click();

  await page.waitForURL('**/recurring_expenses/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created recurring expense')
  ).toBeVisible({ timeout: 10000 });

  await page.waitForURL('**/recurring_expenses/**/edit');

  const clonedId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
  if (clonedId) api.trackEntity('recurring_expenses', clonedId);

  await expect(
    page.getByRole('heading', { name: 'Edit Recurring Expense' }).first()
  ).toBeVisible({ timeout: 10000 });
});

test('Checking should_be_invoiced expense settings value on recurring expense creation page', async ({
  page,
}) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Expense Settings', exact: true })
    .click();

  if (!(await page.locator('[data-cy="shouldBeInvoicedToggle"]').isChecked())) {
    await page.locator('[data-cy="shouldBeInvoicedToggle"]').check();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully updated settings')).toBeVisible({ timeout: 10000 });
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Recurring Expense' })
    .click();

  await expect(
    page.locator('[data-cy="shouldBeInvoicedToggle"]')
  ).toBeChecked();

  await logout(page);
});

test('Checking mark_paid expense settings value on recurring_expense creation page', async ({
  page,
}) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Expense Settings', exact: true })
    .click();

  if (!(await page.locator('[data-cy="markPaidToggle"]').isChecked())) {
    await page.locator('[data-cy="markPaidToggle"]').check();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully updated settings')).toBeVisible({ timeout: 10000 });
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Recurring Expense' })
    .click();

  await expect(page.locator('[data-cy="markPaidToggle"]')).toBeChecked();

  await logout(page);
});

test('Checking convert_currency expense settings value on recurring_expense creation page', async ({
  page,
}) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Expense Settings', exact: true })
    .click();

  if (!(await page.locator('[data-cy="convertCurrencyToggle"]').isChecked())) {
    await page.locator('[data-cy="convertCurrencyToggle"]').check();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully updated settings')).toBeVisible({ timeout: 10000 });
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Recurring Expense' })
    .click();

  await expect(page.locator('[data-cy="convertCurrencyToggle"]')).toBeChecked();

  await logout(page);
});

test('Checking add_documents_to_invoice expense settings value on recurring_expense creation page', async ({
  page,
}) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Expense Settings', exact: true })
    .click();

  if (
    !(await page.locator('[data-cy="addDocumentsToInvoiceToggle"]').isChecked())
  ) {
    await page.locator('[data-cy="addDocumentsToInvoiceToggle"]').check();

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully updated settings')).toBeVisible({ timeout: 10000 });
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Recurring Expense' })
    .click();

  await expect(
    page.locator('[data-cy="addDocumentsToInvoiceToggle"]')
  ).toBeChecked();

  await logout(page);
});

test('Checking the gross amount by rate', async ({ page, api }) => {
  const taxRate10Name = uniqueName('tax-rate-10');
  const taxRate20Name = uniqueName('tax-rate-20');

  await login(page);

  // Create tax rates and enable "Two Tax Rates" in settings
  const { createTaxRate } = await import('./taxes-helpers');
  await createTaxRate({ page, taxName: taxRate10Name, rate: 10 });
  await createTaxRate({ page, taxName: taxRate20Name, rate: 20 });

  await page
    .getByRole('link', { name: 'Tax Settings', exact: true })
    .first()
    .click();

  const taxRateRow = page.locator('dt:has-text("Expense Tax Rates")').locator('..');
  const currentValue = await taxRateRow.locator('[class*="singleValue"]').textContent().catch(() => '');
  if (currentValue !== 'Two Tax Rates') {
    await taxRateRow.locator('svg').last().click();
    await page.getByText('Two Tax Rates', { exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Successfully updated settings')).toBeVisible({ timeout: 10000 });
  }

  await createRecurringExpense({ page });

  await page.waitForURL('**/recurring_expenses/**/edit');
  const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_expenses', createdId);

  const taxInput1 = page.getByTestId('combobox-input-field').nth(5);
  await taxInput1.click();
  await taxInput1.fill(taxRate10Name);
  const taxOption1 = page.getByRole('option', { name: taxRate10Name }).first();
  await taxOption1.waitFor({ state: 'visible', timeout: 5000 });
  await taxOption1.click();

  const taxInput2 = page.getByTestId('combobox-input-field').nth(6);
  await taxInput2.click();
  await taxInput2.fill(taxRate20Name);
  const taxOption2 = page.getByRole('option', { name: taxRate20Name }).first();
  await taxOption2.waitFor({ state: 'visible', timeout: 5000 });
  await taxOption2.click();

  // Amount field uses NumericFormat (type="text"), find via label
  const amountInput = page.locator('dt:has-text("Amount")').locator('..').locator('input').first();
  await amountInput.fill('12222');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring expense', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await expect(page.getByText('$ 15,888.60')).toBeVisible({ timeout: 10000 });

  await logout(page);
});

test('Checking the gross amount with inclusive taxes turned on', async ({
  page,
  api,
}) => {
  const taxRate10Name = uniqueName('tax-rate-10-incl');
  const taxRate20Name = uniqueName('tax-rate-20-incl');

  await login(page);

  // Create tax rates and enable "Two Tax Rates" in settings
  const { createTaxRate } = await import('./taxes-helpers');
  await createTaxRate({ page, taxName: taxRate10Name, rate: 10 });
  await createTaxRate({ page, taxName: taxRate20Name, rate: 20 });

  await page
    .getByRole('link', { name: 'Tax Settings', exact: true })
    .first()
    .click();

  const taxRateRow = page.locator('dt:has-text("Expense Tax Rates")').locator('..');
  const currentValue = await taxRateRow.locator('[class*="singleValue"]').textContent().catch(() => '');
  if (currentValue !== 'Two Tax Rates') {
    await taxRateRow.locator('svg').last().click();
    await page.getByText('Two Tax Rates', { exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Successfully updated settings')).toBeVisible({ timeout: 10000 });
  }

  await createRecurringExpense({ page });

  await page.waitForURL('**/recurring_expenses/**/edit');
  const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_expenses', createdId);

  const taxInput1 = page.getByTestId('combobox-input-field').nth(5);
  await taxInput1.click();
  await taxInput1.fill(taxRate10Name);
  const taxOption1 = page.getByRole('option', { name: taxRate10Name }).first();
  await taxOption1.waitFor({ state: 'visible', timeout: 5000 });
  await taxOption1.click();

  const taxInput2 = page.getByTestId('combobox-input-field').nth(6);
  await taxInput2.click();
  await taxInput2.fill(taxRate20Name);
  const taxOption2 = page.getByRole('option', { name: taxRate20Name }).first();
  await taxOption2.waitFor({ state: 'visible', timeout: 5000 });
  await taxOption2.click();

  // Amount field uses NumericFormat (type="text"), find via label
  const amountInput = page.locator('dt:has-text("Amount")').locator('..').locator('input').first();
  await amountInput.fill('12222');

  await page.locator('[data-cy="inclusiveTaxesToggle"]').first().check();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring expense', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await expect(page.getByText('$ 12,222.00')).toBeVisible({ timeout: 10000 });

  await logout(page);
});

test('Checking the gross amount by amount', async ({ page, api }) => {
  await login(page);

  // Ensure "Two Tax Rates" is enabled in settings
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();
  await page.getByRole('link', { name: 'Tax Settings', exact: true }).click();

  const taxRateRow = page.locator('dt:has-text("Expense Tax Rates")').locator('..');
  const currentValue = await taxRateRow.locator('[class*="singleValue"]').textContent().catch(() => '');
  if (currentValue !== 'Two Tax Rates') {
    await taxRateRow.locator('svg').last().click();
    await page.getByText('Two Tax Rates', { exact: true }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Successfully updated settings')).toBeVisible({ timeout: 10000 });
  }

  await createRecurringExpense({ page });

  await page.waitForURL('**/recurring_expenses/**/edit');
  const createdId = page.url().match(/recurring_expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_expenses', createdId);

  await page.locator('[data-cy="inclusiveTaxesToggle"]').first().uncheck();

  await page.locator('#by_amount').click();

  await page.locator('[data-cy="taxNameByAmount1"]').fill('tax_name_1');
  await page.locator('[data-cy="taxNameByAmount1"]').locator('xpath=ancestor::section/following-sibling::section//input').fill('100');
  await page.locator('[data-cy="taxNameByAmount2"]').fill('tax_name_2');
  await page.locator('[data-cy="taxNameByAmount2"]').locator('xpath=ancestor::section/following-sibling::section//input').fill('200');

  // Amount field uses NumericFormat (type="text"), find via label
  const amountInput = page.locator('dt:has-text("Amount")').locator('..').locator('input').first();
  await amountInput.fill('12222');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring expense', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await expect(page.getByText('$ 12,522.00')).toBeVisible({ timeout: 10000 });

  await logout(page);
});
