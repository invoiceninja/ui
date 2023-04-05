import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';

const createInvoice = async (page: Page) => {
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Invoice' })
    .click();

  await page.waitForTimeout(1200);

  await page.getByRole('option').first().click();

  await page.getByRole('button', { name: 'Save' }).click();
};

test("can't view invoices without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Invoices'
  );
});

test('can view invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('view_invoice');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  await page.waitForURL('**/invoices');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (doRecordsExist) {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.waitForTimeout(200);

    await page
      .getByRole('link')
      .filter({ has: page.getByText('Edit') })
      .first()
      .click();

    await expect(
      page.getByRole('heading', {
        name: 'Edit Invoice',
        exact: true,
      })
    ).toBeVisible();
  } else {
    await expect(
      page.getByRole('heading', {
        name: "Sorry, you don't have the needed permissions.",
      })
    ).not.toBeVisible();

    await expect(page.getByText('No records found')).toBeVisible();
  }
});

test("can't create an invoice", async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('view_invoice');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();
  await page.getByText('New Invoice').click();

  await expect(
    page
      .getByRole('heading', {
        name: "Sorry, you don't have the needed permissions.",
      })
      .first()
  ).toBeVisible();
});

test('can create an invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();
  await page.getByText('New Invoice').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test('can view assigned invoice with create_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page.getByRole('link', { name: 'Invoices' }).click();

  await createInvoice(page);

  await expect(page.getByText('Successfully created invoice')).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Edit Invoice' })
  ).toBeVisible();
});

test('deleting invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/invoices');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();
  }

  await expect(page.getByText('Successfully deleted invoice')).toBeVisible();
});

test('archiving invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  await page.waitForURL('**/invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();
  }

  await expect(page.getByText('Successfully archived invoice')).toBeVisible();
});

test('cloning invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  await page.waitForURL('**/invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();
  }

  await page.getByText('Clone').first().click();

  await page.waitForURL('**/invoices/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created invoice')).toBeVisible();

  await page.waitForURL('**/invoices/**/edit');

  await expect(
    page.getByRole('heading', { name: 'Edit Invoice' }).first()
  ).toBeVisible();
});

test('invoice documents preview', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  await page.waitForURL('**/invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByText('Edit').first().click();

  await page.waitForURL('**/invoices/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('invoice documents uploading', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Invoices', exact: true }).click();

  await page.waitForURL('**/invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByText('Edit').first().click();

  await page.waitForURL('**/invoices/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await page
    .locator('input[type="file"]')
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible();

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible();
});
