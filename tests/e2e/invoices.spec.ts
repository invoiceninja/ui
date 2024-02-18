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
function useInvoiceActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Enter Payment',
      visible: hasPermission('create_payment'),
    },
    {
      label: 'Clone to Invoice',
      visible: hasPermission('create_invoice'),
    },
    {
      label: 'Clone to Other',
      visible:
        hasPermission('create_recurring_invoice') ||
        hasPermission('create_quote') ||
        hasPermission('create_credit') ||
        hasPermission('create_purchase_order'),
      modal: {
        title: 'Clone To',
        dataCyXButton: 'cloneOptionsModalXButton',
        actions: [
          {
            label: 'Recurring Invoice',
            visible: hasPermission('create_recurring_invoice'),
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

function useCustomInvoiceActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Enter Payment',
      visible: hasPermission('create_payment'),
    },
  ];

  return actions;
}

const checkEditPage = async (
  page: Page,
  isEditable: boolean,
  isAdmin: boolean,
  expectingUrl?: string
) => {
  await page.waitForURL(expectingUrl || '**/invoices/**/edit');

  if (isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible();

    await expect(page.locator('[data-cy="chevronDownButton"]')).toBeVisible();
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
        .getByRole('button', { name: 'Custom Fields', exact: true })
    ).not.toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="tabs"]')
        .getByRole('button', { name: 'Custom Fields', exact: true })
    ).toBeVisible();
  }
};

interface CreateParams {
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
}
const createInvoice = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo } = params;

  await createClient({ page, withNavigation: true, createIfNotExist: true });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Invoice' })
    .click();

  await page.waitForTimeout(900);

  await page.getByRole('option').first().click();

  if (assignTo) {
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByLabel('User').first().click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created invoice')).toBeVisible();
};

test("can't view invoices without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Invoices'
  );

  await logout(page);
});

test('can view invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('view_invoice', 'view_client');
  await save();

  await createInvoice({ page });

  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, false, false);

  await logout(page);
});

test('can edit invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: ['edit_invoice', 'view_client'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('edit_invoice', 'view_client');
  await save();

  await createInvoice({ page });

  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await checkTableEditability(page, true);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated invoice', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown', '', true);

  await logout(page);
});

test('can create a invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: ['create_invoice', 'create_client', 'view_client'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'create_client', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await createInvoice({ page, isTableEditable: false });

  await checkEditPage(page, true, false, '**/invoices/**/edit**');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated invoice', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown', '', true);

  await logout(page);
});

test('can view and edit assigned invoice with create_invoice', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: ['create_invoice'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice');
  await save();

  await createInvoice({ page, assignTo: 'Invoices Example' });

  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated invoice', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown', '', true);

  await logout(page);
});

test('deleting invoice with edit_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'edit_invoice', 'view_client', 'create_client');
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
    await createInvoice({ page });

    const moreActionsButton = page
      .locator('[data-cy="chevronDownButton"]')
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted invoice')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted invoice')).toBeVisible();
  }
});

test('archiving invoice withe edit_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'edit_invoice', 'view_client', 'create_client');
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
    await createInvoice({ page });

    const moreActionsButton = page
      .locator('[data-cy="chevronDownButton"]')
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived invoice')).toBeVisible();

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

    await expect(page.getByText('Successfully archived invoice')).toBeVisible();
  }
});

test('invoice documents preview with edit_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'edit_invoice', 'view_client', 'create_client');
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
    await createInvoice({ page });

    await page.waitForURL('**/invoices/**/edit**');
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

    await page.waitForURL('**/invoices/**/edit');
  }

  await page
    .getByRole('button', {
      name: 'Documents',
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('invoice documents uploading with edit_invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'edit_invoice', 'view_client', 'create_client');
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
    await createInvoice({ page });

    await page.waitForURL('**/invoices/**/edit**');
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

    await page.waitForURL('**/invoices/**/edit');
  }

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

  const actions = useInvoiceActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await createInvoice({ page });

  await checkEditPage(page, true, true, '**/invoices/**/edit**');

  await page.locator('[data-cy="chevronDownButton"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown', '', true);

  await logout(page);
});

test('Enter Payment and all clone actions displayed with creation permissions', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: [
      'create_payment',
      'create_invoice',
      'create_quote',
      'create_credit',
      'create_recurring_invoice',
      'create_purchase_order',
      'create_client',
    ],
  });

  await login(page);
  await clear('invoices@example.com');
  await set(
    'create_payment',
    'create_invoice',
    'create_quote',
    'create_credit',
    'create_recurring_invoice',
    'create_purchase_order',
    'view_client',
    'create_client'
  );
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await createInvoice({ page, isTableEditable: false });

  await checkEditPage(page, true, false, '**/invoices/**/edit**');

  await page.locator('[data-cy="chevronDownButton"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown', '', true);

  await logout(page);
});

test('cloning invoice', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice', 'edit_invoice', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page.waitForURL('**/invoices');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createInvoice({ page });

    const moreActionsButton = page.locator('[data-cy="chevronDownButton"]');

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByText('Clone to Invoice').first().click();

  await page.waitForURL('**/invoices/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created invoice')).toBeVisible();

  await page.waitForURL('**/invoices/**/edit**');

  await expect(
    page.getByRole('heading', { name: 'Edit Invoice' }).first()
  ).toBeVisible();
});

test('Enter Payment displayed with admin permission', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const customActions = useCustomInvoiceActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await createInvoice({ page });

  await checkEditPage(page, true, true, '**/invoices/**/edit**');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
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

test('Enter Payment displayed with creation permissions', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const customActions = useCustomInvoiceActions({
    permissions: [
      'create_payment',
      'create_invoice',
      'create_quote',
      'create_credit',
      'create_recurring_invoice',
      'create_purchase_order',
      'create_client',
    ],
  });

  await login(page);
  await clear('invoices@example.com');
  await set(
    'create_payment',
    'create_invoice',
    'create_quote',
    'create_credit',
    'create_recurring_invoice',
    'create_purchase_order',
    'view_client',
    'edit_invoice',
    'create_client'
  );
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await createInvoice({ page });

  await checkEditPage(page, true, false, '**/invoices/**/edit**');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
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

test('Second and Third Custom email sending template is displayed', async ({
  page,
}) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page.waitForTimeout(200);

  await page.locator('[data-cy="dataTableCheckbox"]').nth(1).click();

  await page
    .locator("[data-cy='dataTable']")
    .getByRole('button', { name: 'More Actions', exact: true })
    .first()
    .click();

  await page.getByRole('button', { name: 'Send Email', exact: true }).click();

  await expect(page.getByText('Second Custom')).not.toBeVisible();
  await expect(page.getByText('Third Custom')).not.toBeVisible();

  await page.locator('[data-cy="sendEmailModalXButton"]').click();

  await page.waitForTimeout(200);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page
    .getByRole('link', { name: 'Templates & Reminders', exact: true })
    .click();

  await page
    .locator('[data-cy="templateSelector"]')
    .selectOption({ label: 'Second Custom' });

  await page.locator('#subject').fill('testing subject second custom');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(page.getByText('Successfully updated settings')).toBeVisible();

  await page
    .locator('[data-cy="templateSelector"]')
    .selectOption({ label: 'Third Custom' });

  await page.locator('#subject').fill('testing subject third custom');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(page.getByText('Successfully updated settings')).toBeVisible();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page.waitForTimeout(200);

  await page.locator('[data-cy="dataTableCheckbox"]').nth(1).click();

  await page
    .locator("[data-cy='dataTable']")
    .getByRole('button', { name: 'More Actions', exact: true })
    .first()
    .click();

  await page.getByRole('button', { name: 'Send Email', exact: true }).click();

  await expect(page.getByText('testing subject second custom')).toBeVisible();
  await expect(page.getByText('testing subject third custom')).toBeVisible();

  await logout(page);
});

test('Select client message', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Invoice' })
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
