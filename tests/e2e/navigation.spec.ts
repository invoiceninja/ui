import { login, logout, permissions } from '$tests/e2e/helpers';
import { createInvoice } from '$tests/helpers/invoice';
import test, { expect } from '@playwright/test';
import dayjs from 'dayjs';

test('Can add a company and navigate to account management', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.locator('[data-cy="companyDropdown"]').click();

  await page
    .getByRole('button')
    .filter({ has: page.getByText('Add Company') })
    .first()
    .click();

  await expect(
    page.getByRole('heading', {
      name: 'Add Company',
    })
  ).toBeVisible();

  await page
    .getByRole('button')
    .filter({ has: page.getByText('Yes') })
    .first()
    .click();

  await expect(
    page.getByRole('heading', {
      name: 'Welcome to Invoice Ninja',
    })
  ).toBeVisible();

  await page
    .getByRole('button')
    .filter({ has: page.getByText('Save') })
    .first()
    .click();

  await expect(
    page.getByRole('heading', {
      name: 'Welcome to Invoice Ninja',
    })
  ).not.toBeVisible();

  await page.waitForTimeout(300);

  await page.locator('[data-cy="companyDropdown"]').click();

  await page
    .getByRole('link')
    .filter({ has: page.getByText('Account Management') })
    .first()
    .click();

  await page.waitForURL('/settings/account_management');

  await expect(
    page.getByRole('heading', {
      name: 'Account Management',
    })
  ).toBeVisible();
});

test('Can not add a company and navigate to account management', async ({
  page,
}) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.locator('[data-cy="companyDropdown"]').click();

  await expect(
    page
      .getByRole('button')
      .filter({ has: page.getByText('Add Company') })
      .first()
  ).not.toBeVisible();

  await expect(
    page
      .getByRole('link')
      .filter({ has: page.getByText('Account Management') })
      .first()
  ).not.toBeVisible();
});

test('Prevent transaction quick popover navigation', async ({ page }) => {
  await login(page);

  await createInvoice({ page });

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  await page.locator('[data-cy="quickPopoverButton"]').click();

  await page.getByText('Transaction', { exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible();

  await page.locator('[data-cy="quickPopoverButton"]').click();

  await page.getByText('Transaction', { exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await page.waitForURL('**/transactions/create');

  await logout(page);
});

test('Prevent quote quick popover navigation', async ({ page }) => {
  await login(page);

  await createInvoice({ page });

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  await page.locator('[data-cy="quickPopoverButton"]').click();

  await page.getByText('Quote', { exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible();

  await page.locator('[data-cy="quickPopoverButton"]').click();

  await page.getByText('Quote', { exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await page.waitForURL('**/quotes/create');

  await logout(page);
});

test('Prevent back browser button navigation', async ({ page }) => {
  await login(page);

  await createInvoice({ page });

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  await page.waitForTimeout(500);

  await page.goBack();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible();

  await page.goBack();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await page.waitForURL('**/invoices/create');

  await logout(page);
});

test('Prevent adding new company', async ({ page }) => {
  await login(page);

  await createInvoice({ page });

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  await page.locator('[data-cy="companyDropdown"]').click();

  await page
    .getByRole('button')
    .filter({ has: page.getByText('Add Company') })
    .first()
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible();

  await page.locator('[data-cy="companyDropdown"]').click();

  await page
    .getByRole('button')
    .filter({ has: page.getByText('Add Company') })
    .first()
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await expect(
    page.getByRole('heading', {
      name: 'Add Company',
    })
  ).toBeVisible();

  await expect(
    page.getByRole('button', {
      name: 'Yes',
      exact: true,
    })
  ).toBeVisible();

  await logout(page);
});
