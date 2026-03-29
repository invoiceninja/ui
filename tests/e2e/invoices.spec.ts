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
import { Page } from '@playwright/test';
import { Action } from './clients.spec';
import { createClient } from './client-helpers';
import dayjs from 'dayjs';

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
        .nth(1)
        .getByRole('button', { name: 'Custom Fields', exact: true })
    ).not.toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="tabs"]')
        .nth(1)
        .getByRole('button', { name: 'Custom Fields', exact: true })
    ).toBeVisible();
  }
};

interface CreateParams {
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
  clientName?: string;
}
const createInvoice = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo, clientName } = params;

  await createClient({
    page,
    withNavigation: true,
    createIfNotExist: true,
    name: clientName ?? uniqueName('inv-client'),
  });

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

  await page.getByRole('option').first().waitFor({ state: 'visible', timeout: 5000 });
  await page.getByRole('option').first().click();

  if (assignTo) {
    await page
      .locator('[data-cy="tabs"]')
      .first()
      .getByRole('link', { name: 'Settings', exact: true })
      .first()
      .click();
    await page.getByLabel('User').first().click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created invoice')).toBeVisible();
};

test("can't view invoices without permission", async ({ page, api }) => {
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

test('can view invoice', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('invoices@example.com');
  await set('view_invoice', 'view_client');
  await save();

  const clientName = uniqueName('inv-view');
  await createInvoice({ page, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

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

test('can edit invoice', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: ['edit_invoice', 'view_client'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('edit_invoice', 'view_client');
  await save();

  const clientName = uniqueName('inv-edit');
  await createInvoice({ page, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

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

test('can create a invoice', async ({ page, api }) => {
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

  const clientName = uniqueName('inv-create');
  await createInvoice({ page, isTableEditable: false, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

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
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useInvoiceActions({
    permissions: ['create_invoice'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('create_invoice');
  await save();

  const clientName = uniqueName('inv-assigned');
  await createInvoice({ page, assignTo: 'Invoices Example', clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

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

test('deleting invoice with edit_invoice', async ({ page, api }) => {
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

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const clientName = uniqueName('inv-del');
    await createInvoice({ page, clientName });

    const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
    if (invoiceId) api.trackEntity('invoices', invoiceId);

    const moreActionsButton = page
      .locator('[data-cy="chevronDownButton"]')
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted invoice')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted invoice')).toBeVisible();
  }
});

test('archiving invoice withe edit_invoice', async ({ page, api }) => {
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

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const clientName = uniqueName('inv-arch');
    await createInvoice({ page, clientName });

    const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
    if (invoiceId) api.trackEntity('invoices', invoiceId);

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
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived invoice')).toBeVisible();
  }
});

test('invoice documents preview with edit_invoice', async ({ page, api }) => {
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

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const clientName = uniqueName('inv-docprev');
    await createInvoice({ page, clientName });

    const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
    if (invoiceId) api.trackEntity('invoices', invoiceId);

    await page.waitForURL('**/invoices/**/edit**');
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

    await page.waitForURL('**/invoices/**/edit');
  }

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('invoice documents uploading with edit_invoice', async ({ page, api }) => {
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

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const clientName = uniqueName('inv-docup');
    await createInvoice({ page, clientName });

    const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
    if (invoiceId) api.trackEntity('invoices', invoiceId);

    await page.waitForURL('**/invoices/**/edit**');
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

    await page.waitForURL('**/invoices/**/edit');
  }

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible();

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible();
});

test('all actions in dropdown displayed with admin permission', async ({
  page,
  api,
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

  const clientName = uniqueName('inv-admin');
  await createInvoice({ page, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

  await checkEditPage(page, true, true, '**/invoices/**/edit**');

  await page.locator('[data-cy="chevronDownButton"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown', '', true);

  await logout(page);
});

test('Enter Payment and all clone actions displayed with creation permissions', async ({
  page,
  api,
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

  const clientName = uniqueName('inv-clone-actions');
  await createInvoice({ page, isTableEditable: false, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

  await checkEditPage(page, true, false, '**/invoices/**/edit**');

  await page.locator('[data-cy="chevronDownButton"]').click();

  await checkDropdownActions(page, actions, 'invoiceActionDropdown', '', true);

  await logout(page);
});

test('cloning invoice', async ({ page, api }) => {
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

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const clientName = uniqueName('inv-clone');
    await createInvoice({ page, clientName });

    const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
    if (invoiceId) api.trackEntity('invoices', invoiceId);

    const moreActionsButton = page.locator('[data-cy="chevronDownButton"]');

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByText('Clone to Invoice').first().click();

  await page.waitForURL('**/invoices/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created invoice')).toBeVisible();

  await page.waitForURL('**/invoices/**/edit**');

  const clonedInvoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (clonedInvoiceId) api.trackEntity('invoices', clonedInvoiceId);

  await expect(
    page.getByRole('heading', { name: 'Edit Invoice' }).first()
  ).toBeVisible();
});

test('Enter Payment displayed with admin permission', async ({ page, api }) => {
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

  const clientName = uniqueName('inv-pay-admin');
  await createInvoice({ page, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

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

test('Enter Payment displayed with creation permissions', async ({
  page,
  api,
}) => {
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

  const clientName = uniqueName('inv-pay-create');
  await createInvoice({ page, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

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
  api,
  settingsGuard,
}) => {
  await settingsGuard.snapshot();

  await login(page);

  const clientName = uniqueName('inv-custom-email');
  await createInvoice({ page, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page.waitForTimeout(200);

  await page.locator('[data-cy="dataTableCheckbox"]').first().click();

  await page
    .locator("[data-cy='dataTable']")
    .getByRole('button', { name: 'Actions', exact: true })
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

  const secondSubject = uniqueName('second-custom');
  await page.locator('#subject').fill(secondSubject);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(page.getByText('Successfully updated settings')).toBeVisible();

  await page
    .locator('[data-cy="templateSelector"]')
    .selectOption({ label: 'Third Custom' });

  const thirdSubject = uniqueName('third-custom');
  await page.locator('#subject').fill(thirdSubject);

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

  await page.locator('[data-cy="dataTableCheckbox"]').first().click();

  await page
    .locator("[data-cy='dataTable']")
    .getByRole('button', { name: 'Actions', exact: true })
    .first()
    .click();

  await page.getByRole('button', { name: 'Send Email', exact: true }).click();

  await expect(page.getByText(secondSubject)).toBeVisible();
  await expect(page.getByText(thirdSubject)).toBeVisible();

  await logout(page);
});

test('Prevent navigation in the main navbar', async ({ page, api }) => {
  await login(page);

  const clientName = uniqueName('inv-nav');
  await createInvoice({ page, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  await page.waitForTimeout(1000);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await page.waitForURL('**/projects');

  await logout(page);
});

test('Prevent archive invoice action', async ({ page, api }) => {
  await login(page);

  const clientName = uniqueName('inv-prev-arch');
  await createInvoice({ page, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  await page.waitForTimeout(1000);

  await page.locator('[data-cy="chevronDownButton"]').click();

  await page.getByRole('button', { name: 'Archive', exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').click();

  await page.getByRole('button', { name: 'Archive', exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await expect(page.getByText('Successfully archived invoice')).toBeVisible();

  await logout(page);
});

test('Prevent email invoice action', async ({ page, api }) => {
  await login(page);

  const clientName = uniqueName('inv-prev-email');
  await createInvoice({ page, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  await page.waitForTimeout(1000);

  await page.locator('[data-cy="chevronDownButton"]').click();

  await page.getByRole('link', { name: 'Email Invoice', exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').click();

  await page.getByRole('link', { name: 'Email Invoice', exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await page.waitForURL('**/invoices/**/email');

  await logout(page);
});

test('Prevent back button', async ({ page, api }) => {
  await login(page);

  const clientName = uniqueName('inv-prev-back');
  await createInvoice({ page, clientName });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

  await page.waitForURL('**/invoices/**/edit**');

  await page
    .locator('[type="date"]')
    .first()
    .fill(dayjs().add(10, 'day').format('YYYY-MM-DD'));

  await page.locator('[type="date"]').first().blur();

  await page.waitForTimeout(1000);

  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).not.toBeVisible();

  await page.getByRole('button', { name: 'Back', exact: true }).click();

  await expect(
    page.getByText('Please save or cancel your changes')
  ).toBeVisible();

  await page
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();

  await page.waitForURL('**/invoices/create');

  await logout(page);
});

test('Products combobox various selections', async ({ page, api }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Invoice' })
    .click();

  await page.waitForTimeout(1000);

  await page.getByRole('option').first().click();

  await page.getByRole('button', { name: 'Add Item' }).first().click();

  await page.locator('[data-cy="comboboxInput"]').first().click();

  await page.waitForTimeout(500);

  await page.locator('[data-combobox-element-id="0"]').first().click();

  await page.waitForTimeout(100);

  expect(
    (await page.locator('[id="notes"]').first().inputValue()) ===
      'Et aliquid soluta.'
  ).toBeTruthy();

  await page.getByRole('button', { name: 'Add Item' }).first().click();

  await page.locator('[data-cy="comboboxInput"]').nth(1).click();

  await page.waitForTimeout(500);

  await page.locator('[data-cy="comboboxInput"]').nth(1).fill('Qui');

  await page.waitForTimeout(200);

  await page.locator('[data-combobox-element-id="0"]').first().click();

  await page.waitForTimeout(100);

  expect(
    (await page.locator('[id="notes"]').nth(1).inputValue()) ===
      'Et aliquid soluta.'
  ).toBeTruthy();

  await page.getByRole('button', { name: 'Add Item' }).first().click();

  await page.locator('[data-cy="comboboxInput"]').nth(2).click();

  await page.waitForTimeout(500);

  await page.keyboard.press('ArrowDown');

  await page.waitForTimeout(50);

  await page.keyboard.press('ArrowDown');

  await page.keyboard.press('Enter');

  await page.waitForTimeout(100);

  expect(
    (await page.locator('[id="notes"]').nth(2).inputValue()) ===
      'Atque non quibusdam.'
  ).toBeTruthy();

  await page.getByRole('button', { name: 'Add Item' }).first().click();

  await page.locator('[data-cy="comboboxInput"]').nth(3).click();

  await page.waitForTimeout(500);

  const testProductName = uniqueName('test-product');
  await page
    .locator('[data-cy="comboboxInput"]')
    .nth(3)
    .fill(testProductName);

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created invoice')).toBeVisible();

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);

  expect(
    (await page.locator('[data-cy="comboboxInput"]').nth(3).inputValue()) ===
      testProductName
  ).toBeTruthy();

  await logout(page);
});
