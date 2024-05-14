import {
  checkTableEditability,
  login,
  logout,
  permissions,
} from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';
import { createClient } from './client-helpers';

interface CreateParams {
  page: Page;
  isTableEditable?: boolean;
  withNavigation?: boolean;
}
const createPayment = async (params: CreateParams) => {
  const { page, isTableEditable = true } = params;

  await createClient({ page, createIfNotExist: true });

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
        .getByRole('button', { name: 'More Actions', exact: true })
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
        .getByRole('button', { name: 'More Actions', exact: true })
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

test('can view payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('payments@example.com');
  await set('view_payment');
  await save();

  await createPayment({
    page,
  });

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

test('can edit payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('payments@example.com');
  await set('edit_payment');
  await save();

  await createPayment({ page });

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

test('can create a payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('payments@example.com');
  await set('create_payment', 'create_client', 'view_client');
  await save();
  await logout(page);

  await login(page, 'payments@example.com', 'password');

  await createPayment({
    page,
    isTableEditable: false,
  });

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

test('deleting payment with edit_payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPayment({ page, withNavigation: false });

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
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
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted payment')).toBeVisible();
  }
});

test('archiving payment with edit_payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPayment({ page, withNavigation: false });

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
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
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived payment')).toBeVisible();
  }
});

test('payment documents preview with edit_payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPayment({ page, withNavigation: false });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
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

test('payment documents uploading with edit_payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPayment({ page, withNavigation: false });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
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
}) => {
  await login(page);

  await createPayment({ page });

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
