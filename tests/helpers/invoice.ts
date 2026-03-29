import { createClient } from '$tests/e2e/client-helpers';
import { checkTableEditability } from '$tests/e2e/helpers';
import { Page } from '@playwright/test';
import { expect } from '@playwright/test';

interface CreateParams {
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
}
export const createInvoice = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo } = params;

  await createClient({ page, withNavigation: true, createIfNotExist: true });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Invoice' })
    .click();

  // Wait for the client combobox to load and show options
  await page.waitForTimeout(500);

  // The combobox is initially visible for new invoices — click to focus and trigger search
  const comboboxInput = page.getByRole('combobox', { name: 'Client' });
  await comboboxInput.click();
  await page.waitForTimeout(500);

  // Wait for at least one option to appear (client from createClient)
  const clientOption = page.getByRole('option').first();
  await clientOption.waitFor({ state: 'visible', timeout: 10000 });
  await clientOption.click();

  if (assignTo) {
    await page
      .locator('[data-cy="tabs"]')
      .first()
      .getByRole('link', { name: 'Settings', exact: true })
      .first()
      .click();
    await page.getByLabel('User').first().click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created invoice')).toBeVisible();
};
