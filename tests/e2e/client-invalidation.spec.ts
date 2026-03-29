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


  // Track invoice 1
  const invoice1Url = page.url();
  const invoice1Id = invoice1Url.match(/invoices\/([^/]+)/)?.[1];
  if (invoice1Id) api.trackEntity('invoices', invoice1Id);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  const markSent1 = page.getByRole('button', { name: 'Mark Sent' });
  await markSent1.waitFor({ state: 'visible', timeout: 5000 });
  await markSent1.click();

  await page.getByRole('link', { name: 'View', exact: true }).click();

  // await page.getByRole('button', { name: 'Discard Changes' }).click();
  // await page.getByRole('link', { name: 'View Client' }).click();
  
  await expect(
    page.getByText('Paid to Date$')
      .filter({ hasText: /^Paid to Date\$ 0\.00$/ })
  ).toBeVisible();
  await expect(
    page.getByText('Outstanding$')
      .filter({ hasText: /^Outstanding\$ 0\.00$/ })
  ).toBeVisible();
  await expect(
    page.getByText('Credit Balance$')
      .filter({ hasText: /^Credit Balance\$ 0\.00$/ })
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

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  const markSentButton = page.getByRole('button', { name: 'Mark Sent' });
  await markSentButton.waitFor({ state: 'visible', timeout: 5000 });
  await markSentButton.click();

  await page.getByRole('link', { name: 'View', exact: true }).click();

  await expect(
    page.getByText('Paid to Date$')
      .filter({ hasText: /^Paid to Date\$ 0\.00$/ })
  ).toBeVisible();
  await expect(
    page.getByText('Outstanding$')
      .filter({ hasText: /^Outstanding\$ 100\.00$/ })
  ).toBeVisible();
  await expect(
    page.getByText('Credit Balance$')
      .filter({ hasText: /^Credit Balance\$ 0\.00$/ })
  ).toBeVisible();

  await page.getByRole('button', { name: 'Actions' }).first().click();
  await page.getByRole('button', { name: 'Mark Paid' }).click();

  await expect(
    page.getByText('Paid to Date$')
      .filter({ hasText: /^Paid to Date\$ 100\.00$/ })
  ).toBeVisible();
  await expect(
    page.getByText('Outstanding$')
      .filter({ hasText: /^Outstanding\$ 0\.00$/ })
  ).toBeVisible();
  await expect(
    page.getByText('Credit Balance$')
      .filter({ hasText: /^Credit Balance\$ 0\.00$/ })
  ).toBeVisible();

await page.getByRole('link', { name: 'Clients' }).first().click();
await page.getByRole('cell').first().getByRole('checkbox').first().click();
await page.getByRole('button', { name: 'Actions' }).first().click();
await page.getByRole('button', { name: 'Delete' }).click();
  // API-based cleanup is handled automatically by the fixture teardown
});
