import {
  Permission,
  checkDropdownActions,
  checkTableEditability,
  login,
  logout,
  permissions,
  useHasPermission,
} from '$tests/e2e/helpers';
import { test, expect, uniqueName } from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';
import { Action } from './clients.spec';
import { createExpenseCategory } from './expense-categories-helpers';
import { createTaxRate } from './taxes-helpers';

interface Params {
  permissions: Permission[];
}
function useExpensesActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Clone',
      visible: hasPermission('create_expense'),
    },
    {
      label: 'Clone to Recurring',
      visible: hasPermission('create_recurring_expense'),
    },
  ];

  return actions;
}

const checkEditPage = async (page: Page, isEditable: boolean) => {
  await page.waitForURL('**/expenses/**/edit');

  if (isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible();

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).not.toBeVisible();

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).not.toBeVisible();
  }
};

interface CreateParams {
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
  returnCreditNumber?: boolean;
}
const createExpense = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo, returnCreditNumber } = params;

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await page.waitForURL('**/expenses/create');

  await page.waitForTimeout(300);

  if (assignTo) {
    await page.getByTestId('combobox-input-field').nth(4).click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  if (returnCreditNumber) {
    await page.waitForURL('**/expenses/**/edit');

    return await page.locator('[id="number"]').inputValue();
  }
};

test("can't view expenses without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Expenses'
  );

  await logout(page);
});

test('can view expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('view_expense');
  await save();

  await createExpense({ page });

  await page.waitForURL('**/expenses/**/edit');
  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, false);

  await logout(page);
});

test('can edit expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useExpensesActions({
    permissions: ['edit_expense'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('edit_expense');
  await save();

  await createExpense({ page });

  await page.waitForURL('**/expenses/**/edit');
  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
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
    page.getByText('Successfully updated expense', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'expenseActionDropdown', '', true);

  await logout(page);
});

test('can create a expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useExpensesActions({
    permissions: ['create_expense'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('create_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await createExpense({ page, isTableEditable: false });

  await page.waitForURL('**/expenses/**/edit');
  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated expense', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'expenseActionDropdown', '', true);

  await logout(page);
});

test('can view and edit assigned expense with create_expense', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useExpensesActions({
    permissions: ['create_expense'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('create_expense');
  await save();

  const expenseNumber = await createExpense({
    page,
    assignTo: 'Expenses Example',
    returnCreditNumber: true,
  });

  await page.waitForURL('**/expenses/**/edit');
  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page.getByRole('link', { name: expenseNumber, exact: true }).click();

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated expense', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'expenseActionDropdown', '', true);

  await logout(page);
});

test('deleting expense with edit_expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_expense', 'edit_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Expenses', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/expenses');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createExpense({ page });

    await page.waitForURL('**/expenses/**/edit');
    const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('expenses', createdId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Delete').click();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByText('Delete').click();
  }

  await expect(page.getByText('Successfully deleted expense')).toBeVisible();
});

test('archiving expense with edit_expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_expense', 'edit_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Expenses', exact: true }).click();

  await page.waitForURL('**/expenses');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createExpense({ page });

    await page.waitForURL('**/expenses/**/edit');
    const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('expenses', createdId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Archive').click();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByText('Archive').click();
  }

  await expect(page.getByText('Successfully archived expense')).toBeVisible();
});

test('expense documents preview with edit_expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_expense', 'edit_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Expenses', exact: true }).click();

  await page.waitForURL('**/expenses');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createExpense({ page });

    await page.waitForURL('**/expenses/**/edit');
    const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('expenses', createdId);
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/expenses/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/expenses/**/documents');

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('expense documents uploading with edit_expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_expense', 'edit_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Expenses', exact: true }).click();

  await page.waitForURL('**/expenses');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createExpense({ page });

    await page.waitForURL('**/expenses/**/edit');
    const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('expenses', createdId);
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/expenses/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/expenses/**/documents');

  await page
    .locator('input[type="file"]')
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible();

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible();
});

test('all actions in dropdown displayed with admin permission', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useExpensesActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await createExpense({ page });

  await page.waitForURL('**/expenses/**/edit');
  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await checkEditPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'expenseActionDropdown', '', true);

  await logout(page);
});

test('all clone actions displayed with creation permissions', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useExpensesActions({
    permissions: ['create_expense', 'create_recurring_expense'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('create_expense', 'create_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await createExpense({ page, isTableEditable: false });

  await page.waitForURL('**/expenses/**/edit');
  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await checkEditPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'expenseActionDropdown', '', true);

  await logout(page);
});

test('cloning expense', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_expense', 'edit_expense');
  await save();
  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page.waitForURL('**/expenses');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createExpense({ page });

    await page.waitForURL('**/expenses/**/edit');
    const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('expenses', createdId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();
  }

  await page.getByText('Clone').first().click();

  await page.waitForURL('**/expenses/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  await page.waitForURL('**/expenses/**/edit');

  const clonedId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (clonedId) api.trackEntity('expenses', clonedId);

  await expect(
    page.getByRole('heading', { name: 'Edit Expense' }).first()
  ).toBeVisible();
});

test('Expense categories endpoint contains sort but not with parameter', async ({
  page,
  api,
}) => {
  const expenseCategoryName = uniqueName('expense-cat-sort');

  await login(page);

  await createExpenseCategory({
    page,
    categoryName: expenseCategoryName,
  });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await page.getByTestId('combobox-input-field').nth(3).click();
  await page
    .getByRole('option', { name: expenseCategoryName })
    .first()
    .click();

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  await page.waitForURL('**/expenses/**/edit');

  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await page.reload();

  await page.route('**/api/v1/expense_categories?status=active**', (route) => {
    expect(route.request().url()).toContain('sort=name');
    expect(route.request().url()).not.toContain('with=');

    route.continue();
  });

  await logout(page);
});

test('Expense categories endpoint contains with but not sort parameter', async ({
  page,
  api,
}) => {
  const expenseCategoryName = uniqueName('expense-cat-with');

  await login(page);

  await createExpenseCategory({
    page,
    categoryName: expenseCategoryName,
  });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await page.getByTestId('combobox-input-field').nth(3).click();
  await page
    .getByTestId('combobox-input-field')
    .nth(3)
    .fill(expenseCategoryName);

  await page.waitForTimeout(300);

  await page
    .getByRole('option', { name: expenseCategoryName })
    .first()
    .click();

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  await page.waitForURL('**/expenses/**/edit');

  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await page.reload();

  await page.route('**/api/v1/expense_categories?status=active**', (route) => {
    expect(route.request().url()).not.toContain('sort=name');
    expect(route.request().url()).toContain('with=');

    route.continue();
  });

  await logout(page);
});

test('Checking should_be_invoiced expense settings value on expense creation page', async ({
  page,
  settingsGuard,
}) => {
  await login(page);

  await settingsGuard.snapshot();

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

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await expect(
    page.locator('[data-cy="shouldBeInvoicedToggle"]')
  ).toBeChecked();

  await logout(page);
});

test('Checking mark_paid expense settings value on expense creation page', async ({
  page,
  settingsGuard,
}) => {
  await login(page);

  await settingsGuard.snapshot();

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

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await expect(page.locator('[data-cy="markPaidToggle"]')).toBeChecked();

  await logout(page);
});

test('Checking convert_currency expense settings value on expense creation page', async ({
  page,
  settingsGuard,
}) => {
  await login(page);

  await settingsGuard.snapshot();

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

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await expect(page.locator('[data-cy="convertCurrencyToggle"]')).toBeChecked();

  await logout(page);
});

test('Checking add_documents_to_invoice expense settings value on expense creation page', async ({
  page,
  settingsGuard,
}) => {
  await login(page);

  await settingsGuard.snapshot();

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

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await expect(
    page.locator('[data-cy="addDocumentsToInvoiceToggle"]')
  ).toBeChecked();

  await logout(page);
});

test('Checking the gross amount by rate', async ({ page, api, settingsGuard }) => {
  const taxRate10Name = uniqueName('tax-rate-10');
  const taxRate20Name = uniqueName('tax-rate-20');

  await login(page);

  await settingsGuard.snapshot();

  await createTaxRate({ page, taxName: taxRate10Name, rate: 10 });

  await createTaxRate({ page, taxName: taxRate20Name, rate: 20 });

  await page
    .getByRole('link', { name: 'Tax Settings', exact: true })
    .first()
    .click();

  if ((await page.locator('#enabled_expense_tax_rates').inputValue()) !== '2') {
    await page
      .locator('#enabled_expense_tax_rates')
      .selectOption({ label: 'Two Tax Rates' });

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await page.waitForURL('**/expenses/create');

  await page.waitForTimeout(300);

  await page.getByTestId('combobox-input-field').nth(5).click();
  await page.getByText(taxRate10Name).click();
  await page.getByTestId('combobox-input-field').nth(5).blur();

  await page.getByTestId('combobox-input-field').nth(6).click();
  await page.getByText(taxRate20Name).click();
  await page.getByTestId('combobox-input-field').nth(6).blur();

  await page.locator('[type="number"]').first().fill('12222');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  await page.waitForURL('**/expenses/**/edit');

  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await expect(page.getByText('$ 15,888.60')).toBeVisible();

  await logout(page);
});

test('Checking the gross amount with inclusive taxes turned on', async ({
  page,
  api,
  settingsGuard,
}) => {
  const taxRate10Name = uniqueName('tax-rate-10-incl');
  const taxRate20Name = uniqueName('tax-rate-20-incl');

  await login(page);

  await settingsGuard.snapshot();

  await createTaxRate({ page, taxName: taxRate10Name, rate: 10 });

  await createTaxRate({ page, taxName: taxRate20Name, rate: 20 });

  await page
    .getByRole('link', { name: 'Tax Settings', exact: true })
    .first()
    .click();

  if ((await page.locator('#enabled_expense_tax_rates').inputValue()) !== '2') {
    await page
      .locator('#enabled_expense_tax_rates')
      .selectOption({ label: 'Two Tax Rates' });

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await page.waitForURL('**/expenses/create');

  await page.waitForTimeout(300);

  await page.getByTestId('combobox-input-field').nth(5).click();
  await page.getByText(taxRate10Name).click();
  await page.getByTestId('combobox-input-field').nth(5).blur();

  await page.getByTestId('combobox-input-field').nth(6).click();
  await page.getByText(taxRate20Name).click();
  await page.getByTestId('combobox-input-field').nth(6).blur();

  await page.locator('[type="number"]').first().fill('12222');

  await page.locator('[data-cy="inclusiveTaxesToggle"]').first().check();

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  await page.waitForURL('**/expenses/**/edit');

  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await expect(page.getByText('$ 12,222.00')).toBeVisible();

  await logout(page);
});

test('Checking the gross amount by amount', async ({ page, api, settingsGuard }) => {
  const taxRate10Name = uniqueName('tax-rate-10-amt');
  const taxRate20Name = uniqueName('tax-rate-20-amt');

  await login(page);

  await settingsGuard.snapshot();

  await createTaxRate({ page, taxName: taxRate10Name, rate: 10 });

  await createTaxRate({ page, taxName: taxRate20Name, rate: 20 });

  await page
    .getByRole('link', { name: 'Tax Settings', exact: true })
    .first()
    .click();

  if ((await page.locator('#enabled_expense_tax_rates').inputValue()) !== '2') {
    await page
      .locator('#enabled_expense_tax_rates')
      .selectOption({ label: 'Two Tax Rates' });

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await page.waitForURL('**/expenses/create');

  await page.waitForTimeout(300);

  await page.locator('[type="number"]').first().fill('12222');

  await page.locator('#by_amount').click();

  const taxName1 = uniqueName('tax-by-amt-1');
  const taxName2 = uniqueName('tax-by-amt-2');

  await page.locator('[data-cy="taxNameByAmount1"]').fill(taxName1);
  await page.locator('[data-cy="taxRateByAmount1"]').fill('100');
  await page.locator('[data-cy="taxNameByAmount2"]').fill(taxName2);
  await page.locator('[data-cy="taxRateByAmount2"]').fill('200');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  await page.waitForURL('**/expenses/**/edit');

  const createdId = page.url().match(/expenses\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('expenses', createdId);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await expect(page.getByText('$ 12,522.00')).toBeVisible();

  await logout(page);
});

test('The new_expense_category action is not shown on the badge dropdown', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('edit_expense');
  await save();

  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page.waitForTimeout(200);

  await page.getByRole('button', { name: 'Columns', exact: true }).click();

  await page.waitForTimeout(100);

  await page
    .locator('[data-cy="columSelector"]')
    .selectOption({ label: 'Category' });

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByText('Successfully saved settings').first()
  ).toBeVisible();

  await page.waitForTimeout(200);

  await page.locator('[data-cy="expenseCategoryBadge"]').first().click();

  await expect(
    page.locator('[data-cy="newExpenseCategoryAction"]').first()
  ).not.toBeVisible();

  await logout(page);
});

test('The new_expense_category action is shown on the badge dropdown', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('admin');
  await save();

  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page.waitForTimeout(200);

  await page.locator('[data-cy="expenseCategoryBadge"]').first().click();

  await expect(
    page.locator('[data-cy="newExpenseCategoryAction"]').first()
  ).toBeVisible();

  await logout(page);
});

test('The new_expense_category action is shown on the badge dropdown with only create_expense permission', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('create_expense');
  await save();

  await logout(page);

  await login(page, 'expenses@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page.waitForTimeout(200);

  await page.locator('[data-cy="expenseCategoryBadge"]').first().click();

  await expect(
    page.locator('[data-cy="newExpenseCategoryAction"]').first()
  ).toBeVisible();

  await logout(page);
});

test('Creating expense with Save / Create button', async ({ page, api }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page.waitForTimeout(200);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Expense' })
    .click();

  await page.waitForTimeout(200);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page.getByRole('button', { name: 'Save / Create' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  await page.waitForURL('**/expenses/create');

  // The expense was created but we navigated to /create; extract ID from the previous navigation
  // We can't easily get the ID here since URL changed, but we track via the response if needed

  await logout(page);
});
