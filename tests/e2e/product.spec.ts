import {
  Permission,
  checkDropdownActions,
  checkTableEditability,
  login,
  logout,
  permissions,
  useHasPermission,
} from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';
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
  ).toBeVisible();
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
    ).toBeVisible();

    await expect(page.locator('[data-cy="chevronDownButton"]')).toBeVisible();

    await expect(
      page.locator('[data-cy="tabs"]').getByRole('link', { name: 'Documents' })
    ).toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).not.toBeVisible();

    await expect(
      page.locator('[data-cy="chevronDownButton"]')
    ).not.toBeVisible();
  }

  if (!isAdmin) {
    await expect(
      page
        .locator('[data-cy="tabs"]')
        .getByRole('link', { name: 'Product Fields', exact: true })
    ).not.toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="tabs"]')
        .getByRole('link', { name: 'Product Fields', exact: true })
    ).toBeVisible();
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

test('can view product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('view_product');
  await save();

  await createProduct({
    page,
    name: 'test view product',
  });

  await logout(page);

  await login(page, 'products@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Products', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: 'test view product', exact: true })
    .first()
    .click();

  await checkEditPage(page, false, false);

  await logout(page);
});

test('can edit product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useProductActions({
    permissions: ['edit_product'],
  });

  await login(page);
  await clear('products@example.com');
  await set('edit_product');
  await save();

  await createProduct({ page, name: 'test edit product' });

  await logout(page);

  await login(page, 'products@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Products', exact: true })
    .click();

  await checkTableEditability(page, true);

  await page
    .getByRole('link', { name: 'test edit product', exact: true })
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
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'productActionDropdown', '', true);

  await logout(page);
});

test('can create a product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

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
    name: 'test create product',
    isTableEditable: false,
  });

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated product', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'productActionDropdown', '', true);

  await logout(page);
});

test('deleting product with edit_product', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProduct({ page, withNavigation: false });

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted product')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted product')).toBeVisible();
  }
});

test('archiving product withe edit_product', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProduct({ page, withNavigation: false });

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived product')).toBeVisible();

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

    await expect(page.getByText('Successfully archived product')).toBeVisible();
  }
});

test('product documents preview with edit_product', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProduct({ page, withNavigation: false });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
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

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('product documents uploading with edit_product', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProduct({ page, withNavigation: false });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
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
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible();

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible();
});

test('all actions in dropdown displayed with admin permission', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useProductActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('products@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await createProduct({ page, name: 'test dropdown product' });

  await checkEditPage(page, true, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'productActionDropdown', '', true);

  await logout(page);
});

test('New Invoice, New Purchase Order, and Clone displayed with creation permissions', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

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
    name: 'test actions product',
    isTableEditable: false,
  });

  await checkEditPage(page, true, false);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'productActionDropdown', '', true);

  await logout(page);
});

test('cloning product with edit_product', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProduct({ page, withNavigation: false });

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Clone').click();

    await page.waitForURL('**/products/create?action=clone');

    await page.getByRole('button', { name: 'Save' }).first().click();

    await expect(page.getByText('Successfully created product')).toBeVisible();

    await page.waitForURL('**/products/**/edit');

    await expect(
      page.getByRole('heading', { name: 'Edit Product' }).first()
    ).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Clone').click();

    await page.waitForURL('**/products/create?action=clone');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully created product')).toBeVisible();

    await page.waitForURL('**/products/**/edit');

    await expect(
      page.getByRole('heading', { name: 'Edit Product' }).first()
    ).toBeVisible();
  }
});

test('all custom actions in dropdown displayed with admin permission', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const customActions = useProductCustomActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('products@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await createProduct({ page, name: 'test bulk actions product' });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Products', exact: true })
    .click();

  await page.waitForTimeout(200);

  await page.locator('[data-cy="dataTableCheckbox"]').first().click();

  await checkDropdownActions(
    page,
    customActions,
    'bulkActionsDropdown',
    'dataTable'
  );

  await logout(page);
});

test('New Invoice and New Purchase Order displayed with creation permissions', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

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

  await createProduct({ page, name: 'test bulk actions product' });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Products', exact: true })
    .click();

  await page.waitForTimeout(200);

  await page.locator('[data-cy="dataTableCheckbox"]').first().click();

  await checkDropdownActions(
    page,
    customActions,
    'bulkActionsDropdown',
    'dataTable'
  );

  await logout(page);
});

test('rendering documents and product_fields tabs with admin permission', async ({
  page,
}) => {
  await login(page);

  await createProduct({ page, name: 'test product tabs' });

  await page
    .locator('[data-cy="tabs"]')
    .getByRole('link', { name: 'Documents' })
    .click();

  await page.waitForURL('**/products/**/documents');

  await expect(
    page.getByRole('heading', { name: 'Upload', exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="tabs"]')
    .getByRole('link', { name: 'Product Fields', exact: true })
    .click();

  await page.waitForURL('**/products/**/product_fields');

  await expect(
    page.getByRole('heading', { name: 'Custom Fields', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Edit', exact: true })
  ).toBeVisible();

  await expect(page.getByRole('link', { name: 'Documents' })).toBeVisible();

  await logout(page);
});

test('Product selector list gets updated on the report page when it is created', async ({
  page,
}) => {
  await login(page);

  await createProduct({ page, name: 'test product selector' });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Reports', exact: true })
    .click();

  await page
    .locator('[data-cy="reportNameSelector"]')
    .selectOption({ label: 'Product Sales' });

  await page.waitForTimeout(200);

  await page.locator('[id="productItemSelector"]').click();

  await page
    .locator('[id="productItemSelector"]')
    .locator('[type="text"]')
    .first()
    .fill('test product selector');

  await page.waitForTimeout(200);

  await expect(
    page.getByText('test product selector', { exact: true })
  ).toBeVisible();

  await logout(page);
});
