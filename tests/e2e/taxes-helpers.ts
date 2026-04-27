import { Page } from '@playwright/test';
import { expect } from '@playwright/test';

interface TaxCreateParams {
  page: Page;
  taxName: string;
  rate: number;
}
export const createTaxRate = async (params: TaxCreateParams) => {
  const { page, taxName, rate } = params;

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page.getByRole('link', { name: 'Tax Settings', exact: true }).click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Tax Rate' })
    .click();

  // Wait for the blank tax rate API call to settle before typing
  await page.waitForLoadState('networkidle');

  const nameInput = page.getByRole('main').getByRole('textbox').first();
  await nameInput.click();
  await nameInput.pressSequentially(taxName, { delay: 20 });

  const rateInput = page.getByRole('main').getByRole('textbox').nth(1);
  await rateInput.click();
  await rateInput.pressSequentially(rate.toString(), { delay: 20 });

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByText('Successfully created tax rate', { exact: true })
  ).toBeVisible({ timeout: 10000 });
};
