import { login, logout, permissions } from '$tests/e2e/helpers';
import { createInvoice } from '$tests/helpers/invoice';
import { test, expect } from '$tests/e2e/fixtures';
import dayjs from 'dayjs';

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
    page.getByText('Add Company', { exact: true }).first()
  ).not.toBeVisible();

  await expect(
    page.getByText('Account Management', { exact: true }).first()
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

  // Wait for debounce (300ms) + React re-render to detect the change as unsaved
  await page.waitForTimeout(1000);

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

  // Wait for debounce (300ms) + React re-render to detect the change as unsaved
  await page.waitForTimeout(1000);

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

  // Wait for debounce (300ms) + React re-render to detect the change as unsaved
  await page.waitForTimeout(1000);

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

test('Prevent account management navigation', async ({ page }) => {
  await login(page);

  await createInvoice({ page });

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  // Wait for debounce (300ms) + React re-render to detect the change as unsaved
  await page.waitForTimeout(1000);

  await page.locator('[data-cy="companyDropdown"]').click();

  await page.getByText('Account Management', { exact: true }).first().click();

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

  await page.getByText('Account Management', { exact: true }).first().click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await page.waitForURL('**/settings/account_management');

  await expect(
    page.getByRole('heading', {
      name: 'Account Management',
    }).first()
  ).toBeVisible();

  await logout(page);
});

// This test must be LAST in the file because it creates a new company
// which changes the active company context for the user session.
test('Can add a company and navigate to account management', async ({
  page,
}) => {
  // Must use the owner user — only owners can add companies
  await login(page);

  await page.locator('[data-cy="companyDropdown"]').click();

  await page.getByText('Add Company', { exact: true }).first().click();

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

  await page.getByText('Account Management', { exact: true }).first().click();

  await page.waitForURL('**/settings/account_management');

  await expect(
    page.getByRole('heading', {
      name: 'Account Management',
    }).first()
  ).toBeVisible();
});
