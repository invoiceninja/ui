import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test("can't view bank transactions without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Transactions'
  );
});

test('can view bank transactions', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_bank_transaction');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Transactions', exact: true }).click();

  await page.waitForURL('**/transactions');

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test('can create a bank transaction', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_bank_transaction');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

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
  //Blocker bank account

  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_bank_transaction');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Transactions' }).click();
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Transaction' })
    .click();
  await page.getByRole('option', { name: 'cypress' }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByRole('heading', { name: 'Edit Transaction' })
  ).toBeVisible();
});
