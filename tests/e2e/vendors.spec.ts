import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test("can't view vendors without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Vendors'
  );
});

test('can view vendors', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_vendor');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Vendors', exact: true }).click();

  await page.waitForURL('**/vendors');

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

// test("can't create a vendor", async ({ page }) => {
//   const { clear, save, set } = permissions(page);

//   await login(page);
//   await clear();
//   await set('view_vendor');
//   await save();
//   await logout(page);

//   await login(page, 'permissions@example.com', 'password');

//   await page.getByRole('link', { name: 'Vendors', exact: true }).click();
//   await page.getByText('New Vendor').click();

//   await expect(
//     page.getByRole('heading', {
//       name: "Sorry, you don't have the needed permissions.",
//     })
//   ).toBeVisible();
// });

test('can create a vendor', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_vendor');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Vendors', exact: true }).click();
  await page.getByText('New Vendor').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test('can view assigned vendor with create_vendor', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_vendor');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Vendors' }).click();
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Vendor' })
    .click();

  await page.locator('[type="text"]').first().fill('Test Vendor Name');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByRole('heading', { name: 'Edit Vendor' })
  ).toBeVisible();
});
