import { login, permissions } from '$tests/e2e/helpers';
import { test, expect } from '@playwright/test';

test('test appropriate invalidation of clients', async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();

  // const client_name = faker.person.fullName();
  // console.log(client_name);

  await page.getByRole('link', { name: 'Clients' }).click();
  await page
    .getByRole('link', { name: 'New Client', exact: true })
    .first()
    .click();

  await page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox').click()
  
  await page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox').fill('hello dear')

  await page.getByRole('button', { name: 'Save' }).click();
  await page
    .getByRole('link', { name: 'New Invoice', exact: true })
    .first()
    .click();
  await page.getByRole('combobox', { name: 'Client' }).click();
  await page.getByRole('combobox', { name: 'Client' }).fill('hello dear');
  await expect(page.getByRole('combobox', { name: 'Client' })).toHaveValue(
    'hello dear'
  );
  await page.getByRole('button', { name: 'Add Item' }).click();
  await page.locator('#notes').click();
  await page.locator('#notes').fill('something fancy');
  await page.locator('#notes').press('Tab');
  await page.getByRole('row', { name: 'something fancy 1 $' }).getByRole('textbox').nth(2).fill('1');
  // await page.locator('#cost').fill('1');
  // await page.locator('#cost').press('Tab');
  
  await page.getByRole('row', { name: 'something fancy 1 1 $' }).getByRole('textbox').nth(3).fill('1');
  await page.getByRole('row', { name: 'something fancy 1 1 $' }).getByRole('textbox').nth(3).press('Tab');
  // await page.locator('#quantity').fill('1');
  // await page.locator('#quantity').press('Tab');
  await page.getByRole('cell', { name: '$ 1.00' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Save' }).click();
  // await page.getByRole('button', { name: 'Mark Sent' }).click();

  await page.getByRole('button', { name: 'Save' }).click();
  // await page
  //   .locator('div')
  //   .filter({ hasText: /^Purchase White LabelSave$/ })
  //   .getByRole('button')
  //   .nth(3)
  //   .click();

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

  // await page.locator('#cost').fill('10');
  // await page.locator('#cost').press('Tab');
  // await page.locator('#quantity').fill('10');
  await page.getByRole('cell', { name: '1', exact: true }).getByRole('textbox').fill('10');
  await page.getByRole('row', { name: 'something fancy 10 10 $' }).getByRole('textbox').nth(3).press('Tab');

  // await page.locator('#quantity').press('Tab');
  await page.getByRole('button', { name: 'Save' }).click();
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
  ).toBeVisible(); //improper invalidation causing this to fail
  await expect(
    page
      .locator('div')
      .filter({ hasText: /^Credit Balance\$ 0\.00$/ })
      .getByRole('definition')
  ).toBeVisible();

  // await page.getByRole('cell', { name: 'Actions' }).getByRole('button').first().click();
  await page.getByRole('button', { name: 'Actions' }).nth(3).first().click();
  // await page.getByRole('cell', { name: 'Actions' }).getByRole('button').click();
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
});
