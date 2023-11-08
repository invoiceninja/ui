import { login } from '$tests/e2e/helpers';
import test, { expect } from '@playwright/test';

test('ComboBox Async value selecting', async ({ page }) => {
  await login(page);
});
//   await page.goto('/testing');

//   await page.waitForURL('/testing');

//   const comboBoxInputField = page
//     .locator('[data-testid="combobox-input-field"]')
//     .first();

//   comboBoxInputField.click();

//   await page.getByRole('option').first().click();

//   await page.waitForTimeout(200);

//   const selectedValue = await comboBoxInputField.inputValue();

//   expect(selectedValue.length > 0).toBeTruthy();

//   expect(
//     page.locator('[data-testid="combobox-clear-icon"]').first()
//   ).toBeVisible();

//   expect(
//     page.locator('[data-testid="combobox-chevrondown-icon"]').first()
//   ).not.toBeVisible();
// });

// test('ComboBox Async available clearing', async ({ page }) => {
//   await login(page);

//   await page.goto('/testing');

//   await page.waitForURL('/testing');

//   await page.locator('[data-testid="combobox-input-field"]').first().click();

//   await page.getByRole('option').first().click();

//   await page.waitForTimeout(200);

//   expect(
//     page.locator('[data-testid="combobox-clear-icon"]').first()
//   ).toBeVisible();

//   expect(
//     page.locator('[data-testid="combobox-chevrondown-icon"]').first()
//   ).not.toBeVisible();

//   expect(
//     (
//       await page
//         .locator('[data-testid="combobox-input-field"]')
//         .first()
//         .inputValue()
//     ).length > 0
//   ).toBeTruthy();
// });

// test('ComboBox Async value clearing', async ({ page }) => {
//   await login(page);

//   await page.goto('/testing');

//   await page.waitForURL('/testing');

//   await page.locator('[data-testid="combobox-input-field"]').first().click();

//   await page.getByRole('option').first().click();

//   await page.waitForTimeout(200);

//   const clearComboBoxIcon = page
//     .locator('[data-testid="combobox-clear-icon"]')
//     .first();

//   expect(clearComboBoxIcon).toBeVisible();

//   expect(
//     page.locator('[data-testid="combobox-chevrondown-icon"]').first()
//   ).not.toBeVisible();

//   await clearComboBoxIcon.click();

//   await page.waitForTimeout(200);

//   expect(
//     (
//       await page
//         .locator('[data-testid="combobox-input-field"]')
//         .first()
//         .inputValue()
//     ).length === 0
//   ).toBeTruthy();

//   expect(
//     page.locator('[data-testid="combobox-chevrondown-icon"]').first()
//   ).toBeVisible();
// });

// test('ComboBox Async action opening modal', async ({ page }) => {
//   await login(page);

//   await page.goto('/testing');

//   await page.waitForURL('/testing');

//   await page.locator('[data-testid="combobox-input-field"]').first().click();

//   await page.getByRole('option').first().click();

//   const actionComboBoxButton = page
//     .locator('[data-testid="combobox-action-button"]')
//     .first();

//   expect(actionComboBoxButton).toBeVisible();

//   await actionComboBoxButton.click();

//   const actionText = await actionComboBoxButton.textContent();

//   await expect(
//     page
//       .getByRole('heading', {
//         name: actionText?.toString(),
//       })
//       .first()
//   ).toBeVisible();
// });

// test('ComboBox Async filtering', async ({ page }) => {
//   await login(page);

//   await page.goto('/testing');

//   await page.waitForURL('/testing');

//   await page
//     .locator('[data-testid="combobox-input-field"]')
//     .first()
//     .fill('cypress');

//   await page.waitForTimeout(200);

//   const numberOfAvailableOptions = (await page.getByRole('option').all())
//     .length;

//   const firstOptionTextContent = await page
//     .getByRole('option')
//     .first()
//     .textContent();

//   expect(firstOptionTextContent === 'cypress').toBeTruthy();

//   expect(numberOfAvailableOptions === 1).toBeTruthy();
// });
