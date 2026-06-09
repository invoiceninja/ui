import { login } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
} from '$tests/e2e/fixtures';
import { type Locator, type Page } from '@playwright/test';

resetAccountBeforeAll();

test('product inventory settings expose stock controls on product forms', async ({
  page,
  api,
  settingsGuard,
}) => {
  await settingsGuard.snapshot();
  await login(page);

  await page.goto('/settings/product_settings');
  await page.waitForURL('**/settings/product_settings');
  await expect(
    page.getByRole('heading', { name: 'Product Settings', exact: true })
  ).toBeVisible({ timeout: 10000 });

  const inventoryChanged = await setSwitchByLabel(page, 'Track Inventory', true);
  const notificationsChanged = await setSwitchByLabel(
    page,
    'Stock Notifications',
    true
  );
  const notificationThreshold = definitionInputByTerm(
    page,
    'Notification Threshold'
  );
  await expect(notificationThreshold).toBeVisible({ timeout: 10000 });

  const thresholdChanged = Number(await notificationThreshold.inputValue()) !== 7;

  if (thresholdChanged) {
    await typeInput(notificationThreshold, 7);
  }

  if (inventoryChanged || notificationsChanged || thresholdChanged) {
    await saveCompanySettings(page);
  }

  const productKey = uniqueName('inventory-product');

  await page.goto('/products/create');
  await page.waitForURL('**/products/create');
  await expect(
    page.getByRole('heading', { name: 'New Product', exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(definitionInputByTerm(page, 'Stock Quantity')).toBeVisible({
    timeout: 10000,
  });

  await typeInput(definitionInputByTerm(page, 'Item'), productKey);
  await typeInput(definitionInputByTerm(page, 'Stock Quantity'), 14);

  const createResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/products') &&
      response.request().method() === 'POST',
    { timeout: 10000 }
  );

  await save(page);

  const product = ((await (await createResponse).json()) as {
    data: { id: string };
  }).data;
  api.trackEntity('products', product.id);

  await expect(
    page.getByText('Successfully created product', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/products/**/edit');
  await expect(definitionInputByTerm(page, 'Stock Quantity')).toHaveValue(
    /14/,
    {
      timeout: 10000,
    }
  );
});

test('task default rate setting is inherited by the new task form', async ({
  page,
  settingsGuard,
}) => {
  await settingsGuard.snapshot();
  await login(page);

  await page.goto('/settings/task_settings');
  await page.waitForURL('**/settings/task_settings');
  await expect(
    page.getByRole('heading', { name: 'Task Settings', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await typeInput(definitionInputByTerm(page, 'Default Task Rate'), 123.45);
  await saveCompanySettings(page);

  await page.goto('/tasks/create');
  await page.waitForURL('**/tasks/create');
  await expect(
    page.getByRole('heading', { name: 'New Task', exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(inlineInputByLabel(page, 'Rate')).toHaveValue(/123\.45/, {
    timeout: 10000,
  });
});

async function save(page: Page) {
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
}

async function saveCompanySettings(page: Page) {
  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/companies/') &&
      response.request().method() === 'PUT',
    { timeout: 10000 }
  );

  await save(page);
  expect((await updateResponse).ok()).toBeTruthy();

  await expect(
    page.getByText('Successfully updated settings', { exact: true })
  ).toBeVisible({ timeout: 10000 });
}

async function setSwitchByLabel(
  page: Page,
  label: string,
  desired: boolean
) {
  const toggle = definitionByTerm(page, label).getByRole('switch').first();

  await expect(toggle).toBeVisible({ timeout: 10000 });

  const checked = (await toggle.getAttribute('aria-checked')) === 'true';

  if (checked !== desired) {
    await toggle.click();
    return true;
  }

  return false;
}

async function typeInput(input: Locator, value: string | number) {
  await expect(input).toBeVisible({ timeout: 10000 });
  await input.click();
  await input.press('Control+A');
  await input.press('Backspace');
  await input.pressSequentially(String(value), { delay: 20 });
  await input.press('Tab');
}

function definitionInputByTerm(page: Page, label: string) {
  return definitionByTerm(page, label).locator('input, textarea').first();
}

function definitionByTerm(page: Page, label: string) {
  return termByLabel(page, label).locator('xpath=following-sibling::dd[1]');
}

function inlineInputByLabel(page: Page, label: string) {
  return page
    .getByRole('main')
    .getByText(label, { exact: true })
    .first()
    .locator('xpath=parent::*')
    .locator('input')
    .first();
}

function termByLabel(page: Page, label: string) {
  return page
    .getByRole('main')
    .locator('dt')
    .filter({ hasText: new RegExp('^' + escapeRegExp(label)) })
    .first();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
