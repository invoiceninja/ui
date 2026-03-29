import { login, permissions } from '$tests/e2e/helpers';
import { test, expect, uniqueName } from '$tests/e2e/fixtures';

test('test appropriate invalidation of clients', async ({ page, api }) => {
  const { clear, save } = permissions(page);
  const clientName = uniqueName('inv-client');

  await login(page);
  await clear();
  await save();

  await page.getByRole('link', { name: 'Clients' }).click();
  await page
    .getByRole('link', { name: 'New Client', exact: true })
    .first()
    .click();

  await page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox').click();
  await page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox').fill(clientName);

  await page.getByRole('button', { name: 'Save' }).click();

  // Track the client for cleanup
  await api.trackEntityByName('clients', clientName);

  await page
    .getByRole('link', { name: 'New Invoice', exact: true })
    .first()
    .click();
  await page.getByRole('combobox', { name: 'Client' }).click();
  await page.getByRole('combobox', { name: 'Client' }).fill(clientName);
  await expect(page.getByRole('combobox', { name: 'Client' })).toHaveValue(
    clientName
  );
  await page.getByRole('button', { name: 'Add Item' }).click();
  await page.locator('#notes').click();
  await page.locator('#notes').fill('something fancy');
  await page.locator('#notes').press('Tab');
  await page.getByRole('row', { name: 'something fancy 1 $' }).getByRole('textbox').nth(2).fill('1');

  await page.getByRole('row', { name: 'something fancy 1 1 $' }).getByRole('textbox').nth(3).fill('1');
  await page.getByRole('row', { name: 'something fancy 1 1 $' }).getByRole('textbox').nth(3).press('Tab');
  await page.getByRole('cell', { name: '$ 1.00' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('button', { name: 'Save' }).click();

  await page.locator('div').filter({ hasText: /^Purchase White LabelSave$/ }).getByRole('button').nth(2).click();

  // Track invoice 1
  const invoice1Url = page.url();
  const invoice1Id = invoice1Url.match(/invoices\/([^/]+)/)?.[1];
  if (invoice1Id) api.trackEntity('invoices', invoice1Id);

  await page.getByRole('button', { name: 'Mark Sent' }).click();
  await page.getByRole('link', { name: 'View Client' }).click();
  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Paid to Date\$ 0\.00$/ })
      .getByRole('definition')
  ).toBeVisible();
  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Outstanding\$ 0\.00$/ })
      .getByRole('definition')
  ).toBeVisible();
  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Credit Balance\$ 0\.00$/ })
      .getByRole('definition')
  ).toBeVisible();
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Invoice' })
    .click();
  await page.getByRole('button', { name: 'Add Item' }).click();
  await page
    .getByRole('row', { name: '$ 0.00' })
    .getByRole('textbox')
    .first()
    .click();
  await page.locator('#notes').click();
  await page.locator('#notes').fill('something fancy');
  await page.locator('#notes').press('Tab');

  await page.getByRole('row', { name: 'something fancy 1 $' }).getByRole('textbox').nth(2).fill('10');
  await page.getByRole('cell', { name: '10' }).getByRole('textbox').press('Tab');

  await page.getByRole('cell', { name: '1', exact: true }).getByRole('textbox').fill('10');
  await page.getByRole('row', { name: 'something fancy 10 10 $' }).getByRole('textbox').nth(3).press('Tab');

  await page.getByRole('button', { name: 'Save' }).click();

  // Track invoice 2
  const invoice2Url = page.url();
  const invoice2Id = invoice2Url.match(/invoices\/([^/]+)/)?.[1];
  if (invoice2Id) api.trackEntity('invoices', invoice2Id);

  await page.locator('div').filter({ hasText: /^Purchase White LabelSave$/ }).getByRole('button').nth(2).click();
  await page.getByRole('button', { name: 'Mark Sent' }).click();
  await page.getByRole('link', { name: 'View Client' }).click();

  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Paid to Date\$ 0\.00$/ })
      .getByRole('definition')
  ).toBeVisible();
  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Outstanding\$ 100\.00$/ })
      .getByRole('definition')
  ).toBeVisible();
  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Credit Balance\$ 0\.00$/ })
      .getByRole('definition')
  ).toBeVisible();

  await page.getByRole('button', { name: 'Actions' }).nth(3).first().click();
  await page.getByRole('button', { name: 'Mark Paid' }).click();

  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Paid to Date\$ 100\.00$/ })
      .getByRole('definition')
  ).toBeVisible();
  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Outstanding\$ 0\.00$/ })
      .getByRole('definition')
  ).toBeVisible();
  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Credit Balance\$ 0\.00$/ })
      .getByRole('definition')
  ).toBeVisible();

  // Original cleanup via UI (validates the UI flow)
  await page.getByRole('row').first().getByRole('checkbox').click();
  await page
    .locator('div')
    .filter({ hasText: /^ActionsActive$/ })
    .locator('button')
    .click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await page.getByRole('link', { name: 'Clients' }).first().click();
  await page.getByRole('row').first().getByRole('checkbox').first().click();
  await page
    .locator('div')
    .filter({ hasText: /^ActionsActive$/ })
    .locator('button')
    .click();
  await page.getByRole('button', { name: 'Delete' }).click();

  // API-based cleanup is handled automatically by the fixture teardown
});
