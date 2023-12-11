import { login, logout, permissions } from '$tests/e2e/helpers';
import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test('test appropriate invalidation of clients', async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();

  // const client_name = faker.person.fullName();
// console.log(client_name);

  await page.getByRole('link', { name: 'Clients' }).click();
  await page.getByTitle('New Client').first().click();
  await page.locator('#name').click();
  await page.locator('#name').fill('hello dear');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByTitle('New Invoice').click();
  await page.getByRole('link', { name: 'New Invoice', exact: true }).first().click();
  await page.getByRole('combobox', { name: 'Client' }).click();
  await page.getByRole('combobox', { name: 'Client' }).fill('hello dear');
  await expect(page.getByRole('combobox', { name: 'Client' })).toHaveValue('hello dear');
  await page.getByRole('option').first().click();
  await page.getByRole('button', { name: 'Add Item' }).click();
  await page.locator('#notes').click();
  await page.locator('#notes').fill('something fancy');
  await page.locator('#notes').press('Tab');
  await page.locator('#cost').fill('1');
  await page.locator('#cost').press('Tab');
  await page.locator('#quantity').fill('1');
  await page.locator('#quantity').press('Tab');
  await page.getByRole('cell', { name: '$ 1.00' }).getByRole('button').click();
  await page.getByRole('button', { name: 'Save' }).click();
  // await page.getByRole('button', { name: 'Mark Sent' }).click();

  await page.locator('div').filter({ hasText: /^Purchase White LabelBackSave$/ }).getByRole('button').nth(3).click();
  await page.getByRole('button', { name: 'Mark Sent' }).click();
  
  await page.getByRole('link', { name: 'View Client' }).click();
  await expect(page.locator('div').filter({ hasText: /^Paid to Date\$ 0\.00$/ }).getByRole('definition')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Outstanding\$ 0\.00$/ }).getByRole('definition')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Credit Balance\$ 0\.00$/ }).getByRole('definition')).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'New Invoice' }).click();
  await page.getByRole('button', { name: 'Add Item' }).click();
  await page.getByRole('row', { name: '$ 0.00' }).getByRole('textbox').first().click();
  await page.locator('#notes').click();
  await page.locator('#notes').fill('something fancy');
  await page.locator('#notes').press('Tab');
  await page.locator('#cost').fill('10');
  await page.locator('#cost').press('Tab');
  await page.locator('#quantity').fill('10');
  await page.locator('#quantity').press('Tab');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.locator('div').filter({ hasText: /^Purchase White LabelBackSave$/ }).getByRole('button').nth(3).click();
  await page.getByRole('button', { name: 'Mark Sent' }).click();
  await page.getByRole('link', { name: 'View Client' }).click();

  await expect(page.locator('div').filter({ hasText: /^Paid to Date\$ 0\.00$/ }).getByRole('definition')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Outstanding\$ 100\.00$/ }).getByRole('definition')).toBeVisible(); //improper invalidation causing this to fail
  await expect(page.locator('div').filter({ hasText: /^Credit Balance\$ 0\.00$/ }).getByRole('definition')).toBeVisible();

  // await page.getByRole('cell', { name: 'More Actions' }).getByRole('button').first().click();
  await page.getByRole('button', { name: 'More Actions' }).nth(3).click();
  await page.getByRole('button', { name: 'Mark Paid' }).click();

  await expect(page.locator('div').filter({ hasText: /^Paid to Date\$ 100\.00$/ }).getByRole('definition')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Outstanding\$ 0\.00$/ }).getByRole('definition')).toBeVisible();
  await expect(page.locator('div').filter({ hasText: /^Credit Balance\$ 0\.00$/ }).getByRole('definition')).toBeVisible();

  await page.getByRole('row', { name: 'Status Number Client Amount Balance Date Due Date' }).getByRole('checkbox').click();
  await page.locator('div').filter({ hasText: /^More ActionsActive$/ }).locator('button').click();
  await page.getByRole('button', { name: 'Delete' }).click();

  await page.getByRole('link', { name: 'Clients' }).first().click();
  await page.getByRole('row', { name: 'Name Contact Email ID Number Balance Paid to Date Date Created Last Login Website' }).getByRole('checkbox').click();
  await page.locator('div').filter({ hasText: /^More ActionsActive$/ }).locator('button').click();
  await page.getByRole('button', { name: 'Delete' }).click();

});