import { expect, type Page } from '@playwright/test';
import { waitForTableData } from './helpers';

export function statusFilterControl(page: Page) {
  return page
    .locator('[data-cy="dataTable"]')
    .locator('div.flex.xl\\:space-x-1')
    .filter({ has: page.locator('span', { hasText: /^Status:$/ }) })
    .first();
}

function statusFilterMenu(page: Page) {
  return page
    .locator('[class*="-menu"]')
    .filter({ has: page.getByRole('button', { name: 'Apply', exact: true }) })
    .last();
}

async function openStatusFilter(page: Page) {
  await statusFilterControl(page).click();

  await expect(
    statusFilterMenu(page).getByRole('button', { name: 'Apply', exact: true })
  ).toBeVisible({ timeout: 5000 });
}

export async function setStatusFilter(page: Page, label: string) {
  await openStatusFilter(page);

  const menu = statusFilterMenu(page);

  await menu.getByRole('button', { name: 'Reset', exact: true }).click();
  await menu.getByText(label, { exact: true }).click();
  await menu.getByRole('button', { name: 'Apply', exact: true }).click();
}

export async function clearStatusFilter(page: Page) {
  await openStatusFilter(page);

  const menu = statusFilterMenu(page);

  await menu
    .getByRole('button', { name: 'Reset', exact: true })
    .click({ force: true });
  await menu
    .getByRole('button', { name: 'Apply', exact: true })
    .click({ force: true });
}

export async function expectStatusFilterValue(page: Page, value: string) {
  await expect(statusFilterControl(page).locator('span.truncate')).toHaveText(
    value,
    { timeout: 10000 }
  );
}

export async function expectStatusFilterEmpty(page: Page) {
  const statusValue = statusFilterControl(page).locator('span.truncate');

  await expect(statusValue).toHaveText('', { timeout: 10000 });
  await expect(statusFilterControl(page)).not.toContainText('Paid');
}

export async function ensureInvoicesStatusFilterCleared(page: Page) {
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();
  await page.waitForURL('**/invoices');
  await waitForTableData(page);
  await clearStatusFilter(page);
  await expectStatusFilterEmpty(page);
  await page.waitForTimeout(2000);
}
