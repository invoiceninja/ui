import { login } from '$tests/e2e/helpers';
import { test, expect, uniqueName, extractIdFromUrl } from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';

interface CreateParams {
  page: Page;
  name?: string;
}
const createInvoiceDesign = async (params: CreateParams) => {
  const { page, name } = params;

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page.getByRole('link', { name: 'Invoice Design', exact: true }).click();

  await page.getByRole('link', { name: 'Custom Designs', exact: true }).click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Design' })
    .click();

  // Wait for form to fully load and React state to initialize
  const nameInput = page.getByRole('main').getByRole('textbox').first();
  await nameInput.waitFor({ state: 'visible', timeout: 5000 });
  // Wait for the blank design API call to settle before typing
  await page.waitForLoadState('networkidle');

  // Use click + clear + type to work with DebounceInput
  await nameInput.click();
  await nameInput.fill('');
  await nameInput.pressSequentially(name || 'Design Name', { delay: 50 });
  await nameInput.blur();

  await page
    .getByRole('main')
    .getByTestId('combobox-input-field')
    .first()
    .click();

  const designOption = page.getByRole('option').first();
  await designOption.waitFor({ state: 'visible', timeout: 5000 });
  await designOption.click();

  await page.getByRole('button', { name: 'Save' }).click();

  await page.waitForURL('**/settings/invoice_design/custom_designs/**/edit', { timeout: 5000 });

  await expect(
    page.getByRole('main').getByRole('textbox').first()
  ).toHaveValue(name || 'Design Name');
};

test('deleting invoice design with admin owner account', async ({ page, api }) => {
  await login(page);

  const designName = uniqueName('del-design');

  await createInvoiceDesign({ page, name: designName });

  const designId = extractIdFromUrl(page.url(), 'custom_designs');
  if (designId) api.trackEntity('designs', designId);

  await page.locator('[data-cy="chevronDownButton"]').first().click();
  await page.getByText('Delete').click();
  await expect(
    page.getByRole('button', { name: 'Restore', exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByRole('button', { name: 'Archive', exact: true })
  ).not.toBeVisible({ timeout: 10000 });
});

test('archiving invoice design with admin owner account', async ({ page, api }) => {
  await login(page);

  const designName = uniqueName('arch-design');

  await createInvoiceDesign({ page, name: designName });

  const designId = extractIdFromUrl(page.url(), 'custom_designs');
  if (designId) api.trackEntity('designs', designId);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page.getByText('Archive').click();

  await expect(
    page.getByRole('button', { name: 'Restore', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('button', { name: 'Delete', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('button', { name: 'Archive', exact: true })
  ).not.toBeVisible({ timeout: 10000 });
});
