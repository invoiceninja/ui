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
import { createClient } from './client-helpers';

interface Params {
  permissions: Permission[];
}
function useRecurringInvoiceActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Clone to Recurring',
      visible: hasPermission('create_recurring_invoice'),
    },
    {
      label: 'Clone to Other',
      visible:
        hasPermission('create_invoice') ||
        hasPermission('create_quote') ||
        hasPermission('create_credit') ||
        hasPermission('create_purchase_order'),
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
            label: 'Credit',
            visible: hasPermission('create_credit'),
          },
          {
            label: 'Purchase Order',
            visible: hasPermission('create_purchase_order'),
          },
        ],
      },
    },
  ];

  return actions;
}

const checkEditPage = async (page: Page, isEditable: boolean) => {
  await page.waitForURL('**/recurring_invoices/**/edit');

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
};

interface CreateParams {
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
}
const createRecurringInvoice = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo } = params;

  await createClient({ page, withNavigation: true, createIfNotExist: true });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Recurring Invoice' })
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
    page.getByText('Successfully created recurring invoice')
  ).toBeVisible();
};

test("can't view recurring invoices without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Recurring Invoices'
  );

  await logout(page);
});

test('can view recurring invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('view_recurring_invoice', 'view_client');
  await save();

  await createRecurringInvoice({ page });

  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, false);

  await logout(page);
});

test('can edit recurring invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useRecurringInvoiceActions({
    permissions: ['edit_recurring_invoice'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('edit_recurring_invoice', 'view_client');
  await save();

  await createRecurringInvoice({ page });

  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
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
    page.getByText('Successfully updated recurring invoice', { exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await checkDropdownActions(
    page,
    actions,
    'recurringInvoiceActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('can create a recurring invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useRecurringInvoiceActions({
    permissions: ['create_recurring_invoice', 'create_client', 'view_client'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('create_recurring_invoice', 'create_client', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await createRecurringInvoice({ page, isTableEditable: false });

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring invoice', { exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await checkDropdownActions(
    page,
    actions,
    'recurringInvoiceActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('can view and edit assigned invoice with create_recurring_invoice', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useRecurringInvoiceActions({
    permissions: ['create_recurring_invoice'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('create_recurring_invoice');
  await save();

  await createRecurringInvoice({ page, assignTo: 'Invoices Example' });

  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
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
    page.getByText('Successfully updated recurring invoice', { exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await checkDropdownActions(
    page,
    actions,
    'recurringInvoiceActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('deleting invoice with edit_recurring_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set(
    'create_recurring_invoice',
    'edit_recurring_invoice',
    'view_client',
    'create_client'
  );
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/recurring_invoices');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringInvoice({ page });

    const moreActionsButton = page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'More Actions', exact: true })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(
      page.getByText('Successfully deleted recurring invoice')
    ).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(
      page.getByText('Successfully deleted recurring invoice')
    ).toBeVisible();
  }
});

test('archiving invoice withe edit_recurring_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set(
    'create_recurring_invoice',
    'edit_recurring_invoice',
    'view_client',
    'create_client'
  );
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page.waitForURL('**/recurring_invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringInvoice({ page });

    const moreActionsButton = page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'More Actions', exact: true })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(
      page.getByText('Successfully archived recurring invoice')
    ).toBeVisible();

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

    await expect(
      page.getByText('Successfully archived recurring invoice')
    ).toBeVisible();
  }
});

test('invoice documents preview with edit_recurring_invoice', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set(
    'create_recurring_invoice',
    'edit_recurring_invoice',
    'view_client',
    'create_client'
  );
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page.waitForURL('**/recurring_invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringInvoice({ page });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/recurring_invoices/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('invoice documents uploading with edit_recurring_invoice', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set(
    'create_recurring_invoice',
    'edit_recurring_invoice',
    'view_client',
    'create_client'
  );
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page.waitForURL('**/recurring_invoices');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringInvoice({ page });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/recurring_invoices/**/edit');

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

  const actions = useRecurringInvoiceActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await createRecurringInvoice({ page });

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await checkDropdownActions(
    page,
    actions,
    'recurringInvoiceActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('all clone actions displayed with creation permissions', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useRecurringInvoiceActions({
    permissions: [
      'create_recurring_invoice',
      'create_invoice',
      'create_quote',
      'create_credit',
      'create_purchase_order',
      'create_client',
    ],
  });

  await login(page);
  await clear('invoices@example.com');
  await set(
    'create_recurring_invoice',
    'create_invoice',
    'create_quote',
    'create_credit',
    'create_purchase_order',
    'view_client',
    'create_client'
  );
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await createRecurringInvoice({ page, isTableEditable: false });

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await checkDropdownActions(
    page,
    actions,
    'recurringInvoiceActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('cloning recurring invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set(
    'create_recurring_invoice',
    'edit_recurring_invoice',
    'view_client',
    'create_client'
  );
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page.waitForURL('**/recurring_invoices');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createRecurringInvoice({ page });

    const moreActionsButton = page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'More Actions', exact: true });

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByText('Clone to Recurring').first().click();

  await page.waitForURL('**/recurring_invoices/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created recurring invoice')
  ).toBeVisible();

  await page.waitForURL('**/recurring_invoices/**/edit**');

  await expect(
    page.getByRole('heading', { name: 'Edit Recurring Invoice' }).first()
  ).toBeVisible();
});

test('Select client message', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Recurring Invoices', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Recurring Invoice' })
    .click();

  await page.waitForTimeout(900);

  await expect(
    page.getByText('Please select a client.', { exact: true }).first()
  ).toBeVisible();

  await page.getByRole('option').first().click();

  await expect(
    page.getByText('Please select a client.', { exact: true })
  ).not.toBeVisible();

  await logout(page);
});
