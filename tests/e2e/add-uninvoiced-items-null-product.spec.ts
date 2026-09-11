import { login } from './helpers';
import { test, expect } from './fixtures';

test('Invoice line items still accept free-text products', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/api/v1/products?**', (route) =>
    route.fulfill({ json: { data: [] } })
  );

  await login(page);
  await page.goto('/invoices/create');
  await page
    .getByRole('button', { name: 'Add Item', exact: true })
    .first()
    .click();
  const input = page.locator('input[data-cy="comboboxInput"]').first();
  await input.fill('Custom labour');
  await input.press('Enter');

  // defaultValue comes from invoice state, unlike the text typed into the DOM.
  await expect(input).toHaveJSProperty('defaultValue', 'Custom labour');
  expect(errors).toEqual([]);
});

test('Add Item accepts a product selected from search results', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/api/v1/products?**', (route) =>
    route.fulfill({
      json: {
        data: [
          { id: 'test-product', product_key: 'Labour', notes: 'Hourly work' },
        ],
      },
    })
  );

  await login(page);
  await page.goto('/invoices/create');
  await page.locator('.fixed.right-10.bottom-10').click();
  const dialog = page.getByRole('dialog', { name: 'Add Item', exact: true });
  await dialog.locator('input[data-cy="comboboxInput"]').fill('Labour');
  await dialog
    .locator('[data-combobox-element-id]')
    .filter({ hasText: 'Labour' })
    .click();

  const selectedProducts = dialog.locator('.max-h-96');
  await expect(
    selectedProducts.getByText('Labour', { exact: true })
  ).toBeVisible();
  await expect(
    selectedProducts.getByText('Hourly work', { exact: true })
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Save', exact: true })
  ).toBeEnabled();
  expect(errors).toEqual([]);
});

// Regression coverage for Sentry event 85d72da3e1a345cf9c05e06f207ec2f8.
// No invoice or product is saved; product searches are stubbed to return no matches.
for (const action of ['Enter', 'Tab', 'click away'] as const) {
  test(`Add Item ignores unmatched product text after ${action}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.route('**/api/v1/products?**', (route) =>
      route.fulfill({ json: { data: [] } })
    );

    await login(page);
    await page.goto('/invoices/create');

    // The floating plus opens AddUninvoicedItemsButton, unlike the line-item button.
    await page.locator('.fixed.right-10.bottom-10').click();
    const dialog = page.getByRole('dialog', { name: 'Add Item', exact: true });
    await expect(dialog).toBeVisible();
    const input = dialog.locator('input[data-cy="comboboxInput"]');
    const searchResponse = page.waitForResponse((response) => {
      const url = new URL(response.url());
      return (
        url.pathname === '/api/v1/products' &&
        url.searchParams.get('filter') === 'Labour '
      );
    });
    await input.fill('Labour ');

    // Wait for the debounced lookup to finish before submitting the free text.
    expect(await (await searchResponse).json()).toEqual({ data: [] });
    expect(errors).toEqual([]);

    if (action === 'click away') {
      await dialog
        .getByRole('heading', { name: 'Add Item', exact: true })
        .click();
    } else {
      await input.press(action);
    }

    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText('No items selected.', { exact: true })
    ).toBeVisible();
    await expect(
      dialog.getByRole('button', { name: 'Save', exact: true })
    ).toBeDisabled();
    // The selector remains usable after the rejected selection.
    await input.fill('Another search');
    await expect(input).toHaveValue('Another search');
    expect(errors).toEqual([]);
  });
}
