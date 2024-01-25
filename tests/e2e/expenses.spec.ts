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
import { createExpenseCategory } from './expense-categories-helpers';

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
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'More Actions', exact: true })
    ).toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).not.toBeVisible();

    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'More Actions', exact: true })
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

test('can view expense', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('expenses@example.com');
  await set('view_expense');
  await save();

  await createExpense({ page });

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

test('can edit expense', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useExpensesActions({
    permissions: ['edit_expense'],
  });

  await login(page);
  await clear('expenses@example.com');
  await set('edit_expense');
  await save();

  await createExpense({ page });

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

  await checkDropdownActions(page, actions, 'expenseActionDropdown');

  await logout(page);
});

test('can create a expense', async ({ page }) => {
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

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated expense', { exact: true })
  ).toBeVisible();

  await checkDropdownActions(page, actions, 'expenseActionDropdown');

  await logout(page);
});

test('can view and edit assigned expense with create_expense', async ({
  page,
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

  await checkDropdownActions(page, actions, 'expenseActionDropdown');

  await logout(page);
});

test('deleting expense with edit_expense', async ({ page }) => {
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

    await page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'More Actions', exact: true })
      .first()
      .click();

    await page.getByText('Delete').click();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByText('Delete').click();
  }

  await expect(page.getByText('Successfully deleted expense')).toBeVisible();
});

test('archiving expense with edit_expense', async ({ page }) => {
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

    await page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'More Actions', exact: true })
      .first()
      .click();

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

  await expect(page.getByText('Successfully archived expense')).toBeVisible();
});

test('expense documents preview with edit_expense', async ({ page }) => {
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
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/expenses/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await page.waitForURL('**/expenses/**/documents');

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('expense documents uploading with edit_expense', async ({ page }) => {
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
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/expenses/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
      exact: true,
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

  await checkEditPage(page, true);

  await checkDropdownActions(page, actions, 'expenseActionDropdown');

  await logout(page);
});

test('all clone actions displayed with creation permissions', async ({
  page,
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

  await checkEditPage(page, true);

  await checkDropdownActions(page, actions, 'expenseActionDropdown');

  await logout(page);
});

test('cloning expense', async ({ page }) => {
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

    await page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'More Actions', exact: true })
      .first()
      .click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByText('Clone').first().click();

  await page.waitForURL('**/expenses/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  await page.waitForURL('**/expenses/**/edit');

  await expect(
    page.getByRole('heading', { name: 'Edit Expense' }).first()
  ).toBeVisible();
});

test('Expense categories endpoint contains sort but not with parameter', async ({
  page,
}) => {
  await login(page);

  await createExpenseCategory({
    page,
    categoryName: 'testing expense category 1',
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
    .getByRole('option', { name: 'testing expense category 1' })
    .first()
    .click();

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  await page.waitForURL('**/expenses/**/edit');

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
}) => {
  await login(page);

  await createExpenseCategory({
    page,
    categoryName: 'testing expense category 2',
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
    .fill('testing expense category 2');

  await page.waitForTimeout(300);

  await page
    .getByRole('option', { name: 'testing expense category 2' })
    .first()
    .click();

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created expense')).toBeVisible();

  await page.waitForURL('**/expenses/**/edit');

  await page.reload();

  await page.route('**/api/v1/expense_categories?status=active**', (route) => {
    expect(route.request().url()).not.toContain('sort=name');
    expect(route.request().url()).toContain('with=');

    route.continue();
  });

  await logout(page);
});
