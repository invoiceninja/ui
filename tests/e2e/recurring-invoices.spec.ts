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

interface Params {
  permissions: Permission[];
}
function useRecurringInvoiceActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Clone To',
      visible:
        hasPermission('create_recurring_invoice') ||
        hasPermission('create_invoice') ||
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
      page.locator('[data-cy="topNavbar"]').getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).toBeVisible({ timeout: 10000 });
  } else {
    await expect(
      page.locator('[data-cy="topNavbar"]').getByRole('button', { name: 'Save', exact: true })
    ).not.toBeVisible({ timeout: 10000 });

    await expect(
      page.locator('[data-cy="chevronDownButton"]').first()
    ).not.toBeVisible({ timeout: 10000 });
  }

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('link', { name: 'Settings', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('link', { name: 'Activity', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('link', { name: 'History', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .getByRole('link', { name: 'Schedule', exact: true })
  ).toBeVisible({ timeout: 10000 });
};

interface CreateParams {
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
  clientName?: string;
}
const createRecurringInvoice = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo, clientName } = params;

  await createClient({
    page,
    withNavigation: true,
    createIfNotExist: true,
    name: clientName,
  });

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

  const comboboxInput = page.getByRole('combobox').first();
  await comboboxInput.click();

  await page
    .getByRole('option')
    .first()
    .waitFor({ state: 'visible', timeout: 5000 });
  await page.getByRole('option').first().click();

  if (assignTo) {
    await page
      .locator('[data-cy="tabs"]')
      .getByRole('link', { name: 'Settings', exact: true })
      .first()
      .click();
    await page.getByLabel('User').first().click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created recurring invoice')
  ).toBeVisible({ timeout: 10000 });
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

test('can view recurring invoice', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

  await login(page);
  await clear('invoices@example.com');
  await set('view_recurring_invoice', 'view_client');
  await save();

  await createRecurringInvoice({ page, clientName });

  await page.waitForURL('**/recurring_invoices/**/edit');
  const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_invoices', createdId);

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

test('can edit recurring invoice', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

  const actions = useRecurringInvoiceActions({
    permissions: ['edit_recurring_invoice'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('edit_recurring_invoice', 'view_client');
  await save();

  await createRecurringInvoice({ page, clientName });

  await page.waitForURL('**/recurring_invoices/**/edit');
  const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_invoices', createdId);

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
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'recurringInvoiceActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('can create a recurring invoice', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

  const actions = useRecurringInvoiceActions({
    permissions: ['create_recurring_invoice', 'create_client', 'view_client'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('create_recurring_invoice', 'create_client', 'view_client');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await createRecurringInvoice({ page, isTableEditable: false, clientName });

  await page.waitForURL('**/recurring_invoices/**/edit');
  const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_invoices', createdId);

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated recurring invoice', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

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
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

  const actions = useRecurringInvoiceActions({
    permissions: ['create_recurring_invoice'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('create_recurring_invoice');
  await save();

  await createRecurringInvoice({
    page,
    assignTo: 'Invoices Example',
    clientName,
  });

  await page.waitForURL('**/recurring_invoices/**/edit');
  const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_invoices', createdId);

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
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'recurringInvoiceActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('deleting invoice with edit_recurring_invoice', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

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

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createRecurringInvoice({ page, clientName });

    await page.waitForURL('**/recurring_invoices/**/edit');
    const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('recurring_invoices', createdId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(
      page.getByText('Successfully deleted recurring invoice')
    ).toBeVisible({ timeout: 10000 });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(
      page.getByText('Successfully deleted recurring invoice')
    ).toBeVisible({ timeout: 10000 });
  }
});

test('archiving invoice withe edit_recurring_invoice', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

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

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createRecurringInvoice({ page, clientName });

    await page.waitForURL('**/recurring_invoices/**/edit');
    const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('recurring_invoices', createdId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByRole('button', { name: 'Archive', exact: true }).click();

    await expect(
      page.getByText('Successfully archived recurring invoice')
    ).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible({ timeout: 10000 });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('button', { name: 'Archive', exact: true }).click();

    await expect(
      page.getByText('Successfully archived recurring invoice')
    ).toBeVisible({ timeout: 10000 });
  }
});

test('invoice documents preview with edit_recurring_invoice', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

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

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createRecurringInvoice({ page, clientName });

    await page.waitForURL('**/recurring_invoices/**/edit');
    const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('recurring_invoices', createdId);
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/recurring_invoices/**/edit');

  await page
    .locator('[data-cy="tabs"]')
    .getByRole('link', { name: 'Documents' })
    .first()
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible({ timeout: 10000 });
});

test('invoice documents uploading with edit_recurring_invoice', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

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

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createRecurringInvoice({ page, clientName });

    await page.waitForURL('**/recurring_invoices/**/edit');
    const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('recurring_invoices', createdId);
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/recurring_invoices/**/edit');

  await page
    .locator('[data-cy="tabs"]')
    .getByRole('link', { name: 'Documents' })
    .first()
    .click();

  await page
    .locator('input[type="file"]')
    .first()
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible({
    timeout: 10000,
  });

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible({ timeout: 10000 });
});

test('all actions in dropdown displayed with admin permission', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

  const actions = useRecurringInvoiceActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('invoices@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'invoices@example.com', 'password');

  await createRecurringInvoice({ page, clientName });

  await page.waitForURL('**/recurring_invoices/**/edit');
  const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_invoices', createdId);

  await checkEditPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

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
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

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

  await createRecurringInvoice({ page, isTableEditable: false, clientName });

  await page.waitForURL('**/recurring_invoices/**/edit');
  const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
  if (createdId) api.trackEntity('recurring_invoices', createdId);

  await checkEditPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(
    page,
    actions,
    'recurringInvoiceActionDropdown',
    '',
    true
  );

  await logout(page);
});

test('cloning recurring invoice', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('ri-client');

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

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createRecurringInvoice({ page, clientName });

    await page.waitForURL('**/recurring_invoices/**/edit');
    const createdId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
    if (createdId) api.trackEntity('recurring_invoices', createdId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByText('Clone To').first().click();

  // Select "Recurring Invoice" from the clone modal (scoped to dialog to avoid matching nav)
  const cloneModal = page.getByRole('dialog');
  await cloneModal.waitFor({ state: 'visible', timeout: 5000 });
  await cloneModal.getByText('Recurring Invoice', { exact: true }).click();

  await page.waitForURL('**/recurring_invoices/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created recurring invoice')
  ).toBeVisible({ timeout: 10000 });

  await page.waitForURL('**/recurring_invoices/**/edit**');

  const clonedId = page.url().match(/recurring_invoices\/([^/]+)/)?.[1];
  if (clonedId) api.trackEntity('recurring_invoices', clonedId);

  await expect(
    page.getByRole('heading', { name: 'Edit Recurring Invoice' }).first()
  ).toBeVisible({ timeout: 10000 });
});

test('recurring invoice creation and start stop sequence', async ({ page, api }) => {

  const { clear, save, set } = permissions(page);
  await login(page, 'user@example.com', 'password');
  await page.getByRole('link', { name: 'Recurring Invoices' }).click();
  await page.getByRole('link', { name: 'New Recurring Invoice' }).click();

  // Wait for the create form to fully render — the client combobox auto-opens
  await page.waitForURL('**/recurring_invoices/create');
  await page.waitForTimeout(500);

  // Click "New Client" in the combobox dropdown to create a new client inline
  const newClientButton = page.getByRole('button', { name: 'New Client' });
  await newClientButton.waitFor({ state: 'visible', timeout: 5000 });
  await newClientButton.click();

  await page.locator('section').filter({ hasText: 'Contact First Name' }).getByRole('textbox').click();
  await page.locator('section').filter({ hasText: 'Contact First Name' }).getByRole('textbox').fill('Clients');
  await page.locator('section').filter({ hasText: 'Contact First Name' }).getByRole('textbox').press('Tab');
  await page.locator('section').filter({ hasText: 'Contact Last Name' }).getByRole('textbox').fill('Last Name');
  await page.locator('section').filter({ hasText: 'Contact Last Name' }).getByRole('textbox').press('Tab');
  await page.locator('section').filter({ hasText: 'Contact Email' }).getByRole('textbox').fill('contact@gmail.com');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: 'Add Item' }).click();
  await page.getByRole('textbox').nth(4).click();
  await page.getByRole('cell', { name: 'New Product' }).getByRole('textbox').fill('12345');
  await page.locator('#notes').click();
  await page.locator('#notes').fill('67890');
  await page.getByRole('textbox').filter({ hasText: /^$/ }).nth(5).click();
  await page.getByRole('textbox').filter({ hasText: /^$/ }).nth(5).fill('10');
  await page.getByRole('button', { name: 'Save' }).click();
  // await page.getByRole('button').nth(4).click();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page.getByRole('button', { name: 'Start' }).click();
  await page.getByRole('link', { name: 'Documents' }).click();
  await page.getByLabel('Tabs').getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('link', { name: 'Activity' }).click();
  await page.getByRole('link', { name: 'History' }).click();
  await page.getByRole('link', { name: 'Schedule' }).click();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByRole('button').nth(4).click();
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByText('Paused')).toBeVisible({ timeout: 10000 });
  
  // await expect(page.getByText('Clients Last Name')).toBeVisible({ timeout: 10000 });
  await page.locator('div').filter({ hasText: /^Monthly$/ }).nth(2).click();
  await page.locator('div').filter({ hasText: /^Monthly$/ }).first().click();
  await page.getByRole('cell', { name: '12345' }).getByRole('textbox').click();
  await expect(page.locator('#notes')).toContainText('67890');

  
});
