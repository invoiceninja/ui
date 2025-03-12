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

  await page.waitForTimeout(300);

  await page.getByRole('main').locator('[type="text"]').first().fill(taxName);
  await page
    .getByRole('main')
    .locator('[type="number"]')
    .first()
    .fill(rate.toString());

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByText('Successfully created tax rate', { exact: true })
  ).toBeVisible();
};
