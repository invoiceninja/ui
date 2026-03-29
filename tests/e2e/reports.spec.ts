import { login, logout } from '$tests/e2e/helpers';
import { test, expect } from '$tests/e2e/fixtures';

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

  // The report selector is a React Select (customSelector)
  // Click the dropdown indicator to open the menu
  const reportElement = page.locator('dt').filter({ hasText: 'Report' }).locator('..');
  await reportElement.locator('svg').last().click();
  // Select "Expense" from the dropdown menu
  const expenseOption = page.getByText('Expense', { exact: true });
  await expenseOption.waitFor({ state: 'visible', timeout: 5000 });
  await expenseOption.click();

  await page.waitForTimeout(300);

  await expect(page.locator('#clientItemSelector')).toBeVisible();

  await expect(page.locator('#vendorItemSelector')).toBeVisible();

  await expect(page.locator('#projectItemSelector')).toBeVisible();

  await expect(page.locator('#expenseCategoryItemSelector')).toBeVisible();

  await logout(page);
});
