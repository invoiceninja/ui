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
function useQuotesActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const isAdmin = permissions.includes('admin');

  const actions: Action[] = [
    {
      label: 'Schedule',
      visible: isAdmin,
    },
    {
      label: 'Convert to Invoice',
      visible: hasPermission('create_invoice'),
    },
    {
      label: 'Convert to Project',
      visible: hasPermission('create_project'),
    },
    {
      label: 'Clone to Quote',
      visible: hasPermission('create_quote'),
    },

    {
      label: 'Clone to Other',
      visible:
        hasPermission('create_invoice') ||
        hasPermission('create_credit') ||
        hasPermission('create_recurring_invoice') ||
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
            label: 'Credit',
            visible: hasPermission('create_credit'),
          },
          {
            label: 'Recurring Invoice',
            visible: hasPermission('create_recurring_invoice'),
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

function useCustomQuoteActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Convert to Invoice',
      visible: hasPermission('create_invoice'),
    },
    {
      label: 'Convert to Project',
      visible: hasPermission('create_project'),
    },
  ];

  return actions;
}

const checkEditPage = async (
  page: Page,
  isEditable: boolean,
  isAdmin: boolean
) => {
  await page.waitForURL('**/quotes/**/edit');

  if (isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
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
const createQuote = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo } = params;

  await createClient({ page, withNavigation: true, createIfNotExist: true });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Quotes', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page.getByRole('main').getByRole('link', { name: 'New Quote' }).click();

  await page.waitForTimeout(900);

  await page.getByRole('option').first().click();

  if (assignTo) {
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByLabel('User').first().click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created quote')).toBeVisible();
};

test("can't view quotes without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('quotes@example.com');
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Quotes'
  );

  await logout(page);
});

test('can view quote', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('quotes@example.com');
  await set('view_quote', 'view_client');
  await save();

  await createQuote({ page });

  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Quotes', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, false, false);

  await logout(page);
});

test('can edit quote', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useQuotesActions({
    permissions: ['edit_quote', 'view_client'],
  });

  await login(page);
  await clear('quotes@example.com');
  await set('edit_quote', 'view_client');
  await save();

  await createQuote({ page });

  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Quotes', exact: true })
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
    page.getByText('Successfully updated quote', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'quoteActionDropdown', '', true);

  await logout(page);
});

test('can create a quote', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useQuotesActions({
    permissions: ['create_quote'],
  });

  await login(page);
  await clear('quotes@example.com');
  await set('create_quote', 'create_client');
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  await createQuote({ page, isTableEditable: false });

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated quote', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'quoteActionDropdown', '', true);

  await logout(page);
});

test('can view and edit assigned quote with create_quote', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useQuotesActions({
    permissions: ['create_quote'],
  });

  await login(page);
  await clear('quotes@example.com');
  await set('create_quote');
  await save();

  await createQuote({ page, assignTo: 'Quotes Example' });

  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Quotes', exact: true })
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
    page.getByText('Successfully updated quote', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'quoteActionDropdown', '', true);

  await logout(page);
});

test('deleting quote with edit_quote', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('quotes@example.com');
  await set('create_quote', 'edit_quote', 'create_client');
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Quotes', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/quotes');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createQuote({ page });

    const moreActionsButton = page
      .locator('[data-cy="chevronDownButton"]')
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted quote')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted quote')).toBeVisible();
  }
});

test('archiving quote withe edit_quote', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('quotes@example.com');
  await set('create_quote', 'edit_quote', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Quotes', exact: true }).click();

  await page.waitForURL('**/quotes');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createQuote({ page });

    const moreActionsButton = page
      .locator('[data-cy="chevronDownButton"]')
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived quote')).toBeVisible();

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

    await expect(page.getByText('Successfully archived quote')).toBeVisible();
  }
});

test('quote documents preview with edit_quote', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('quotes@example.com');
  await set('create_quote', 'edit_quote', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Quotes', exact: true }).click();

  await page.waitForURL('**/quotes');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createQuote({ page });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/quotes/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('quote documents uploading with edit_quote', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('quotes@example.com');
  await set('create_quote', 'edit_quote', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Quotes', exact: true }).click();

  await page.waitForURL('**/quotes');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createQuote({ page });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/quotes/**/edit');

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

  const actions = useQuotesActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('quotes@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  await createQuote({ page });

  await checkEditPage(page, true, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'quoteActionDropdown', '', true);

  await logout(page);
});

test('convert_to_invoice, convert_to_project and all clone actions displayed with creation permissions', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useQuotesActions({
    permissions: [
      'create_invoice',
      'create_project',
      'create_quote',
      'create_recurring_invoice',
      'create_purchase_order',
    ],
  });

  await login(page);
  await clear('quotes@example.com');
  await set(
    'create_invoice',
    'create_project',
    'create_quote',
    'create_recurring_invoice',
    'create_purchase_order',
    'create_client'
  );
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  await createQuote({ page, isTableEditable: false });

  await checkEditPage(page, true, false);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'quoteActionDropdown', '', true);

  await logout(page);
});

test('cloning quote', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('quotes@example.com');
  await set('create_quote', 'edit_quote', 'create_client');
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Quotes', exact: true })
    .click();

  await page.waitForURL('**/quotes');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createQuote({ page });

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

  await page.getByText('Clone to Quote').first().click();

  await page.waitForURL('**/quotes/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created quote')).toBeVisible();

  await page.waitForURL('**/quotes/**/edit');

  await expect(
    page.getByRole('heading', { name: 'Edit Quote' }).first()
  ).toBeVisible();
});

test('Convert to Invoice and Convert to Project displayed with admin permission', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const customActions = useCustomQuoteActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('quotes@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  await createQuote({ page });

  await checkEditPage(page, true, true);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Quotes', exact: true })
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

test('Convert to Invoice and Convert to Project displayed with creation permissions', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const customActions = useCustomQuoteActions({
    permissions: [
      'create_quote',
      'create_project',
      'create_client',
      'view_client',
    ],
  });

  await login(page);
  await clear('quotes@example.com');
  await set(
    'create_quote',
    'create_project',
    'edit_quote',
    'create_client',
    'view_client'
  );
  await save();
  await logout(page);

  await login(page, 'quotes@example.com', 'password');

  await createQuote({ page });

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Quotes', exact: true })
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

test('Select client message', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Quotes', exact: true })
    .click();

  await page.getByRole('main').getByRole('link', { name: 'New Quote' }).click();

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
