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
function useCreditsActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const hasAnyClonePermission =
    hasPermission('create_credit') ||
    hasPermission('create_invoice') ||
    hasPermission('create_quote') ||
    hasPermission('create_recurring_invoice') ||
    hasPermission('create_purchase_order');

  const actions: Action[] = [
    {
      label: 'Clone To',
      visible: hasAnyClonePermission,
      modal: {
        title: 'Clone To',
        dataCyXButton: 'cloneOptionsModalXButton',
        actions: [
          {
            label: 'Credit',
            visible: hasPermission('create_credit'),
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

const checkEditPage = async (
  page: Page,
  isEditable: boolean,
  isAdmin: boolean
) => {
  await page.waitForURL('**/credits/**/edit');

  if (isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).toBeVisible({ timeout: 10000 });
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Save', exact: true })
    ).not.toBeVisible({ timeout: 10000 });
  }

  if (!isAdmin) {
    await expect(
      page
        .locator('[data-cy="tabs"]')
        .nth(1)
        .getByRole('button', { name: 'Custom Fields', exact: true })
    ).not.toBeVisible({ timeout: 10000 });
  } else {
    await expect(
      page
        .locator('[data-cy="tabs"]')
        .nth(1)
        .getByRole('button', { name: 'Custom Fields', exact: true })
    ).toBeVisible({ timeout: 10000 });
  }

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .first()
      .getByRole('link', { name: 'Documents' })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .first()
      .getByRole('link', { name: 'Settings', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .first()
      .getByRole('link', { name: 'Activity', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .locator('[data-cy="tabs"]')
      .first()
      .getByRole('link', { name: 'History', exact: true })
  ).toBeVisible({ timeout: 10000 });
};

interface CreateParams {
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
  returnCreditNumber?: boolean;
  clientName?: string;
}
const createCredit = async (params: CreateParams) => {
  const {
    page,
    isTableEditable = true,
    assignTo,
    returnCreditNumber,
    clientName,
  } = params;

  await createClient({
    page,
    withNavigation: true,
    createIfNotExist: true,
    name: clientName ?? uniqueName('cr-client'),
  });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Credits', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Credit' })
    .click();

  // Wait for client combobox options to load
  const comboboxInput = page.getByRole('combobox').first();
  await comboboxInput.click();
  const clientOption = page.getByRole('option').first();
  await clientOption.waitFor({ state: 'visible', timeout: 5000 });
  await clientOption.click();

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

  await expect(page.getByText('Successfully created credit')).toBeVisible({ timeout: 10000 });

  if (returnCreditNumber) {
    await page.waitForURL('**/credits/**/edit');

    return await page.locator('[id="number"]').inputValue();
  }
};

test("can't view credits without permission", async ({ page, api }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Credits'
  );

  await logout(page);
});

test('can view credit', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('view_credit', 'view_client');
  await save();

  const clientName = uniqueName('cr-view');
  await createCredit({ page, clientName });

  const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
  if (creditId) api.trackEntity('credits', creditId);

  await logout(page);

  await login(page, 'credits@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Credits', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, false, false);

  await logout(page);
});

test('can edit credit', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useCreditsActions({
    permissions: ['edit_credit', 'view_client'],
  });

  await login(page);
  await clear('credits@example.com');
  await set('edit_credit', 'view_client');
  await save();

  const clientName = uniqueName('cr-edit');
  await createCredit({ page, clientName });

  const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
  if (creditId) api.trackEntity('credits', creditId);

  await logout(page);

  await login(page, 'credits@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Credits', exact: true })
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
    page.getByText('Successfully updated credit', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'creditActionDropdown', '', true);

  await logout(page);
});

test('can create a credit', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useCreditsActions({
    permissions: ['create_credit'],
  });

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'create_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const clientName = uniqueName('cr-create');
  await createCredit({ page, isTableEditable: false, clientName });

  const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
  if (creditId) api.trackEntity('credits', creditId);

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated credit', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'creditActionDropdown', '', true);

  await logout(page);
});

test('can view and edit assigned credit with create_credit', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useCreditsActions({
    permissions: ['create_credit'],
  });

  await login(page);
  await clear('credits@example.com');
  await set('create_credit');
  await save();

  const clientName = uniqueName('cr-assigned');
  const creditNumber = await createCredit({
    page,
    assignTo: 'Credits Example',
    returnCreditNumber: true,
    clientName,
  });

  const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
  if (creditId) api.trackEntity('credits', creditId);

  await logout(page);

  await login(page, 'credits@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Credits', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page.getByRole('link', { name: creditNumber, exact: true }).click();

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated credit', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'creditActionDropdown', '', true);

  await logout(page);
});

test('deleting credit with edit_credit', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'edit_credit', 'create_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Credits', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/credits');

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const clientName = uniqueName('cr-del');
    await createCredit({ page, clientName });

    const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
    if (creditId) api.trackEntity('credits', creditId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted credit')).toBeVisible({ timeout: 10000 });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted credit')).toBeVisible({ timeout: 10000 });
  }
});

test('archiving credit withe edit_credit', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'edit_credit', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Credits', exact: true }).click();

  await page.waitForURL('**/credits');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const clientName = uniqueName('cr-arch');
    await createCredit({ page, clientName });

    const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
    if (creditId) api.trackEntity('credits', creditId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived credit')).toBeVisible({ timeout: 10000 });

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

    await expect(page.getByText('Successfully archived credit')).toBeVisible({ timeout: 10000 });
  }
});

test('credit documents preview with edit_credit', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'edit_credit', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Credits', exact: true }).click();

  await page.waitForURL('**/credits');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const clientName = uniqueName('cr-docprev');
    await createCredit({ page, clientName });

    const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
    if (creditId) api.trackEntity('credits', creditId);
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/credits/**/edit');

  await page
    .locator('[data-cy="tabs"]')
    .first()
    .getByRole('link', { name: 'Documents' })
    .first()
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible({ timeout: 10000 });
});

test('credit documents uploading with edit_credit', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'edit_credit', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Credits', exact: true }).click();

  await page.waitForURL('**/credits');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const clientName = uniqueName('cr-docup');
    await createCredit({ page, clientName });

    const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
    if (creditId) api.trackEntity('credits', creditId);
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/credits/**/edit');

  await page
    .locator('[data-cy="tabs"]')
    .first()
    .getByRole('link', { name: 'Documents' })
    .first()
    .click();

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

  const actions = useCreditsActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('credits@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const clientName = uniqueName('cr-admin');
  await createCredit({ page, clientName });

  const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
  if (creditId) api.trackEntity('credits', creditId);

  await checkEditPage(page, true, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'creditActionDropdown', '', true);

  await logout(page);
});

test('all clone actions displayed with creation permissions', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useCreditsActions({
    permissions: [
      'create_credit',
      'create_invoice',
      'create_quote',
      'create_recurring_invoice',
      'create_purchase_order',
    ],
  });

  await login(page);
  await clear('credits@example.com');
  await set(
    'create_credit',
    'create_invoice',
    'create_quote',
    'create_recurring_invoice',
    'create_purchase_order',
    'create_client'
  );
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const clientName = uniqueName('cr-clone-actions');
  await createCredit({ page, isTableEditable: false, clientName });

  const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
  if (creditId) api.trackEntity('credits', creditId);

  await checkEditPage(page, true, false);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'creditActionDropdown', '', true);

  await logout(page);
});

test('cloning credit', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'edit_credit', 'create_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Credits', exact: true })
    .click();

  await page.waitForURL('**/credits');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    const clientName = uniqueName('cr-clone');
    await createCredit({ page, clientName });

    const creditId = page.url().match(/credits\/([^/]+)/)?.[1];
    if (creditId) api.trackEntity('credits', creditId);

    await page.locator('[data-cy="chevronDownButton"]').first().click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();
  }

  // Open clone modal then select Credit
  await page.getByText('Clone To').first().click();
  await page.getByText('Credit', { exact: true }).first().click();

  await page.waitForURL('**/credits/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created credit')).toBeVisible({ timeout: 10000 });

  await page.waitForURL('**/credits/**/edit');

  const clonedCreditId = page.url().match(/credits\/([^/]+)/)?.[1];
  if (clonedCreditId) api.trackEntity('credits', clonedCreditId);

  await expect(
    page.getByRole('heading', { name: 'Edit Credit' }).first()
  ).toBeVisible({ timeout: 10000 });
});
