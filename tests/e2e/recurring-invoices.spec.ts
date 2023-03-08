import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test.skip("can't view recurring invoices without permission", async ({
  page,
}) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Recurring Invoices'
  );
});

test.skip('can view recurring invoices', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page.waitForURL('**/recurring_invoices');

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test.skip("can't create a recurring invoice", async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();
  await page.getByText('New Recurring Invoice').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).toBeVisible();
});

test.skip('can create a recurring invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();
  await page.getByText('New Recurring Invoice').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test.skip('can view assigned recurring invoice with create_recurring_invoice', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Recurring Invoices' }).click();
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Recurring Invoice' })
    .click();
  await page.getByRole('option', { name: 'cypress' }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByRole('heading', { name: 'Edit Recurring Invoice' })
  ).toBeVisible();
});
