import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test.skip("can't view products without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Products'
  );
});

test.skip('can view product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_product');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await page.waitForURL('**/products');

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test.skip("can't create a product", async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_product');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Products', exact: true }).click();
  await page.getByText('New Product').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).toBeVisible();
});

test.skip('can create a product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_product');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Products', exact: true }).click();
  await page.getByText('New Product').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test.skip('can view assigned product with create_product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_product');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Products' }).click();
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Product' })
    .click();

  await page.locator('[type="text"]').first().fill('Product Name');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByRole('heading', { name: 'Edit Product' }).first()
  ).toBeVisible();
});
