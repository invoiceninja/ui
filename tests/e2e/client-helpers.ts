import { Page } from '@playwright/test';
import { expect } from '@playwright/test';

interface ClientCreateParams {
  page: Page;
  withNavigation?: boolean;
  createIfNotExist?: boolean;
  name?: string;
  contactEmail?: string;
}
export const createClient = async (params: ClientCreateParams) => {
  const {
    page,
    withNavigation = true,
    createIfNotExist = false,
    name = 'Company Name',
    contactEmail = 'first@example.com',
  } = params;

  if (withNavigation) {
    await page
      .locator('[data-cy="navigationBar"]')
      .getByRole('link', { name: 'Clients', exact: true })
      .click();
  }

  // Wait for the table to finish loading before checking for records
  await page.waitForURL('**/clients');
  const dataTable = page.locator('[data-cy="dataTable"]');
  await dataTable.waitFor({ state: 'visible', timeout: 10000 });
  // Wait for either "No records found" or a table row with data to appear
  await Promise.race([
    page.getByText('No records found').waitFor({ state: 'visible', timeout: 10000 }),
    page.locator('tbody tr a').first().waitFor({ state: 'visible', timeout: 10000 }),
  ]).catch(() => {
    // Timeout is OK — we'll check state below
  });

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (createIfNotExist && doRecordsExist) {
    return;
  }

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Client' })
    .click();

  await page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox').fill(name);
  await page.locator('#first_name_0').fill('First Name');
  await page.locator('#last_name_0').fill('Last Name');
  await page.locator('#email_0').fill(contactEmail);

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created client', { exact: true })
  ).toBeVisible();
};
