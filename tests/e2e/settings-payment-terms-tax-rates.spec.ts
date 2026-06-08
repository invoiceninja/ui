import { login } from '$tests/e2e/helpers';
import { createClient } from './client-helpers';
import {
  extractIdFromUrl,
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { type EntityType } from '$tests/e2e/api-helpers';
import { Locator, Page } from '@playwright/test';

resetAccountBeforeAll();

const PAYMENT_TERMS = 'payment_terms' as EntityType;
const TAX_RATES = 'tax_rates' as EntityType;

const mainInput = (page: Page, index = 0) =>
  page.getByRole('main').getByRole('textbox').nth(index);

const save = async (page: Page) => {
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
};

const typeTextbox = async (input: Locator, value: string | number) => {
  await input.click();
  await input.press('Control+A');
  await input.press('Backspace');
  await input.pressSequentially(String(value), { delay: 20 });
  await input.press('Tab');
};

const trackSettingsEntityFromUrl = (
  api: ApiFixture,
  type: EntityType,
  entityPath: string,
  url: string
) => {
  const id = extractIdFromUrl(url, entityPath);

  if (!id) {
    throw new Error('Could not extract ' + entityPath + ' id from ' + url);
  }

  api.trackEntity(type, id);

  return id;
};

async function createPaymentTerm(page: Page, api: ApiFixture, days: number) {
  await page.goto('/settings/payment_terms/create');
  await page.waitForURL('**/settings/payment_terms/create');
  await page.waitForLoadState('networkidle');

  await typeTextbox(mainInput(page), days);

  await save(page);

  await expect(
    page.getByText('Successfully created payment term', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/settings/payment_terms/**/edit');

  const id = trackSettingsEntityFromUrl(
    api,
    PAYMENT_TERMS,
    'payment_terms',
    page.url()
  );

  await expect(mainInput(page)).toHaveValue(String(days));

  return id;
}

async function updatePaymentTerm(page: Page, days: number) {
  await typeTextbox(mainInput(page), days);

  await save(page);

  await expect(
    page.getByText('Successfully updated payment term', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(mainInput(page)).toHaveValue(String(days));
}

async function createTaxRate(
  page: Page,
  api: ApiFixture,
  name: string,
  rate: number
) {
  await page.goto('/settings/tax_rates/create');
  await page.waitForURL('**/settings/tax_rates/create');
  await page.waitForLoadState('networkidle');

  await typeTextbox(mainInput(page, 0), name);
  await typeTextbox(mainInput(page, 1), rate);

  await save(page);

  await expect(
    page.getByText('Successfully created tax rate', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/settings/tax_rates/**/edit');

  const id = trackSettingsEntityFromUrl(api, TAX_RATES, 'tax_rates', page.url());

  await expect(mainInput(page, 0)).toHaveValue(name);
  await expect(mainInput(page, 1)).toHaveValue(String(rate));

  return id;
}

async function updateTaxRate(page: Page, name: string, rate: number) {
  await typeTextbox(mainInput(page, 0), name);
  await typeTextbox(mainInput(page, 1), rate);

  await save(page);

  await expect(
    page.getByText('Successfully updated tax rate', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(mainInput(page, 0)).toHaveValue(name);
  await expect(mainInput(page, 1)).toHaveValue(String(rate));
}

async function runSettingsAction(
  page: Page,
  action: 'Archive' | 'Restore' | 'Delete',
  successMessage: string,
  status: 'Active' | 'Archived' | 'Deleted'
) {
  const actionsTrigger = page
    .getByRole('button', { name: /^(More Actions|Actions)$/ })
    .first();

  await expect(actionsTrigger).toBeVisible({ timeout: 10000 });
  await actionsTrigger.click();

  const actionItem = page.getByText(action, { exact: true }).last();
  await expect(actionItem).toBeVisible({ timeout: 10000 });
  await actionItem.click();

  await expect(page.getByText(successMessage, { exact: true })).toBeVisible({
    timeout: 10000,
  });
  await expect(
    page.getByRole('main').getByText(status, { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('main').getByText(status, { exact: true })
  ).toBeVisible({ timeout: 10000 });
}

async function selectReactOptionByText(
  page: Page,
  container: Locator,
  query: string | number
) {
  const input = container.getByRole('combobox').first();

  await input.click();
  await input.fill(String(query));
  await page
    .getByRole('option', { name: new RegExp(String(query)) })
    .first()
    .click();
}

async function configureExpenseTaxRates(page: Page) {
  await page.goto('/settings/tax_settings');
  await page.waitForURL('**/settings/tax_settings');
  await page.waitForLoadState('networkidle');

  const expenseTaxRatesField = page
    .getByRole('main')
    .getByText(/^(Expense Tax Rates|expense_tax_rates)$/)
    .first()
    .locator('xpath=ancestor::div[contains(@class, "sm:grid")][1]');

  await expect(expenseTaxRatesField).toBeVisible({ timeout: 10000 });
  await selectReactOptionByText(page, expenseTaxRatesField, 'One Tax Rate');
  await save(page);

  await Promise.race([
    page
      .getByText('Successfully updated settings', { exact: true })
      .waitFor({ state: 'visible', timeout: 5000 }),
    page.waitForTimeout(1000),
  ]).catch(() => {});
}

test('payment terms can be created, edited, and used by a client', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);

  await login(page);

  const initialDays = 71;
  const updatedDays = 74;
  const clientName = uniqueName('payment-term-client');

  await createPaymentTerm(page, api, initialDays);
  await updatePaymentTerm(page, updatedDays);

  await page.goto('/clients/create');
  await page.waitForURL('**/clients/create');
  await page.waitForLoadState('networkidle');

  await typeTextbox(page.getByRole('main').getByRole('textbox').first(), clientName);

  await page.getByLabel('Tabs').getByRole('link', { name: 'Settings' }).click();
  await page.waitForURL('**/clients/create/settings');
  await page.waitForLoadState('networkidle');

  const paymentTermsField = page
    .getByRole('main')
    .getByText(/^(Payment Terms|payment_terms)$/)
    .first()
    .locator('xpath=ancestor::div[contains(@class, "sm:grid")][1]');

  await expect(paymentTermsField).toBeVisible({ timeout: 10000 });
  await selectReactOptionByText(page, paymentTermsField, updatedDays);
  await save(page);

  await expect(
    page.getByText('Successfully created client', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/clients/**');

  const clientId = extractIdFromUrl(page.url(), 'clients');
  if (clientId) {
    api.trackEntity('clients', clientId);
  }

  await expect(
    page.getByRole('heading', { name: clientName, exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByText(new RegExp(updatedDays + '\\s+days', 'i'))
  ).toBeVisible({ timeout: 10000 });
});

test('payment term actions update status on the edit page', async ({ page, api }) => {
  await login(page);

  const paymentTermId = await createPaymentTerm(page, api, 77);

  await page.goto('/settings/payment_terms/' + paymentTermId + '/edit');

  await runSettingsAction(
    page,
    'Archive',
    'Successfully archived payment term',
    'Archived'
  );
  await runSettingsAction(
    page,
    'Restore',
    'Successfully restored payment term',
    'Active'
  );
  await runSettingsAction(
    page,
    'Delete',
    'Successfully deleted payment term',
    'Deleted'
  );
  await runSettingsAction(
    page,
    'Restore',
    'Successfully restored payment term',
    'Active'
  );
});

test('tax rates can be created, edited, restored, deleted, and used on an expense', async ({
  page,
  api,
  settingsGuard,
}) => {
  test.setTimeout(60000);

  await login(page);
  await settingsGuard.snapshot();

  const initialName = uniqueName('tax-rate');
  const updatedName = uniqueName('tax-rate-updated');
  const updatedRate = 8;

  await createTaxRate(page, api, initialName, 7);
  await updateTaxRate(page, updatedName, updatedRate);

  await runSettingsAction(
    page,
    'Archive',
    'Successfully archived the tax rate',
    'Archived'
  );
  await runSettingsAction(
    page,
    'Restore',
    'Successfully restored tax rate',
    'Active'
  );
  await runSettingsAction(
    page,
    'Delete',
    'Successfully deleted tax rate',
    'Deleted'
  );
  await runSettingsAction(
    page,
    'Restore',
    'Successfully restored tax rate',
    'Active'
  );

  const usageTaxName = uniqueName('tax-rate-usable');
  const usageTaxRate = 9;
  await createTaxRate(page, api, usageTaxName, usageTaxRate);
  await configureExpenseTaxRates(page);

  await page.goto('/expenses/create');
  await page.waitForURL('**/expenses/create');
  await page.waitForLoadState('networkidle');

  const taxInput = page.getByTestId('combobox-input-field').nth(5);
  await taxInput.click();
  await taxInput.fill(usageTaxName);

  const taxOption = page.getByRole('option', { name: usageTaxName }).first();
  await taxOption.waitFor({ state: 'visible', timeout: 5000 });
  await taxOption.click();

  const selectedTaxValue = usageTaxName + ' ' + usageTaxRate + '%';
  await expect(taxInput).toHaveValue(selectedTaxValue, { timeout: 10000 });

  await page.locator('[data-cy="expenseAmount"]').fill('12');
  await save(page);

  await expect(
    page.getByText('Successfully created expense', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/expenses/**/edit');

  const expenseId = extractIdFromUrl(page.url(), 'expenses');
  if (expenseId) {
    api.trackEntity('expenses', expenseId);
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await expect(page.getByText('$ 13.08').first()).toBeVisible({
    timeout: 10000,
  });
});
