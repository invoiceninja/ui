import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';
import { chromium } from '@playwright/test';

test.beforeAll(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_all');
  await save();
  await logout(page);
});

test.beforeEach(
  async ({ page }) => await login(page, 'permissions@example.com', 'password')
);

test('can create a client', async ({ page }) => {
  await page.getByRole('link', { name: 'Clients', exact: true }).click();
  await page.getByText('New Client').click();

  await expect(page.getByRole('heading', { name: 'New Client' })).toBeVisible();
});

test('can create a product', async ({ page }) => {
  await page.getByRole('link', { name: 'Products', exact: true }).click();
  await page.getByText('New Product').click();

  await expect(
    page.getByRole('heading', { name: 'New Product' }).first()
  ).toBeVisible();
});

test('can create an invoice', async ({ page }) => {
  await page.getByRole('link', { name: 'Invoices', exact: true }).click();
  await page.getByText('New Invoice').click();

  await expect(
    page.getByRole('heading', { name: 'New Invoice' })
  ).toBeVisible();
});

test('can create a recurring invoice', async ({ page }) => {
  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();
  await page.getByText('New Recurring Invoice').click();

  await expect(
    page.getByRole('heading', { name: 'New Recurring Invoice' })
  ).toBeVisible();
});

test('can create a payment', async ({ page }) => {
  await page.getByRole('link', { name: 'Payments', exact: true }).click();
  await page.getByText('Enter Payment').click();

  await expect(
    page.getByRole('heading', { name: 'Enter Payment' })
  ).toBeVisible();
});

test('can create a quote', async ({ page }) => {
  await page.getByRole('link', { name: 'Quotes', exact: true }).click();
  await page.getByText('New Quote').click();

  await expect(page.getByRole('heading', { name: 'New Quote' })).toBeVisible();
});

test('can create a credit', async ({ page }) => {
  await page.getByRole('link', { name: 'Credits', exact: true }).click();
  await page.getByText('Enter Credit').click();

  await expect(
    page.getByRole('heading', { name: 'Enter Credit' })
  ).toBeVisible();
});

test('can create a project', async ({ page }) => {
  await page.getByRole('link', { name: 'Projects', exact: true }).click();
  await page.getByText('New Project').click();

  await expect(
    page.getByRole('heading', { name: 'New Project' }).first()
  ).toBeVisible();
});

test('can create a task', async ({ page }) => {
  await page.getByRole('link', { name: 'Tasks', exact: true }).click();
  await page.getByText('New Task').click();

  await expect(page.getByRole('heading', { name: 'New Task' })).toBeVisible();
});

test('can create a vendor', async ({ page }) => {
  await page.getByRole('link', { name: 'Vendors', exact: true }).click();
  await page.getByText('New Vendor').click();

  await expect(page.getByRole('heading', { name: 'Details' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible();
});

test('can create a purchase order', async ({ page }) => {
  await page
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();
  await page.getByText('New Purchase Order').click();

  await expect(
    page.getByRole('heading', { name: 'New Purchase Order' })
  ).toBeVisible();
});

test('can create an expense', async ({ page }) => {
  await page.getByRole('link', { name: 'Expenses', exact: true }).click();
  await page.getByText('Enter Expense').click();

  await expect(page.getByRole('heading', { name: 'Details' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notes' })).toBeVisible();
});

test('can create a recurring expense', async ({ page }) => {
  await page
    .getByRole('link', { name: 'Recurring Expenses', exact: true })
    .click();
  await page.getByText('New Recurring Expense').click();

  await expect(page.getByRole('heading', { name: 'Details' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notes' })).toBeVisible();
});

test('can create a bank transaction', async ({ page }) => {
  await page.getByRole('link', { name: 'Transactions', exact: true }).click();
  await page.getByText('New Transaction').click();

  await expect(
    page.getByRole('heading', { name: 'New Transaction' }).first()
  ).toBeVisible();
});
