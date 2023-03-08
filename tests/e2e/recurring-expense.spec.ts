import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test.skip("can't view recurring expenses without permission", async ({
  page,
}) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Recurring Expenses'
  );
});

test.skip('can view recurring expenses', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();

  await page.waitForURL('**/recurring_expenses');

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test.skip("can't create a recurring expense", async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();
  await page.getByText('New Recurring Expense').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).toBeVisible();
});

test.skip('can create a recurring expense', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();
  await page.getByText('New Recurring Expense').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test.skip('can view assigned recurring expense with create_recurring_expense', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_expense');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Recurring Expenses' }).click();
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Recurring Expense' })
    .click();

  await page.waitForTimeout(200);

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created recurring expense')
  ).toBeVisible();
});
