import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

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
