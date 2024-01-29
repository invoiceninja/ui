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

  await page.waitForTimeout(300);

  await page.locator('[data-cy="expenseCategoryNameField"]').fill(categoryName);

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByText('Successfully created expense category', { exact: true })
  ).toBeVisible();
};
