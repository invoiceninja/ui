import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';

const createRecurringInvoice = async (page: Page) => {
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Recurring Invoice' })
    .click();

  await page.waitForTimeout(1200);

  await page.getByRole('option').first().click();

  await page.getByRole('button', { name: 'Save' }).click();
};

test("can't view recurring invoices without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Recurring Invoices'
  );
});

test('can view recurring invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page.waitForURL('**/recurring_invoices');

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
        name: 'Edit Recurring Invoice',
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

test("can't create a recurring invoice", async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();
  await page.getByText('New Recurring Invoice').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).toBeVisible();
});

test('can create a recurring invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();
  await page.getByText('New Recurring Invoice').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test('can view assigned recurring invoice with create_recurring_invoice', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Recurring Invoices' }).click();

  await createRecurringInvoice(page);

  await expect(
    page.getByText('Successfully created recurring invoice')
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Edit Recurring Invoice' }).first()
  ).toBeVisible();
});

test('deleting recurring invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/recurring_invoices');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Restore')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();
  }

  await expect(
    page.getByText('Successfully deleted recurring invoice')
  ).toBeVisible();
});

test('archiving recurring invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page.waitForURL('**/recurring_invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringInvoice(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Restore')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();
  }

  await expect(
    page.getByText('Successfully archived recurring invoice')
  ).toBeVisible();
});

test('cloning recurring invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page.waitForURL('**/recurring_invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringInvoice(page);

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

  await page.getByText('Clone', { exact: true }).click();

  await page.waitForURL('**/recurring_invoices/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created recurring invoice')
  ).toBeVisible();

  await page.waitForURL('**/recurring_invoices/**/edit');

  await expect(
    page.getByRole('heading', { name: 'Edit Recurring Invoice' }).first()
  ).toBeVisible();
});

test('recurring invoice documents preview', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page.waitForURL('**/recurring_invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringInvoice(page);

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

  await page.waitForURL('**/recurring_invoices/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('recurring invoice documents uploading', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_recurring_invoice');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page.waitForURL('**/recurring_invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringInvoice(page);

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

  await page.waitForURL('**/recurring_invoices/**/edit');

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
