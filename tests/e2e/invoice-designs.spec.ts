import { login } from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';

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

  await page.waitForTimeout(900);

  await page
    .getByRole('main')
    .locator('[type="text"]')
    .first()
    .fill(name || 'Design Name');

  await page
    .getByRole('main')
    .getByTestId('combobox-input-field')
    .first()
    .click();

  await page.getByRole('option').first().click();

  await page.getByRole('button', { name: 'Save' }).click();

  await page.waitForURL('**/settings/invoice_design/custom_designs/**/edit');

  await expect(
    page.getByRole('main').locator('[type="text"]').first()
  ).toHaveValue(name || 'Design Name');
};

test('deleting invoice design with admin owner account', async ({ page }) => {
  await login(page);

  await createInvoiceDesign({ page, name: 'test deleting invoice design' });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page.getByText('Delete').click();

  await expect(
    page.getByRole('button', { name: 'Restore', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Archive', exact: true })
  ).not.toBeVisible();
});

test('archiving invoice design with admin owner account', async ({ page }) => {
  await login(page);

  await createInvoiceDesign({ page, name: 'test archiving invoice design' });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page.getByText('Archive').click();

  await expect(
    page.getByRole('button', { name: 'Restore', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Delete', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('button', { name: 'Archive', exact: true })
  ).not.toBeVisible();
});
