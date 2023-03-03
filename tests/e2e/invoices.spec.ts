import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test("can't view invoices without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Invoices'
  );
});

test('can view invoices', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  await page.waitForURL('**/invoices');

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test("can't create an invoice", async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();
  await page.getByRole('link', { name: 'New Invoice', exact: true }).click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).toBeVisible();
});

test.only('can create an invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();
  await page.getByText('New Invoice').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});
