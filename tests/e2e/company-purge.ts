import { expect, type Browser, type Page } from '@playwright/test';
import { type TestAccount } from './accounts';

const COMPANY_PURGE_TIMEOUT = 180_000;

export async function purgeCompanyDataViaDangerZone(
  browser: Browser,
  account: TestAccount
) {
  const context = await browser.newContext({
    baseURL: process.env.PLAYWRIGHT_BASE_URL,
  });
  const page = await context.newPage();

  try {
    await purgeCompanyDataOnPage(page, account);
  } finally {
    await context.close();
  }
}

async function purgeCompanyDataOnPage(page: Page, account: TestAccount) {
  await loginAsAccountOwner(page, account);
  await page.goto(dangerZonePath());

  await expect(
    page.getByRole('heading', { name: 'Account Management' }).first()
  ).toBeVisible({ timeout: 30_000 });

  await page.getByText('Purge Data', { exact: true }).first().click();

  const dialog = page.getByRole('dialog', { name: 'Purge Data' });
  await expect(dialog).toBeVisible({ timeout: 10_000 });

  const purgeInput = dialog.locator('#purge_data');
  await purgeInput.click();
  await purgeInput.pressSequentially('purge');
  await purgeInput.blur();

  const passwordInput = dialog.locator('#password');
  await passwordInput.click();
  await passwordInput.pressSequentially(account.password);
  await passwordInput.blur();

  const continueButton = dialog.getByRole('button', {
    name: 'Continue',
    exact: true,
  });
  await expect(continueButton).toBeEnabled({ timeout: 10_000 });

  const purgeResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/api/v1/companies/purge_save_settings/'),
    { timeout: COMPANY_PURGE_TIMEOUT }
  );

  await continueButton.click();

  const response = await purgeResponse;
  if (!response.ok()) {
    throw new Error(
      `Danger Zone company purge failed (${response.status()}): ${(
        await response.text()
      ).slice(0, 300)}`
    );
  }

  await expect(dialog).not.toBeVisible({ timeout: COMPANY_PURGE_TIMEOUT });
}

async function loginAsAccountOwner(page: Page, account: TestAccount) {
  await page.goto('/login');
  await page
    .locator('input[name="email"]')
    .waitFor({ state: 'visible', timeout: 10_000 });
  await page.locator('input[name="email"]').fill(account.ownerEmail);
  await page.getByLabel('Password').fill(account.password);
  await page.getByLabel('Password').press('Enter');
  await expect(page.locator('[data-cy="navigationBar"]')).toBeVisible({
    timeout: 10_000,
  });
}

function dangerZonePath() {
  return process.env.VITE_ROUTER === 'hash'
    ? '/#/settings/account_management/danger_zone'
    : '/settings/account_management/danger_zone';
}
