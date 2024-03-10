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
function useCreditsActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const isAdmin = permissions.includes('admin');

  const actions: Action[] = [
    {
      label: 'Schedule',
      visible: isAdmin,
    },
    {
      label: 'Clone to Credit',
      visible: hasPermission('create_credit'),
    },
    {
      label: 'Clone to Other',
      visible:
        hasPermission('create_invoice') ||
        hasPermission('create_quote') ||
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
  returnCreditNumber?: boolean;
}
const createCredit = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo, returnCreditNumber } = params;

  await createClient({ page, withNavigation: true, createIfNotExist: true });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Credits', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Credit' })
    .click();

  await page.waitForTimeout(900);

  await page.getByRole('option').first().click();

  if (assignTo) {
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByLabel('User').first().click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created credit')).toBeVisible();

  if (returnCreditNumber) {
    await page.waitForURL('**/credits/**/edit');

    return await page.locator('[id="number"]').inputValue();
  }
};

test("can't view credits without permission", async ({ page }) => {
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

test('can view credit', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('view_credit', 'view_client');
  await save();

  await createCredit({ page });

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

test('can edit credit', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useCreditsActions({
    permissions: ['edit_credit', 'view_client'],
  });

  await login(page);
  await clear('credits@example.com');
  await set('edit_credit', 'view_client');
  await save();

  await createCredit({ page });

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
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'creditActionDropdown', '', true);

  await logout(page);
});

test('can create a credit', async ({ page }) => {
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

  await createCredit({ page, isTableEditable: false });

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated credit', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'creditActionDropdown', '', true);

  await logout(page);
});

test('can view and edit assigned credit with create_credit', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useCreditsActions({
    permissions: ['create_credit'],
  });

  await login(page);
  await clear('credits@example.com');
  await set('create_credit');
  await save();

  const creditNumber = await createCredit({
    page,
    assignTo: 'Credits Example',
    returnCreditNumber: true,
  });

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
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'creditActionDropdown', '', true);

  await logout(page);
});

test('deleting credit with edit_credit', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createCredit({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted credit')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted credit')).toBeVisible();
  }
});

test('archiving credit withe edit_credit', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createCredit({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived credit')).toBeVisible();

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

    await expect(page.getByText('Successfully archived credit')).toBeVisible();
  }
});

test('credit documents preview with edit_credit', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createCredit({ page });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/credits/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('credit documents uploading with edit_credit', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createCredit({ page });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/credits/**/edit');

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

  const actions = useCreditsActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('credits@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  await createCredit({ page });

  await checkEditPage(page, true, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'creditActionDropdown', '', true);

  await logout(page);
});

test('all clone actions displayed with creation permissions', async ({
  page,
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

  await createCredit({ page, isTableEditable: false });

  await checkEditPage(page, true, false);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'creditActionDropdown', '', true);

  await logout(page);
});

test('cloning credit', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createCredit({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByText('Clone to Credit').first().click();

  await page.waitForURL('**/credits/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created credit')).toBeVisible();

  await page.waitForURL('**/credits/**/edit');

  await expect(
    page.getByRole('heading', { name: 'Edit Credit' }).first()
  ).toBeVisible();
});

test('Select client message', async ({ page }) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Credits', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Credit' })
    .click();

  await page.waitForTimeout(900);

  await expect(
    page.getByText('Please select a client.', { exact: true })
  ).toBeVisible();

  await page.getByRole('option').first().click();

  await expect(
    page.getByText('Please select a client.', { exact: true })
  ).not.toBeVisible();

  await logout(page);
});
