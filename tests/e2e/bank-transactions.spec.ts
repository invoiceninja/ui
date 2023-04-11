import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';

const createBankTransaction = async (page: Page) => {
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Transaction' })
    .click();

  await page.waitForTimeout(500);

  await page.locator('[type="text"]').nth(0).fill('100');

  await page.locator('[role="combobox"]').first().click();

  await page.locator('[data-cy="dc-0"]').first().click();

  await page
    .locator('[type="text"]')
    .last()
    .fill('Transaction Testing Description');

  await page.getByRole('button', { name: 'Save' }).click();
};

test.skip("can't view bank transactions without permission", async ({
  page,
}) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await save();
  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Transactions'
  );
});

test.skip('can view bank transaction', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('view_bank_transaction');
  await save();
  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  await page.getByRole('link', { name: 'Transactions', exact: true }).click();

  await page.waitForURL('**/transactions');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (doRecordsExist) {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.waitForTimeout(200);

    await page
      .getByRole('link')
      .filter({ has: page.getByText('Edit') })
      .first()
      .click();

    await expect(
      page
        .getByRole('heading', {
          name: 'Edit Transaction',
          exact: true,
        })
        .first()
    ).toBeVisible();
  } else {
    await expect(
      page.getByRole('heading', {
        name: "Sorry, you don't have the needed permissions.",
      })
    ).not.toBeVisible();

    await expect(page.getByText('No records found')).toBeVisible();
  }
});

test.skip("can't create a bank transaction", async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('view_bank_transaction');
  await save();
  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  await page.getByRole('link', { name: 'Transactions', exact: true }).click();
  await page.getByText('New Transaction').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).toBeVisible();
});

test.skip('can create a bank transaction', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('create_bank_transaction');
  await save();
  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  await page.getByRole('link', { name: 'Transactions', exact: true }).click();
  await page.getByText('New Transaction').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test.skip('can view assigned bank_transaction with create_bank_transaction', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('create_bank_transaction');
  await save();
  await logout(page);

  await login(page, 'bank_transactions@example.com', 'password');

  await page.getByRole('link', { name: 'Transactions' }).click();

  await createBankTransaction(page);

  await expect(
    page.getByRole('heading', { name: 'Edit Transaction' }).first()
  ).toBeVisible();
});

test.skip('deleting bank transaction', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('create_bank_transaction');
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
    await createBankTransaction(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();
  }

  await expect(
    page.getByText('Successfully deleted transaction')
  ).toBeVisible();
});

test.skip('archiving bank transaction', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('bank_transactions@example.com');
  await set('create_bank_transaction');
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
    await createBankTransaction(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();
  }

  await expect(
    page.getByText('Successfully archived transaction')
  ).toBeVisible();
});
