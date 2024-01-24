import {
  checkTableEditability,
  login,
  logout,
  permissions,
} from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';

interface CreateParams {
  page: Page;
  isTableEditable?: boolean;
  withNavigation?: boolean;
}
const createBankTransaction = async (params: CreateParams) => {
  const { page, withNavigation = true, isTableEditable = true } = params;

  if (withNavigation) {
    await page
      .locator('[data-cy="navigationBar"]')
      .getByRole('link', { name: 'Transactions', exact: true })
      .click();

    await checkTableEditability(page, isTableEditable);
  }

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Transaction' })
    .click();

  await page.getByRole('main').locator('[type="text"]').nth(0).fill('100');

  await page.getByTestId('combobox-input-field').first().click();
  await page.waitForTimeout(200);
  await page.getByRole('main').locator('[role="option"]').first().click();

  await page
    .getByRole('main')
    .locator('[type="text"]')
    .nth(1)
    .fill('Transaction Notes');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created transaction', { exact: true })
  ).toBeVisible();
};

const checkEditPage = async (page: Page, isEditable: boolean) => {
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

test('can view transaction', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('view_bank_transaction');
  await save();

  await createBankTransaction({ page });

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

test('can edit transaction', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('edit_bank_transaction');
  await save();

  await createBankTransaction({ page });

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
  ).toBeVisible();

  await logout(page);
});

test('can create a transaction', async ({ page }) => {
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

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated transaction', { exact: true })
  ).toBeVisible();

  await logout(page);
});

test('deleting transaction with edit_bank_transaction', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('create_bank_transaction', 'edit_bank_transaction');
  await save();
  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Transactions', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/transactions');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createBankTransaction({ page, withNavigation: false });

    await page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByText('Delete').click();

    await expect(
      page.getByText('Successfully deleted transaction')
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .click();

    await page.getByText('Delete').click();

    await expect(
      page.getByText('Successfully deleted transaction')
    ).toBeVisible();
  }
});

test('archiving transaction withe edit_bank_transaction', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('create_bank_transaction', 'edit_bank_transaction');
  await save();
  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Transactions', exact: true }).click();

  await page.waitForURL('**/transactions');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createBankTransaction({ page, withNavigation: false });

    await page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByText('Archive').click();

    await expect(
      page.getByText('Successfully archived transaction')
    ).toBeVisible();

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

    await expect(
      page.getByText('Successfully archived transaction')
    ).toBeVisible();
  }
});
