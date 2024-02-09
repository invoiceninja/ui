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
import { createVendor } from './vendor-helpers';

interface Params {
  permissions: Permission[];
}
function usePurchaseOrdersActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const isAdmin = permissions.includes('admin');

  const actions: Action[] = [
    {
      label: 'Schedule',
      visible: isAdmin,
    },
    {
      label: 'Clone to PO',
      visible: hasPermission('create_purchase_order'),
    },
    {
      label: 'Clone to Other',
      visible:
        hasPermission('create_invoice') ||
        hasPermission('create_quote') ||
        hasPermission('create_recurring_invoice') ||
        hasPermission('create_credit'),
      modal: {
        title: 'Clone To',
        dataCyXButton: 'cloneOptionsModalXButton',
        actions: [
          {
            label: 'Invoice',
            visible: hasPermission('create_invoice'),
          },
          {
            label: 'Quote',
            visible: hasPermission('create_quote'),
          },
          {
            label: 'Recurring Invoice',
            visible: hasPermission('create_recurring_invoice'),
          },
          {
            label: 'Credit',
            visible: hasPermission('create_credit'),
          },
        ],
      },
    },
  ];

  return actions;
}

const checkEditPage = async (page: Page, isEditable: boolean) => {
  await page.waitForURL('**/purchase_orders/**/edit');

  if (isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible();

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).not.toBeVisible();

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).not.toBeVisible();
  }
};

interface CreateParams {
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
}
const createPurchaseOrder = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo } = params;

  await createVendor({ page, withNavigation: true, createIfNotExist: true });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Purchase Order' })
    .click();

  await page.waitForTimeout(900);

  await page.getByRole('option').first().click();

  if (assignTo) {
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByLabel('User').first().click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created purchase order')
  ).toBeVisible();
};

test("can't view purchase_orders without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('purchase_orders@example.com');
  await save();
  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Purchase Orders'
  );

  await logout(page);
});

test('can view purchase_order', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('purchase_orders@example.com');
  await set('view_purchase_order', 'view_vendor');
  await save();

  await createPurchaseOrder({ page });

  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, false);

  await logout(page);
});

test('can edit purchase_order', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = usePurchaseOrdersActions({
    permissions: ['edit_purchase_order', 'view_vendor'],
  });

  await login(page);
  await clear('purchase_orders@example.com');
  await set('edit_purchase_order', 'view_vendor');
  await save();

  await createPurchaseOrder({ page });

  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  await checkTableEditability(page, true);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated purchase order', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'purchaseOrderActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('can create a purchase_order', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = usePurchaseOrdersActions({
    permissions: ['create_purchase_order'],
  });

  await login(page);
  await clear('purchase_orders@example.com');
  await set('create_purchase_order', 'create_vendor');
  await save();
  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  await createPurchaseOrder({ page, isTableEditable: false });

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated purchase order', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'purchaseOrderActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('can view and edit assigned purchase_order with create_purchase_order', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = usePurchaseOrdersActions({
    permissions: ['create_purchase_order'],
  });

  await login(page);
  await clear('purchase_orders@example.com');
  await set('create_purchase_order');
  await save();

  await createPurchaseOrder({ page, assignTo: 'Purchase_orders Example' });

  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated purchase order', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'purchaseOrderActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('deleting purchase_order with edit_purchase_order', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('purchase_orders@example.com');
  await set('create_purchase_order', 'edit_purchase_order', 'create_vendor');
  await save();
  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/purchase_orders');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPurchaseOrder({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Delete').click();

    await expect(
      page.getByText('Successfully deleted purchase order')
    ).toBeVisible();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByText('Delete').click();

    await expect(
      page.getByText('Successfully deleted purchase order')
    ).toBeVisible();
  }
});

test('archiving purchase_order with edit_purchase_order', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('purchase_orders@example.com');
  await set(
    'create_purchase_order',
    'edit_purchase_order',
    'view_vendor',
    'create_vendor'
  );
  await save();
  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  await page.waitForURL('**/purchase_orders');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPurchaseOrder({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Archive').click();

    await expect(
      page.getByText('Successfully archived purchase order')
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByText('Archive').click();

    await expect(
      page.getByText('Successfully archived purchase order')
    ).toBeVisible();
  }
});

test('purchase_order documents preview with edit_purchase_order', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('purchase_orders@example.com');
  await set(
    'create_purchase_order',
    'edit_purchase_order',
    'view_vendor',
    'create_vendor'
  );
  await save();
  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  await page.waitForURL('**/purchase_orders');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPurchaseOrder({ page });
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/purchase_orders/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('purchase_order documents uploading with edit_purchase_order', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('purchase_orders@example.com');
  await set(
    'create_purchase_order',
    'edit_purchase_order',
    'view_vendor',
    'create_vendor'
  );
  await save();
  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  await page.waitForURL('**/purchase_orders');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPurchaseOrder({ page });
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/purchase_orders/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
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

test('all actions in dropdown displayed with admin permission', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = usePurchaseOrdersActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('purchase_orders@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  await createPurchaseOrder({ page });

  await checkEditPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'purchaseOrderActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('all clone actions displayed with creation permissions', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = usePurchaseOrdersActions({
    permissions: [
      'create_invoice',
      'create_quote',
      'create_recurring_invoice',
      'create_credit',
      'create_purchase_order',
    ],
  });

  await login(page);
  await clear('purchase_orders@example.com');
  await set(
    'create_invoice',
    'create_quote',
    'create_recurring_invoice',
    'create_credit',
    'create_purchase_order',
    'create_vendor'
  );
  await save();
  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  await createPurchaseOrder({ page, isTableEditable: false });

  await checkEditPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'purchaseOrderActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('cloning purchase_order', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('purchase_orders@example.com');
  await set('create_purchase_order', 'edit_purchase_order', 'create_vendor');
  await save();
  await logout(page);

  await login(page, 'purchase_orders@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  await page.waitForURL('**/purchase_orders');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPurchaseOrder({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();
  }

  await page.getByText('Clone to PO').first().click();

  await page.waitForURL('**/purchase_orders/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created purchase order')
  ).toBeVisible();

  await page.waitForURL('**/purchase_orders/**/edit');

  await expect(
    page
      .getByRole('heading', { name: 'Edit Purchase Order', exact: true })
      .first()
  ).toBeVisible();
});

test('Select vendor message', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Purchase Orders', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Purchase Order' })
    .click();

  await page.waitForTimeout(900);

  await expect(
    page.getByText('Please select a vendor.', { exact: true }).first()
  ).toBeVisible();

  await page.getByTestId('combobox-input-field').first().click();

  await page.waitForTimeout(200);

  await page.getByRole('option').first().click();

  await expect(
    page.getByText('Please select a vendor.', { exact: true })
  ).not.toBeVisible();

  await logout(page);
});
