import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test("can't view purchase orders without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Purchase Orders'
  );
});

test('can view purchase orders', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_purchase_order');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  await page.waitForURL('**/purchase_orders');

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test("can't create a purchase orders", async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_purchase_order');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();
  await page.getByText('New Purchase Order').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).toBeVisible();
});

test('can create a purchase order', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_purchase_order');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();
  await page.getByText('New Purchase Orders').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test.skip('can view assigned purchase order with create_purchase_order', async ({
  page,
}) => {
  //Blocker vendor

  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_purchase_order');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Purchase Orders' }).click();
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Purchase Orders' })
    .click();
  await page.getByRole('option', { name: 'test vendor' }).click();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByRole('heading', { name: 'Edit Purchase Order' })
  ).toBeVisible();
});
