import { login, logout } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test('Expense report (clients, vendors, project, expense_categories) fields are not visible', async ({
  page,
}) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  await expect(page.locator('#clientItemSelector')).not.toBeVisible();

  await expect(page.locator('#vendorItemSelector')).not.toBeVisible();

  await expect(page.locator('#projectItemSelector')).not.toBeVisible();

  await expect(page.locator('#expenseCategoryItemSelector')).not.toBeVisible();

  await logout(page);
});

test('Expense report (clients, vendors, project, expense_categories) fields are visible', async ({
  page,
}) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  await page
    .locator('[data-cy="reportNameSelector"]')
    .selectOption({ label: 'Expense' });

  await page.waitForTimeout(300);

  await expect(page.locator('#clientItemSelector')).toBeVisible();

  await expect(page.locator('#vendorItemSelector')).toBeVisible();

  await expect(page.locator('#projectItemSelector')).toBeVisible();

  await expect(page.locator('#expenseCategoryItemSelector')).toBeVisible();

  await logout(page);
});
