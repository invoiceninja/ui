import {
  checkTableEditability,
  login,
  logout,
  permissions,
} from '$tests/e2e/helpers';
import { test, expect, uniqueName, extractIdFromUrl } from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';
import { createExpenseCategory } from './expense-categories-helpers';
import { createVendor } from './vendor-helpers';
import { createApiContext, createEntityViaApi, type ApiContext } from './api-helpers';

async function ensureBankAccountExists(apiContext?: ApiContext): Promise<void> {
  const api = apiContext || await createApiContext(process.env.VITE_API_URL!);
  const { request } = await import('@playwright/test');
  const ctx = await request.newContext({ baseURL: api.baseUrl });

  const response = await ctx.get('/api/v1/bank_integrations?per_page=1', {
    headers: api.headers,
  });
  const body = await response.json();
  await ctx.dispose();

  if (body.data?.length > 0) return;

  // Create a bank account
  const createCtx = await request.newContext({ baseURL: api.baseUrl });
  await createCtx.post('/api/v1/bank_integrations', {
    headers: api.headers,
    data: {
      bank_account_name: 'Test Bank Account',
      provider_name: 'Test Provider',
      bank_account_number: '123456789',
      bank_account_type: 'checking',
    },
  });
  await createCtx.dispose();
}

interface CreateParams {
  page: Page;
  isTableEditable?: boolean;
  withNavigation?: boolean;
  type?: 'withdrawal';
}
const createBankTransaction = async (params: CreateParams) => {
  const { page, withNavigation = true, isTableEditable = true, type } = params;

  // Ensure at least one bank account exists for the combobox
  await ensureBankAccountExists();

  if (withNavigation) {
    const transactionsLink = page
      .locator('[data-cy="navigationBar"]')
      .getByRole('link', { name: 'Transactions', exact: true });

    await transactionsLink.waitFor({ state: 'visible', timeout: 5000 });
    await transactionsLink.click();

    await checkTableEditability(page, isTableEditable);
  }

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Transaction' })
    .click();

  if (type === 'withdrawal') {
    await page.locator('div').filter({ hasText: /^Deposit$/ }).nth(2).click();
    await page.getByRole('option', { name: 'Withdrawal' }).click();
  }

  await page.getByRole('main').locator('[type="text"]').nth(0).fill('100');

  // Select bank account from combobox
  await page.getByTestId('combobox-input-field').first().click();
  const bankOption = page.getByRole('main').locator('[role="option"]').first();
  await bankOption.waitFor({ state: 'visible', timeout: 5000 });
  await bankOption.click();

  await page
    .getByRole('main')
    .locator('[type="text"]')
    .nth(1)
    .fill('Transaction Notes');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created transaction', { exact: true })
  ).toBeVisible({ timeout: 10000 });
};

const checkEditPage = async (page: Page, isEditable: boolean) => {
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

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test("can't view transactions without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await save();
  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Transactions'
  );

  await logout(page);
});

test('can view transaction', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('view_bank_transaction');
  await save();

  await createBankTransaction({ page });

  await page.waitForURL('**/transactions/**/edit');

  const txId = extractIdFromUrl(page.url(), 'transactions');
  if (txId) api.trackEntity('bank_transactions', txId);

  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Transactions', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page.getByRole('row').nth(1).getByRole('link').first().click();

  await checkEditPage(page, false);

  await logout(page);
});

test('can edit transaction', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('edit_bank_transaction');
  await save();

  await createBankTransaction({ page });

  await page.waitForURL('**/transactions/**/edit');

  const txId = extractIdFromUrl(page.url(), 'transactions');
  if (txId) api.trackEntity('bank_transactions', txId);

  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Transactions', exact: true })
    .click();

  await checkTableEditability(page, true);

  console.log(await page.getByRole('row').nth(1).textContent());

  await page.getByRole('row').nth(1).getByRole('link').first().click();

  await page.waitForURL('**/transactions/**/edit');

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated transaction', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await logout(page);
});

test('can create a transaction', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('create_bank_transaction');
  await save();
  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  await createBankTransaction({
    page,
    isTableEditable: false,
  });

  await page.waitForURL('**/transactions/**/edit');

  const txId = extractIdFromUrl(page.url(), 'transactions');
  if (txId) api.trackEntity('bank_transactions', txId);

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated transaction', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await logout(page);
});

// @todothis test is broken because the toast shows successfully deleted invoice
// test('deleting transaction with edit_bank_transaction', async ({ page, api }) => {
//   const { clear, save, set } = permissions(page);

//   await login(page);
//   await clear('bank_transactions@example.com');
//   await set('create_bank_transaction', 'edit_bank_transaction');
//   await save();
//   await logout(page);

//   await login(page, 'bank_transactions@example.com', 'password');

//   const tableBody = page.locator('tbody').first();

//   await page.getByRole('link', { name: 'Transactions', exact: true }).click();

//   const tableRow = tableBody.getByRole('row').first();

//   await page.waitForURL('**/transactions');

//   await page.waitForTimeout(200);

//   const doRecordsExist = await page.getByText('No records found').isHidden();

//   if (!doRecordsExist) {
//     await createBankTransaction({ page, withNavigation: false });

//     await page.waitForURL('**/transactions/**/edit');

//     const txId = extractIdFromUrl(page.url(), 'transactions');
//     if (txId) api.trackEntity('bank_transactions', txId);

//     await page.locator('[data-cy="chevronDownButton"]').first().click();

//     await page.getByText('Delete').click();

//     await expect(
//       page.getByText('Successfully deleted transaction')
//     ).toBeVisible({ timeout: 10000 });

//     await expect(
//       page.getByRole('button', { name: 'Restore', exact: true })
//     ).toBeVisible({ timeout: 10000 });
//   } else {
//     await tableRow
//       .getByRole('button')
//       .filter({ has: page.getByText('Actions') })
//       .click();

//     await page.getByText('Delete').click();

//     await expect(
//       page.getByText('Successfully deleted transaction')
//     ).toBeVisible({ timeout: 10000 });
//   }

//   await logout(page);
// });

//@todo wrong toast string!
// test('archiving transaction withe edit_bank_transaction', async ({ page, api }) => {
//   const { clear, save, set } = permissions(page);

//   await login(page);
//   await clear('bank_transactions@example.com');
//   await set('create_bank_transaction', 'edit_bank_transaction');
//   await save();
//   await logout(page);

//   await login(page, 'bank_transactions@example.com', 'password');

//   const tableBody = page.locator('tbody').first();

//   await page.getByRole('link', { name: 'Transactions', exact: true }).click();

//   await page.waitForURL('**/transactions');

//   const tableRow = tableBody.getByRole('row').first();

//   await page.waitForTimeout(200);

//   const doRecordsExist = await page.getByText('No records found').isHidden();

//   if (!doRecordsExist) {
//     await createBankTransaction({ page, withNavigation: false });

//     await page.waitForURL('**/transactions/**/edit');

//     const txId = extractIdFromUrl(page.url(), 'transactions');
//     if (txId) api.trackEntity('bank_transactions', txId);

//     await page.locator('[data-cy="chevronDownButton"]').first().click();

//     await page.getByText('Archive').click();

//     await expect(
//       page.getByText('Successfully archived transaction')
//     ).toBeVisible({ timeout: 10000 });

//     await expect(
//       page.getByRole('button', { name: 'Restore', exact: true })
//     ).toBeVisible({ timeout: 10000 });
//   } else {
//     await tableRow
//       .getByRole('button')
//       .filter({ has: page.getByText('Actions') })
//       .first()
//       .click();

//     await page.getByText('Archive').click();

//     await expect(
//       page.getByText('Successfully archived transaction')
//     ).toBeVisible({ timeout: 10000 });
//   }

//   await logout(page);
// });

test('Create expense bulk action', async ({ page, api }) => {
  await login(page);

  const vendorName = uniqueName('vendor');
  const categoryName = uniqueName('expcat');

  await createVendor({ page, name: vendorName });

  await page.waitForURL('**/vendors/**');

  const vendorId = extractIdFromUrl(page.url(), 'vendors');
  if (vendorId) api.trackEntity('vendors', vendorId);

  await createExpenseCategory({ page, categoryName });

  await page.waitForURL('**/expense_categories/**/edit');

  const expCatId = extractIdFromUrl(page.url(), 'expense_categories');
  if (expCatId) api.trackEntity('expense_categories', expCatId);

  await createBankTransaction({ page, type: 'withdrawal' });

  await page.waitForURL('**/transactions/**/edit');

  const tx1Id = extractIdFromUrl(page.url(), 'transactions');
  if (tx1Id) api.trackEntity('bank_transactions', tx1Id);

  await createBankTransaction({ page, type: 'withdrawal' });

  await page.waitForURL('**/transactions/**/edit');

  const tx2Id = extractIdFromUrl(page.url(), 'transactions');
  if (tx2Id) api.trackEntity('bank_transactions', tx2Id);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Transactions', exact: true })
    .click();

  await page.waitForTimeout(200);

  const numberOfCheckBoxes = (
    await page.locator('[data-cy="dataTableCheckbox"]').all()
  ).length;

  await page
    .locator('[data-cy="dataTableCheckbox"]')
    .nth(numberOfCheckBoxes - 2)
    .click();
  await page.locator('[data-cy="dataTableCheckbox"]').last().click();

  await page
    .getByRole('button', { name: 'Actions', exact: true })
    .first()
    .click();

  await page
    .getByRole('button', { name: 'Create Expense', exact: true })
    .click();

  await expect(
    page.getByRole('heading', { name: 'Create Expense' })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('button', { name: 'Create Expense', exact: true })
  ).toBeDisabled();

  await page.getByTestId('combobox-input-field').first().click();

  await page
    .getByTestId('combobox-input-field')
    .first()
    .fill(vendorName);

  await page.waitForTimeout(200);

  await page.getByText(vendorName).first().click();

  await page.getByTestId('combobox-input-field').last().click();

  await page
    .getByTestId('combobox-input-field')
    .last()
    .fill(categoryName);

  await page.waitForTimeout(200);

  await page.getByText(categoryName).first().click();

  await expect(
    page.getByRole('button', { name: 'Create Expense', exact: true })
  ).not.toBeDisabled();

  await page
    .getByRole('button', { name: 'Create Expense', exact: true })
    .click();

  await expect(
    page.getByText('Successfully converted transaction')
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: 'Create Expense' })
  ).not.toBeVisible({ timeout: 10000 });

  await expect(page.getByRole('row').last()).toContainText('Converted');
  await expect(page.getByRole('row').nth(numberOfCheckBoxes - 1)).toContainText(
    'Converted'
  );

  await logout(page);
});
