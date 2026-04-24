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
  ).not.toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText('Account Management', { exact: true }).first()
  ).not.toBeVisible({ timeout: 10000 });
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
  await page.waitForTimeout(400);


  await page
    .locator('[type="date"]')
  .nth(1)
    .first()
    .fill(dayjs().add(14, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').nth(1).first().blur();

  await page.waitForTimeout(400);

  await page.locator('[data-cy="quickPopoverButton"]').click();
  await page.waitForTimeout(400);

  await page.getByText('Transaction', { exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="quickPopoverButton"]').click();

  await page.getByText('Transaction', { exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await page.waitForURL('**/transactions/create');

  await logout(page);
});

test('Prevent quote quick popover navigation', async ({ page }) => {
  test.setTimeout(60000); 
  await login(page);

  await createInvoice({ page });

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  // Wait for debounce (300ms) + React re-render to detect the change as unsaved
  await page.waitForTimeout(400);

  await page.locator('[data-cy="quickPopoverButton"]').click();
  await page.waitForTimeout(400);

  await page.getByText('Quote', { exact: true }).click();
  await page.waitForTimeout(400);

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="quickPopoverButton"]').click();

  await page.getByText('Quote', { exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible({ timeout: 10000 });

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
  await page.waitForTimeout(400);

  await page.goBack();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible({ timeout: 10000 });

  await page.goBack();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await page.waitForURL('**/invoices/create');

  await logout(page);
});

test('Prevent account management navigation', async ({ page }) => {
  test.setTimeout(60000); 
  await login(page);

  await createInvoice({ page });

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  // Wait for debounce (300ms) + React re-render to detect the change as unsaved
  await page.waitForTimeout(400);

  await page.locator('[data-cy="companyDropdown"]').click();

  await page.getByText('Account Management', { exact: true }).first().click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="companyDropdown"]').click();

  await page.getByText('Account Management', { exact: true }).first().click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await page.waitForURL('**/settings/account_management');

  await expect(
    page.getByRole('heading', {
      name: 'Account Management',
    }).first()
  ).toBeVisible({ timeout: 10000 });

  await logout(page);
});

// This test must be LAST in the file because it creates a new company
// which changes the active company context for the user session.
test('Can add a company and navigate to account management', async ({
  page,
}) => {
  test.setTimeout(60000); 
  // Must use the owner user — only owners can add companies
  await login(page);

  await page.locator('[data-cy="companyDropdown"]').click();

  await page.getByText('Add Company', { exact: true }).first().click();

  await expect(
    page.getByRole('heading', {
      name: 'Add Company',
    })
  ).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('button')
    .filter({ has: page.getByText('Yes') })
    .first()
    .click();

  await expect(
    page.getByRole('heading', {
      name: 'Welcome to Invoice Ninja',
    })
  ).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('button')
    .filter({ has: page.getByText('Save') })
    .first()
    .click();

  await expect(
    page.getByRole('heading', {
      name: 'Welcome to Invoice Ninja',
    })
  ).not.toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="companyDropdown"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('[data-cy="companyDropdown"]').click();

  await page.getByText('Account Management', { exact: true }).first().click();

  await page.waitForURL('**/settings/account_management');

  await expect( 
    page.getByRole('heading', {
      name: 'Account Management',
    }).first()
  ).toBeVisible({ timeout: 10000 });

  await page.getByRole('link', { name: 'Danger Zone' }).click();
  await page.getByText('Delete Company').click();

  const deleteField = page.getByRole('textbox', { name: 'Please type "delete" to' });
  await deleteField.fill('delete');
  await deleteField.blur();
  await deleteField.press('Tab');

  await page.getByRole('textbox', { name: 'Password*' }).click();
  await page.getByRole('textbox', { name: 'Password*' }).fill('password');

  await deleteField.click();

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  await page.locator('input[name="email"]').click();
  await page.getByRole('button', { name: 'Login' }).click();
});
