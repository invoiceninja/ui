import { Page } from '@playwright/test';
import { expect } from '@playwright/test';

interface ExpenseCategoryCreateParams {
  page: Page;
  categoryName: string;
}
export const createExpenseCategory = async (
  params: ExpenseCategoryCreateParams
) => {
  const { page, categoryName } = params;

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Expense Settings', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Expense Category' })
    .click();

  await page.waitForURL('**/expense_categories/create');

  const nameField = page.locator('[data-cy="expenseCategoryNameField"]');
  await nameField.waitFor({ state: 'visible' });

  // Wait for the blank expense category API call to complete and React to process it
  // before typing, otherwise the useEffect overwrites the name mid-typing
  await page.waitForTimeout(1500);

  await nameField.clear();
  await nameField.pressSequentially(categoryName, { delay: 50 });

  await page.waitForTimeout(500);

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByText('Successfully created expense category', { exact: true })
  ).toBeVisible();
};
