import { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { waitForTableData } from '$tests/e2e/helpers';

interface VendorCreateParams {
  page: Page;
  withNavigation?: boolean;
  createIfNotExist?: boolean;
  name?: string;
}
export const createVendor = async (params: VendorCreateParams) => {
  const {
    page,
    withNavigation = true,
    createIfNotExist = false,
    name,
  } = params;

  if (withNavigation) {
    await page
      .locator('[data-cy="navigationBar"]')
      .getByRole('link', { name: 'Vendors', exact: true })
      .click();
  }

  const doRecordsExist = await waitForTableData(page);

  if (createIfNotExist && doRecordsExist) {
    return;
  }

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Vendor' })
    .click();

  await page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox').fill(name || 'New Vendor');
  await page.locator('#first_name_0').fill('First Name');
  await page.locator('#last_name_0').fill('Last Name');
  await page.locator('#email_0').fill('first@example.com');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created vendor', { exact: true })
  ).toBeVisible();
};
