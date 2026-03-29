import {
  checkTableEditability,
  login,
  logout,
  permissions,
  waitForTableData,
} from '$tests/e2e/helpers';
import { test, expect, uniqueName } from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';

interface CreateParams {
  page: Page;
  isTableEditable?: boolean;
  vendorName?: string;
  assignTo?: string;
  withNavigation?: boolean;
  email?: string;
}

const createVendor = async (params: CreateParams) => {
  const {
    page,
    vendorName,
    assignTo,
    withNavigation = true,
    isTableEditable = true,
    email,
  } = params;

  if (withNavigation) {
    await page
      .locator('[data-cy="navigationBar"]')
      .getByRole('link', { name: 'Vendors', exact: true })
      .click();

    await checkTableEditability(page, isTableEditable);
  }

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Vendor' })
    .first()
    .click();

  await page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox').fill(vendorName || 'Vendor Name');
  await page.locator('#first_name_0').fill('First Name');
  await page.locator('#last_name_0').fill('Last Name');
  await page.locator('#email_0').fill(email || 'first@example.com');

  if (assignTo) {
    await page.getByTestId('combobox-input-field').first().click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created vendor', { exact: true })
  ).toBeVisible();
};

const checkShowPage = async (page: Page, isEditable: boolean) => {
  await page.waitForURL('**/vendors/**');

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Details' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Address' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Contacts' })
      .first()
  ).toBeVisible();

  if (!isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Edit Vendor', exact: true })
    ).not.toBeVisible();

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).not.toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Edit Vendor', exact: true })
    ).toBeVisible();

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).toBeVisible();
  }
};

const checkEditPage = async (page: Page) => {
  await page.waitForURL('**/vendors/**/edit');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible();

  await expect(
    page.locator('[data-cy="chevronDownButton"]').first()
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Details', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Contacts', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Address', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Additional Info', exact: true })
  ).toBeVisible();
};

test("can't view vendors without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('vendors@example.com');
  await save();
  await logout(page);

  await login(page, 'vendors@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Vendors'
  );

  await logout(page);
});

test('can view vendor', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const vendorName = uniqueName('view-vendor');

  await login(page);
  await clear('vendors@example.com');
  await set('view_vendor');
  await save();

  await createVendor({ page, vendorName });

  const viewVendorId = page.url().match(/vendors\/([^/]+)/)?.[1];
  if (viewVendorId) api.trackEntity('vendors', viewVendorId);

  await logout(page);

  await login(page, 'vendors@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Vendors', exact: true })
    .click();

  await page
    .getByRole('link', { name: vendorName, exact: true })
    .first()
    .click();

  await checkShowPage(page, false);

  await logout(page);
});

test('can edit vendor', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const vendorName = uniqueName('edit-vendor');

  await login(page);
  await clear('vendors@example.com');
  await set('edit_vendor');
  await save();

  await createVendor({ page, vendorName });

  const editVendorId = page.url().match(/vendors\/([^/]+)/)?.[1];
  if (editVendorId) api.trackEntity('vendors', editVendorId);

  await logout(page);

  await login(page, 'vendors@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Vendors', exact: true })
    .click();

  await page
    .getByRole('link', { name: vendorName, exact: true })
    .first()
    .click();

  await checkShowPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Edit Vendor', exact: true })
    .click();

  await checkEditPage(page);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated vendor', { exact: true })
  ).toBeVisible();

  await logout(page);
});

test('can create a vendor', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const vendorName = uniqueName('create-vendor');

  await login(page);
  await clear('vendors@example.com');
  await set('create_vendor');
  await save();
  await logout(page);

  await login(page, 'vendors@example.com', 'password');

  await createVendor({
    page,
    vendorName,
    isTableEditable: false,
  });

  const createVendorId = page.url().match(/vendors\/([^/]+)/)?.[1];
  if (createVendorId) api.trackEntity('vendors', createVendorId);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Vendors', exact: true })
    .click();

  await page.waitForURL('**/vendors');

  await page
    .getByRole('link', { name: vendorName, exact: true })
    .first()
    .click();

  await checkShowPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Edit Vendor', exact: true })
    .click();

  await checkEditPage(page);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated vendor', { exact: true })
  ).toBeVisible();

  await logout(page);
});

test('can view and edit assigned vendor with create_vendor', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const vendorName = uniqueName('assigned-vendor');

  await login(page);
  await clear('vendors@example.com');
  await set('create_vendor');
  await save();

  await createVendor({
    page,
    vendorName,
    assignTo: 'Vendors Example',
  });

  const assignedVendorId = page.url().match(/vendors\/([^/]+)/)?.[1];
  if (assignedVendorId) api.trackEntity('vendors', assignedVendorId);

  await logout(page);

  await login(page, 'vendors@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Vendors', exact: true })
    .click();

  await page
    .getByRole('link', { name: vendorName, exact: true })
    .first()
    .click();

  await checkShowPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Edit Vendor', exact: true })
    .click();

  await checkEditPage(page);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated vendor', { exact: true })
  ).toBeVisible();

  await logout(page);
});

test('deleting vendor with edit_vendor', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const vendorName = uniqueName('delete-vendor');

  await login(page);
  await clear('vendors@example.com');
  await set('create_vendor', 'edit_vendor');
  await save();
  await logout(page);

  await login(page, 'vendors@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Vendors', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/vendors');

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createVendor({ page, vendorName, withNavigation: false });

    const id = page.url().match(/vendors\/([^/]+)/)?.[1];
    if (id) api.trackEntity('vendors', id);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted vendor')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted vendor')).toBeVisible();
  }
});

test('archiving vendor withe edit_vendor', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const vendorName = uniqueName('archive-vendor');

  await login(page);
  await clear('vendors@example.com');
  await set('create_vendor', 'edit_vendor');
  await save();
  await logout(page);

  await login(page, 'vendors@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Vendors', exact: true }).click();

  await page.waitForURL('**/vendors');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createVendor({ page, vendorName, withNavigation: false });

    const id = page.url().match(/vendors\/([^/]+)/)?.[1];
    if (id) api.trackEntity('vendors', id);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived vendor')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived vendor')).toBeVisible();
  }
});

test('vendor documents preview with view_vendor', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const vendorName = uniqueName('docpreview-vendor');

  await login(page);
  await clear('vendors@example.com');
  await set('create_vendor', 'view_vendor');
  await save();
  await logout(page);

  await login(page, 'vendors@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Vendors', exact: true }).click();

  await page.waitForURL('**/vendors');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createVendor({ page, vendorName });

    const id = page.url().match(/vendors\/([^/]+)/)?.[1];
    if (id) api.trackEntity('vendors', id);

    await checkShowPage(page, true);
  } else {
    await tableRow.getByRole('link').first().click();

    await checkShowPage(page, false);
  }

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/vendors/**/documents');

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('vendor documents uploading with edit_vendor', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const vendorName = uniqueName('docupload-vendor');

  await login(page);
  await clear('vendors@example.com');
  await set('create_vendor', 'edit_vendor');
  await save();
  await logout(page);

  await login(page, 'vendors@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Vendors', exact: true }).click();

  await page.waitForURL('**/vendors');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createVendor({ page, vendorName });

    const id = page.url().match(/vendors\/([^/]+)/)?.[1];
    if (id) api.trackEntity('vendors', id);
  } else {
    await tableRow.getByRole('link').first().click();
  }

  await checkShowPage(page, true);

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/vendors/**/documents');

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible();

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible();
});
