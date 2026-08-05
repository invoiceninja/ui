import {
  checkTableEditability,
  login,
  logout,
  selectAssignedUser,
  waitForTableData,
} from '$tests/e2e/helpers';
import { resetAccountBeforeAll, test, expect, uniqueName } from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';

resetAccountBeforeAll();

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

  await page.locator('#name').fill(vendorName || 'Vendor Name');
  await page.locator('#first_name_0').fill('First Name');
  await page.locator('#last_name_0').fill('Last Name');
  await page.locator('#email_0').fill(email || 'first@example.com');

  if (assignTo) {
    await selectAssignedUser(
      page,
      assignTo,
      page.getByTestId('combobox-input-field').first()
    );
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created vendor', { exact: true })
  ).toBeVisible({ timeout: 10000 });
};

const checkShowPage = async (page: Page, isEditable: boolean) => {
  await page.waitForURL('**/vendors/**');

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Details' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Address' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Contacts' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  if (!isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Edit Vendor', exact: true })
    ).not.toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).not.toBeVisible({ timeout: 10000 });
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Edit Vendor', exact: true })
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).toBeVisible({ timeout: 10000 });
  }
};

const checkEditPage = async (page: Page) => {
  await page.waitForURL('**/vendors/**/edit');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.locator('[data-cy="chevronDownButton"]').first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: 'Details', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: 'Contacts', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: 'Address', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: 'Additional Info', exact: true })
  ).toBeVisible({ timeout: 10000 });
};

test("can't view vendors without permission", async ({ page }) => {
  // Account reset already cleared this user's permissions via API.
  await login(page, 'vendors@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Vendors'
  );

});

test('can view vendor', async ({ page, api }) => {

  const vendorName = uniqueName('view-vendor');

  await login(page);
  await api.setPermissions('vendors@example.com', ['view_vendor']);

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

});

test('can edit vendor', async ({ page, api }) => {

  const vendorName = uniqueName('edit-vendor');

  await login(page);
  await api.setPermissions('vendors@example.com', ['edit_vendor']);

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
  ).toBeVisible({ timeout: 10000 });

});

test('can create a vendor', async ({ page, api }) => {

  const vendorName = uniqueName('create-vendor');

  await api.setPermissions('vendors@example.com', ['create_vendor']);

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
  ).toBeVisible({ timeout: 10000 });

});

test('can view and edit assigned vendor with create_vendor', async ({
  page,
  api,
}) => {

  const vendorName = uniqueName('assigned-vendor');

  await login(page);
  await api.setPermissions('vendors@example.com', ['create_vendor']);

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
  ).toBeVisible({ timeout: 10000 });

});

test('deleting vendor with edit_vendor', async ({ page, api }) => {

  const vendorName = uniqueName('delete-vendor');

  await api.setPermissions('vendors@example.com', ['create_vendor', 'edit_vendor']);

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

    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText('Successfully deleted vendor')).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible({ timeout: 10000 });
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText('Successfully deleted vendor')).toBeVisible({ timeout: 10000 });
  }
});

test('archiving vendor withe edit_vendor', async ({ page, api }) => {

  const vendorName = uniqueName('archive-vendor');

  await api.setPermissions('vendors@example.com', ['create_vendor', 'edit_vendor']);

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

    await page.getByRole('button', { name: 'Archive', exact: true }).click();

    await expect(page.getByText('Successfully archived vendor')).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible({ timeout: 10000 });
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByRole('button', { name: 'Archive', exact: true }).click();

    await expect(page.getByText('Successfully archived vendor')).toBeVisible({ timeout: 10000 });
  }
});

test('vendor documents preview with view_vendor', async ({ page, api }) => {

  const vendorName = uniqueName('docpreview-vendor');

  await api.setPermissions('vendors@example.com', ['create_vendor', 'view_vendor']);

  await login(page, 'vendors@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Vendors', exact: true }).click();

  await page.waitForURL('**/vendors');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createVendor({ page, vendorName, isTableEditable: false });

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

  await expect(page.getByText('Drop files or click to upload')).toBeVisible({ timeout: 10000 });
});

test('vendor documents uploading with edit_vendor', async ({ page, api }) => {

  const vendorName = uniqueName('docupload-vendor');

  await api.setPermissions('vendors@example.com', ['create_vendor', 'edit_vendor']);

  await login(page, 'vendors@example.com', 'password');

  await createVendor({ page, vendorName });

  const id = page.url().match(/vendors\/([^/]+)/)?.[1];
  if (id) api.trackEntity('vendors', id);

  await checkShowPage(page, true);

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/vendors/**/documents');

  await expect(page.getByText('Drop files or click to upload')).toBeVisible({
    timeout: 10000,
  });

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible({ timeout: 10000 });
});
