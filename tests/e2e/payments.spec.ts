import {
  checkTableEditability,
  login,
  logout,
  permissions,
  waitForTableData,
} from '$tests/e2e/helpers';
import { test, expect, uniqueName } from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';
import { createClient } from './client-helpers';

interface CreateParams {
  page: Page;
  isTableEditable?: boolean;
  withNavigation?: boolean;
  clientName?: string;
}
const createPayment = async (params: CreateParams) => {
  const { page, isTableEditable = true, clientName } = params;

  await createClient({
    page,
    createIfNotExist: true,
    name: clientName,
  });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Payments', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Payment' })
    .click();

  await page.waitForTimeout(900);

  await page.getByRole('option').first().click();

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created payment')).toBeVisible();
};
const checkEditPage = async (
  page: Page,
  isEditable: boolean,
  isAdmin: boolean
) => {
  await page.waitForURL('**/payments/**/edit');

  if (isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible();

    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Actions', exact: true })
    ).toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).not.toBeVisible();

    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Actions', exact: true })
    ).not.toBeVisible();
  }

  await expect(
    page.locator('[data-cy="tabs"]').getByRole('link', { name: 'Documents' })
  ).toBeVisible();

  if (!isAdmin) {
    await expect(
      page
        .locator('[data-cy="tabs"]')
        .getByRole('link', { name: 'Custom Fields', exact: true })
    ).not.toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="tabs"]')
        .getByRole('link', { name: 'Custom Fields', exact: true })
    ).toBeVisible();
  }
};

test("can't view payments without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('payments@example.com');
  await save();
  await logout(page);

  await login(page, 'payments@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Payments'
  );

  await logout(page);
});

test('can view payment', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('pay-client');

  await login(page);
  await clear('payments@example.com');
  await set('view_payment');
  await save();

  await createPayment({
    page,
    clientName,
  });

  await page.waitForURL('**/payments/**/edit');
  const createdId = page.url().match(/payments\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('payments', createdId);

  await logout(page);

  await login(page, 'payments@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Payments', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, false, false);

  await logout(page);
});

test('can edit payment', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('pay-client');

  await login(page);
  await clear('payments@example.com');
  await set('edit_payment');
  await save();

  await createPayment({ page, clientName });

  await page.waitForURL('**/payments/**/edit');
  const createdId = page.url().match(/payments\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('payments', createdId);

  await logout(page);

  await login(page, 'payments@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Payments', exact: true })
    .click();

  await checkTableEditability(page, true);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await page.waitForURL('**/payments/**/edit');

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated payment', { exact: true })
  ).toBeVisible();

  await logout(page);
});

test('can create a payment', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('pay-client');

  await login(page);
  await clear('payments@example.com');
  await set('create_payment', 'create_client', 'view_client');
  await save();
  await logout(page);

  await login(page, 'payments@example.com', 'password');

  await createPayment({
    page,
    isTableEditable: false,
    clientName,
  });

  await page.waitForURL('**/payments/**/edit');
  const createdId = page.url().match(/payments\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('payments', createdId);

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated payment', { exact: true })
  ).toBeVisible();

  await logout(page);
});

test('deleting payment with edit_payment', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('pay-client');

  await login(page);
  await clear('payments@example.com');
  await set('create_payment', 'edit_payment', 'create_client');
  await save();
  await logout(page);

  await login(page, 'payments@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Payments', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/payments');

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createPayment({ page, withNavigation: false, clientName });

    await page.waitForURL('**/payments/**/edit');
    const createdId = page.url().match(/payments\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('payments', createdId);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted payment')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted payment')).toBeVisible();
  }
});

test('archiving payment with edit_payment', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('pay-client');

  await login(page);
  await clear('payments@example.com');
  await set('create_payment', 'edit_payment', 'create_client');
  await save();
  await logout(page);

  await login(page, 'payments@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Payments', exact: true }).click();

  await page.waitForURL('**/payments');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createPayment({ page, withNavigation: false, clientName });

    await page.waitForURL('**/payments/**/edit');
    const createdId = page.url().match(/payments\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('payments', createdId);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived payment')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived payment')).toBeVisible();
  }
});

test('payment documents preview with edit_payment', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('pay-client');

  await login(page);
  await clear('payments@example.com');
  await set('create_payment', 'edit_payment', 'create_client');
  await save();
  await logout(page);

  await login(page, 'payments@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Payments', exact: true }).click();

  await page.waitForURL('**/payments');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createPayment({ page, withNavigation: false, clientName });

    await page.waitForURL('**/payments/**/edit');
    const createdId = page.url().match(/payments\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('payments', createdId);
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/payments/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/payments/**/documents');

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('payment documents uploading with edit_payment', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('pay-client');

  await login(page);
  await clear('payments@example.com');
  await set('create_payment', 'edit_payment', 'create_client');
  await save();
  await logout(page);

  await login(page, 'payments@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Payments', exact: true }).click();

  await page.waitForURL('**/payments');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createPayment({ page, withNavigation: false, clientName });

    await page.waitForURL('**/payments/**/edit');
    const createdId = page.url().match(/payments\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('payments', createdId);
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/payments/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/payments/**/documents');

  await page
    .locator('input[type="file"]')
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible();

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible();
});

test('rendering documents and custom_fields tabs with admin permission', async ({
  page,
  api,
}) => {
  const clientName = uniqueName('pay-client');

  await login(page);

  await createPayment({ page, clientName });

  await page.waitForURL('**/payments/**/edit');
  const createdId = page.url().match(/payments\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('payments', createdId);

  await page
    .locator('[data-cy="tabs"]')
    .getByRole('link', { name: 'Documents' })
    .click();

  await page.waitForURL('**/payments/**/documents');

  await expect(
    page.getByRole('heading', { name: 'Upload', exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="tabs"]')
    .getByRole('link', { name: 'Custom Fields', exact: true })
    .click();

  await page.waitForURL('**/payments/**/payment_fields');

  await expect(
    page.getByRole('heading', { name: 'Custom Fields', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Edit', exact: true })
  ).toBeVisible();

  await expect(page.getByRole('link', { name: 'Documents' })).toBeVisible();

  await logout(page);
});
