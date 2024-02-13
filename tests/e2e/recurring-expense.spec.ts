import {
  Permission,
  checkDropdownActions,
  checkTableEditability,
  login,
  logout,
  permissions,
  useHasPermission,
} from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';
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

  await page.waitForTimeout(300);

  if (assignTo) {
    await page.getByTestId('combobox-input-field').nth(4).click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created recurring expense')
  ).toBeVisible();

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

test('can view recurring expense', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('view_recurring_expense');
  await save();

  await createRecurringExpense({ page });

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

test('can edit recurring expense', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useRecurringExpensesActions({
    permissions: ['edit_recurring_expense'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('edit_recurring_expense');
  await save();

  await createRecurringExpense({ page });

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
  ).toBeVisible();

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

test('can create a recurring expense', async ({ page }) => {
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

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring expense', { exact: true })
  ).toBeVisible();

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
  ).toBeVisible();

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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringExpense({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Delete').click();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByText('Delete').click();
  }

  await expect(
    page.getByText('Successfully deleted recurring expense')
  ).toBeVisible();
});

test('archiving recurring expense with edit_recurring_expense', async ({
  page,
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringExpense({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Archive').click();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByText('Archive').click();
  }

  await expect(
    page.getByText('Successfully archived recurring expense')
  ).toBeVisible();
});

test('recurring expense documents preview with edit_recurring_expense', async ({
  page,
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringExpense({ page });
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
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

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('recurring expense documents uploading with edit_recurring_expense', async ({
  page,
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringExpense({ page });
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
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
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible();

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible();
});

test('all actions in dropdown displayed with admin permission', async ({
  page,
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

test('cloning recurring expense', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringExpense({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();
  }

  await page.getByText('Clone').first().click();

  await page.waitForURL('**/recurring_expenses/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created recurring expense')
  ).toBeVisible();

  await page.waitForURL('**/recurring_expenses/**/edit');

  await expect(
    page.getByRole('heading', { name: 'Edit Recurring Expense' }).first()
  ).toBeVisible();
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

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
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

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
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

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
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

    await expect(page.getByText('Successfully updated settings')).toBeVisible();
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

test('Checking the gross amount by rate', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await tableRow
    .getByRole('button')
    .filter({ has: page.getByText('More Actions') })
    .first()
    .click();

  await page.getByText('Edit', { exact: true }).first().click();

  await page.getByTestId('combobox-input-field').nth(5).click();
  await page.getByText('tax_rate_10').click();
  await page.getByTestId('combobox-input-field').nth(5).blur();

  await page.getByTestId('combobox-input-field').nth(6).click();
  await page.getByText('tax_rate_20').click();
  await page.getByTestId('combobox-input-field').nth(6).blur();

  await page.locator('[type="number"]').first().fill('12222');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring expense', { exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await expect(page.getByText('$ 15,888.60')).toBeVisible();

  await logout(page);
});

test('Checking the gross amount with inclusive taxes turned on', async ({
  page,
}) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await tableRow
    .getByRole('button')
    .filter({ has: page.getByText('More Actions') })
    .first()
    .click();

  await page.getByText('Edit', { exact: true }).first().click();

  await page.locator('[data-cy="inclusiveTaxesToggle"]').first().check();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring expense', { exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await expect(page.getByText('$ 12,222.00')).toBeVisible();

  await logout(page);
});

test('Checking the gross amount by amount', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await tableRow
    .getByRole('button')
    .filter({ has: page.getByText('More Actions') })
    .first()
    .click();

  await page.getByText('Edit', { exact: true }).first().click();

  await page.locator('[data-cy="inclusiveTaxesToggle"]').first().uncheck();

  await page.locator('#by_amount').click();

  await page.locator('[data-cy="taxNameByAmount1"]').fill('tax_name_1');
  await page.locator('[data-cy="taxRateByAmount1"]').fill('100');
  await page.locator('[data-cy="taxNameByAmount2"]').fill('tax_name_2');
  await page.locator('[data-cy="taxRateByAmount2"]').fill('200');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring expense', { exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await expect(page.getByText('$ 12,522.00')).toBeVisible();

  await logout(page);
});
