import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test.skip("can't view payments without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Payments'
  );
});

test.skip('can view payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Payments', exact: true }).click();

  await page.waitForURL('**/payments');

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test.skip("can't create a payment", async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Payments', exact: true }).click();
  await page.getByText('Enter Payment').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).toBeVisible();
});

test.skip('can create a payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Payments', exact: true }).click();
  await page.getByText('Enter Payment').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test.skip('can view assigned payment with create_payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Payments' }).click();
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Payment' })
    .click();

  await page.locator('#headlessui-combobox-input-\\:rg\\:').click();
  await page.getByRole('option', { name: 'cypress' }).click();

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByRole('heading', { name: 'Edit Payment' }).first()
  ).toBeVisible();
});
