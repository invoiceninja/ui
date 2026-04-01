import { login } from '$tests/e2e/helpers';
import { test, expect } from '$tests/e2e/fixtures';
import { createClientViaApi, createApiContext } from './api-helpers';

test.beforeAll(async () => {
  const api = await createApiContext(process.env.VITE_API_URL!);

  // The combobox tests need clients to exist for the /testing page combobox
  await createClientViaApi(api, { name: 'test merge one' });
  await createClientViaApi(api, { name: 'test merge two' });
});

test('ComboBox Async value selecting', async ({ page }) => {
  await login(page);

  await page.goto('/testing');
  await page.waitForURL('/testing');
  await page.waitForTimeout(200);

  const comboBoxInputField = page.getByRole('combobox').first();
  await comboBoxInputField.click();

  const option = page.getByRole('option').first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();

  await page.waitForTimeout(200);

  const selectedValue = await comboBoxInputField.inputValue();
  expect(selectedValue.length > 0).toBeTruthy();
});

test('ComboBox Async available clearing', async ({ page }) => {
  await login(page);

  await page.goto('/testing');
  await page.waitForURL('/testing');
  await page.waitForTimeout(200);

  const comboBoxInputField = page.getByRole('combobox').first();
  await comboBoxInputField.click();

  const option = page.getByRole('option').first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();

  await page.waitForTimeout(200);

  const selectedValue = await comboBoxInputField.inputValue();
  expect(selectedValue.length > 0).toBeTruthy();
});

test('ComboBox Async value clearing', async ({ page }) => {
  await login(page);

  await page.goto('/testing');
  await page.waitForURL('/testing');
  await page.waitForTimeout(200);

  const comboBoxInputField = page.getByRole('combobox').first();
  await comboBoxInputField.click();

  const option = page.getByRole('option').first();
  await option.waitFor({ state: 'visible', timeout: 5000 });
  await option.click();

  await page.waitForTimeout(200);

  // After selecting, the combobox should have a value
  const selectedValue = await comboBoxInputField.inputValue();
  expect(selectedValue.length > 0).toBeTruthy();

  // Clear by using the onDismiss button (the button next to the combobox input)
  const comboboxButton = page.locator('button.absolute.inset-y-0').first();
  await comboboxButton.click();

  await page.waitForTimeout(200);

  const clearedValue = await comboBoxInputField.inputValue();
  expect(clearedValue.length === 0).toBeTruthy();
});

test('ComboBox Async action opening slider', async ({ page }) => {
  await login(page);

  await page.goto('/testing');
  await page.waitForURL('/testing');
  await page.waitForTimeout(200);

  const comboBoxInputField = page.getByRole('combobox').first();
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
  await page.waitForTimeout(200);

  const comboBoxInputField = page.getByRole('combobox').first();
  await comboBoxInputField.fill('test merge one');
  await comboBoxInputField.click();

  const option = page.getByRole('option').first();
  await option.waitFor({ state: 'visible', timeout: 5000 });

  const firstOptionTextContent = await option.textContent();
  expect(firstOptionTextContent === 'test merge one').toBeTruthy();

  const numberOfAvailableOptions = (await page.getByRole('option').all()).length;
  expect(numberOfAvailableOptions >= 1).toBeTruthy();
});
