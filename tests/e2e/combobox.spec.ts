import { login } from '$tests/e2e/helpers';
import { test, expect, uniqueName } from '$tests/e2e/fixtures';
import { createClientViaApi } from './api-helpers';

test.beforeEach(async ({ api }) => {
  // The combobox tests need clients to exist for the /testing page combobox
  const firstClient = await createClientViaApi(api.context, {
    name: uniqueName('test merge one'),
  });
  const secondClient = await createClientViaApi(api.context, {
    name: uniqueName('test merge two'),
  });

  api.trackEntity('clients', firstClient.id);
  api.trackEntity('clients', secondClient.id);
});

test('ComboBox Async value selecting', async ({ page }) => {
  await login(page);

  await page.goto('/testing');
  await page.waitForURL('/testing');

  const comboBoxInputField = page.getByRole('combobox').first();
  await comboBoxInputField.waitFor({ state: 'visible', timeout: 5000 });
  await comboBoxInputField.click();

  const option = page.getByRole('option').first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();

  await expect(comboBoxInputField).not.toHaveValue('', { timeout: 5000 });
});

test('ComboBox Async available clearing', async ({ page }) => {
  await login(page);

  await page.goto('/testing');
  await page.waitForURL('/testing');

  const comboBoxInputField = page.getByRole('combobox').first();
  await comboBoxInputField.waitFor({ state: 'visible', timeout: 5000 });
  await comboBoxInputField.click();

  const option = page.getByRole('option').first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();

  await expect(comboBoxInputField).not.toHaveValue('', { timeout: 5000 });
});

test('ComboBox Async value clearing', async ({ page }) => {
  await login(page);

  await page.goto('/testing');
  await page.waitForURL('/testing');

  const comboBoxInputField = page.getByRole('combobox').first();
  await comboBoxInputField.waitFor({ state: 'visible', timeout: 5000 });
  await comboBoxInputField.click();

  const option = page.getByRole('option').first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();

  // After selecting, the combobox should have a value
  await expect(comboBoxInputField).not.toHaveValue('', { timeout: 5000 });

  // Clear by using the onDismiss button (the button next to the combobox input)
  const comboboxButton = page.locator('button.absolute.inset-y-0').first();
  await comboboxButton.click();

  await expect(comboBoxInputField).toHaveValue('', { timeout: 5000 });
});

test('ComboBox Async action opening slider', async ({ page }) => {
  await login(page);

  await page.goto('/testing');
  await page.waitForURL('/testing');

  const comboBoxInputField = page.getByRole('combobox').first();
  await comboBoxInputField.waitFor({ state: 'visible', timeout: 5000 });
  await comboBoxInputField.click();

  const actionButton = page.getByRole('button', { name: 'New Client' });
  await expect(actionButton).toBeVisible({ timeout: 10000 });

  await actionButton.click();

  await expect(
    page.locator('[data-headlessui-state="open"]').getByText('New Client')
  ).toBeVisible({ timeout: 10000 });
});

test('ComboBox Async filtering', async ({ page }) => {
  await login(page);

  await page.goto('/testing');
  await page.waitForURL('/testing');

  const comboBoxInputField = page.getByRole('combobox').first();
  await comboBoxInputField.waitFor({ state: 'visible', timeout: 5000 });
  await comboBoxInputField.fill('test merge one');
  await comboBoxInputField.click();

  const option = page.getByRole('option').first();
  await option.waitFor({ state: 'visible', timeout: 5000 });

  const firstOptionTextContent = await option.textContent();
  expect(firstOptionTextContent === 'test merge one').toBeTruthy();

  const numberOfAvailableOptions = (await page.getByRole('option').all()).length;
  expect(numberOfAvailableOptions >= 1).toBeTruthy();
});
