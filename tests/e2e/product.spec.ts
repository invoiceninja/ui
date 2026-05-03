import {
  Permission,
  checkDropdownActions,
  checkTableEditability,
  login,
  logout,
  permissions,
  useHasPermission,
  waitForTableData,
} from '$tests/e2e/helpers';
import { test, expect, uniqueName } from '$tests/e2e/fixtures';
import type { Page } from '@playwright/test';
import { Action } from './clients.spec';

interface Params {
  permissions: Permission[];
}
function useProductActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'New Invoice',
      visible: hasPermission('create_invoice'),
    },
    {
      label: 'New Purchase Order',
      visible: hasPermission('create_purchase_order'),
    },
    {
      label: 'Clone',
      visible: hasPermission('create_product'),
    },
  ];

  return actions;
}

function useProductCustomActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'New Invoice',
      visible: hasPermission('create_invoice'),
    },
    {
      label: 'New Purchase Order',
      visible: hasPermission('create_purchase_order'),
    },
  ];

  return actions;
}

interface CreateParams {
  page: Page;
  name?: string;
  isTableEditable?: boolean;
  withNavigation?: boolean;
}
const createProduct = async (params: CreateParams) => {
  const { page, withNavigation = true, isTableEditable = true, name } = params;

  if (withNavigation) {
    await page
      .locator('[data-cy="navigationBar"]')
      .getByRole('link', { name: 'Products', exact: true })
      .click();

    await checkTableEditability(page, isTableEditable);
  }

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Product' })
    .click();

  await page
    .getByRole('main')
    .locator('[type="text"]')
    .nth(0)
    .fill(name || 'Product Name');
  await page
    .getByRole('main')
    .locator('[type="text"]')
    .nth(1)
    .fill('Product Notes');
  await page.getByRole('main').locator('[type="text"]').nth(2).fill('120');
  await page.getByRole('main').locator('[type="text"]').nth(3).fill('10');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created product', { exact: true })
  ).toBeVisible({ timeout: 10000 });
};

const checkEditPage = async (
  page: Page,
  isEditable: boolean,
  isAdmin: boolean
) => {
  await page.waitForURL('**/products/**/edit');

  if (isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible({ timeout: 10000 });

    await expect(page.locator('[data-cy="chevronDownButton"]')).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('[data-cy="tabs"]').getByRole('link', { name: 'Documents' })
    ).toBeVisible({ timeout: 10000 });
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).not.toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('[data-cy="chevronDownButton"]')
    ).not.toBeVisible({ timeout: 10000 });
  }

  if (!isAdmin) {
    await expect(
      page
        .locator('[data-cy="tabs"]')
        .getByRole('link', { name: 'Product Fields', exact: true })
    ).not.toBeVisible({ timeout: 10000 });
  } else {
    await expect(
      page
        .locator('[data-cy="tabs"]')
        .getByRole('link', { name: 'Product Fields', exact: true })
    ).toBeVisible({ timeout: 10000 });
  }
};

test("can't view products without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Products'
  );

  await logout(page);
});

test('can view product', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const productName = uniqueName('test-view-product');

  await login(page);
  await clear('products@example.com');
  await set('view_product');
  await save();

  await createProduct({
    page,
    name: productName,
  });

  const viewId = page.url().match(/products\/([^/]+)/)?.[1];
  if (viewId) api.trackEntity('products', viewId);

  await logout(page);

  await login(page, 'products@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Products', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: productName, exact: true })
    .first()
    .click();

  await checkEditPage(page, false, false);

  await logout(page);
});

test('can edit product', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const productName = uniqueName('test-edit-product');

  const actions = useProductActions({
    permissions: ['edit_product'],
  });

  await login(page);
  await clear('products@example.com');
  await set('edit_product');
  await save();

  await createProduct({ page, name: productName });

  const editId = page.url().match(/products\/([^/]+)/)?.[1];
  if (editId) api.trackEntity('products', editId);

  await logout(page);

  await login(page, 'products@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Products', exact: true })
    .click();

  await checkTableEditability(page, true);

  await page
    .getByRole('link', { name: productName, exact: true })
    .first()
    .click();

  await page.waitForURL('**/products/**/edit');

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated product', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'productActionDropdown', '', true);

  await logout(page);
});

test('can create a product', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const productName = uniqueName('test-create-product');

  const actions = useProductActions({
    permissions: ['create_product'],
  });

  await login(page);
  await clear('products@example.com');
  await set('create_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await createProduct({
    page,
    name: productName,
    isTableEditable: false,
  });

  const createId = page.url().match(/products\/([^/]+)/)?.[1];
  if (createId) api.trackEntity('products', createId);

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated product', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'productActionDropdown', '', true);

  await logout(page);
});

test('deleting product with edit_product', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product', 'edit_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/products');

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const deleteName = uniqueName('test-delete-product');

    await createProduct({ page, withNavigation: false, name: deleteName });

    const deleteId = page.url().match(/products\/([^/]+)/)?.[1];
    if (deleteId) api.trackEntity('products', deleteId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText('Successfully deleted product')).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible({ timeout: 10000 });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted product')).toBeVisible({ timeout: 10000 });
  }
});

test('archiving product withe edit_product', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product', 'edit_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await page.waitForURL('**/products');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const archiveName = uniqueName('test-archive-product');

    await createProduct({ page, withNavigation: false, name: archiveName });

    const archiveId = page.url().match(/products\/([^/]+)/)?.[1];
    if (archiveId) api.trackEntity('products', archiveId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByRole('button', { name: 'Archive', exact: true }).click();

    await expect(page.getByText('Successfully archived product')).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible({ timeout: 10000 });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived product')).toBeVisible({ timeout: 10000 });
  }
});

test('product documents preview with edit_product', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product', 'edit_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await page.waitForURL('**/products');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const docPreviewName = uniqueName('test-doc-preview-product');

    await createProduct({ page, withNavigation: false, name: docPreviewName });

    const docPreviewId = page.url().match(/products\/([^/]+)/)?.[1];
    if (docPreviewId) api.trackEntity('products', docPreviewId);
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/products/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/products/**/documents');

  await expect(page.getByText('Drop files or click to upload')).toBeVisible({ timeout: 10000 });
});

test('product documents uploading with edit_product', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product', 'edit_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await page.waitForURL('**/products');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const docUploadName = uniqueName('test-doc-upload-product');

    await createProduct({ page, withNavigation: false, name: docUploadName });

    const docUploadId = page.url().match(/products\/([^/]+)/)?.[1];
    if (docUploadId) api.trackEntity('products', docUploadId);
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/products/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/products/**/documents');

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible({ timeout: 10000 });
});

test('all actions in dropdown displayed with admin permission', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const productName = uniqueName('test-dropdown-product');

  const actions = useProductActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('products@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await createProduct({ page, name: productName });

  const dropdownId = page.url().match(/products\/([^/]+)/)?.[1];
  if (dropdownId) api.trackEntity('products', dropdownId);

  await checkEditPage(page, true, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'productActionDropdown', '', true);

  await logout(page);
});

test('New Invoice, New Purchase Order, and Clone displayed with creation permissions', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const productName = uniqueName('test-actions-product');

  const actions = useProductActions({
    permissions: ['create_invoice', 'create_purchase_order', 'create_product'],
  });

  await login(page);
  await clear('products@example.com');
  await set('create_invoice', 'create_purchase_order', 'create_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await createProduct({
    page,
    name: productName,
    isTableEditable: false,
  });

  const actionsId = page.url().match(/products\/([^/]+)/)?.[1];
  if (actionsId) api.trackEntity('products', actionsId);

  await checkEditPage(page, true, false);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'productActionDropdown', '', true);

  await logout(page);
});

test('cloning product with edit_product', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product', 'edit_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await page.waitForURL('**/products');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const cloneName = uniqueName('test-clone-product');

    await createProduct({ page, withNavigation: false, name: cloneName });

    const cloneSourceId = page.url().match(/products\/([^/]+)/)?.[1];
    if (cloneSourceId) api.trackEntity('products', cloneSourceId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByRole('button', { name: 'Clone', exact: true }).click();

    await page.waitForURL('**/products/create?action=clone');

    await page.getByRole('button', { name: 'Save' }).first().click();

    await expect(page.getByText('Successfully created product')).toBeVisible({ timeout: 10000 });

    await page.waitForURL('**/products/**/edit');

    const clonedId = page.url().match(/products\/([^/]+)/)?.[1];
    if (clonedId) api.trackEntity('products', clonedId);

    await expect(
      page.getByRole('heading', { name: 'Edit Product' }).first()
    ).toBeVisible({ timeout: 10000 });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') });

    await moreActionsButton.click();

    await page.getByText('Clone').click();

    await page.waitForURL('**/products/create?action=clone');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully created product')).toBeVisible({ timeout: 10000 });

    await page.waitForURL('**/products/**/edit');

    const clonedId = page.url().match(/products\/([^/]+)/)?.[1];
    if (clonedId) api.trackEntity('products', clonedId);

    await expect(
      page.getByRole('heading', { name: 'Edit Product' }).first()
    ).toBeVisible({ timeout: 10000 });
  }
});

test('all custom actions in dropdown displayed with admin permission', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const productName = uniqueName('test-bulk-actions-product');

  const customActions = useProductCustomActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('products@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await createProduct({ page, name: productName });

  const bulkId = page.url().match(/products\/([^/]+)/)?.[1];
  if (bulkId) api.trackEntity('products', bulkId);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Products', exact: true })
    .click();

  await waitForTableData(page);

  // Select the row checkbox (not header) to trigger bulk actions
  await page.locator('tbody [data-cy="dataTableCheckbox"]').first().click();

  // Wait for the bulk Actions dropdown to appear in the header
  const bulkActionsButton = page.locator('[data-cy="dataTable"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .first();
  await bulkActionsButton.waitFor({ state: 'visible', timeout: 5000 });
  await bulkActionsButton.click();

  // Verify dropdown items are visible on the page
  for (const { label, visible } of customActions) {
    if (visible) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible({ timeout: 10000 });
    }
  }

  await logout(page);
});

test('New Invoice and New Purchase Order displayed with creation permissions', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const productName = uniqueName('test-bulk-actions-product');

  const customActions = useProductCustomActions({
    permissions: ['create_invoice', 'create_purchase_order'],
  });

  await login(page);
  await clear('products@example.com');
  await set(
    'create_invoice',
    'create_purchase_order',
    'edit_product',
    'create_product'
  );
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await createProduct({ page, name: productName });

  const bulkId = page.url().match(/products\/([^/]+)/)?.[1];
  if (bulkId) api.trackEntity('products', bulkId);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Products', exact: true })
    .click();

  await waitForTableData(page);

  // Select the row checkbox (not header) to trigger bulk actions
  await page.locator('tbody [data-cy="dataTableCheckbox"]').first().click();

  // Wait for the bulk Actions dropdown to appear in the header
  const bulkActionsButton = page.locator('[data-cy="dataTable"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .first();
  await bulkActionsButton.waitFor({ state: 'visible', timeout: 5000 });
  await bulkActionsButton.click();

  // Verify dropdown items are visible on the page
  for (const { label, visible } of customActions) {
    if (visible) {
      await expect(page.getByText(label, { exact: true }).first()).toBeVisible({ timeout: 10000 });
    }
  }

  await logout(page);
});

test('rendering documents and product_fields tabs with admin permission', async ({
  page,
  api,
}) => {
  const productName = uniqueName('test-product-tabs');

  await login(page);

  await createProduct({ page, name: productName });

  const tabsId = page.url().match(/products\/([^/]+)/)?.[1];
  if (tabsId) api.trackEntity('products', tabsId);

  await page
    .locator('[data-cy="tabs"]')
    .getByRole('link', { name: 'Documents' })
    .click();

  await page.waitForURL('**/products/**/documents');

  await expect(
    page.getByRole('heading', { name: 'Documents', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page
    .locator('[data-cy="tabs"]')
    .getByRole('link', { name: 'Product Fields', exact: true })
    .click();

  await page.waitForURL('**/products/**/product_fields');

  await expect(
    page.getByRole('heading', { name: 'Custom Fields', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('link', { name: 'Edit', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(page.getByRole('link', { name: 'Documents' })).toBeVisible({ timeout: 10000 });

  await logout(page);
});

test('Product selector list gets updated on the report page when it is created', async ({
  page,
  api,
}) => {
  const productName = uniqueName('test-product-selector');

  await login(page);

  await createProduct({ page, name: productName });

  const selectorId = page.url().match(/products\/([^/]+)/)?.[1];
  if (selectorId) api.trackEntity('products', selectorId);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  // Report selector is a react-select custom selector
  const reportElement = page.locator('dt').filter({ hasText: 'Report' }).locator('..');
  await reportElement.locator('svg').last().click();
  const productSalesOption = page.getByText('Product Sales', { exact: true });
  await productSalesOption.waitFor({ state: 'visible', timeout: 5000 });
  await productSalesOption.click();

  await page.locator('[id="productItemSelector"]').waitFor({ state: 'visible', timeout: 5000 });
  await page.locator('[id="productItemSelector"]').click();

  await page
    .locator('[id="productItemSelector"]')
    .locator('[type="text"]')
    .first()
    .fill(productName);

  await expect(
    page.getByText(productName, { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await logout(page);
});
