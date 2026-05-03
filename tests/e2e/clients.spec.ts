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
import { test, expect, uniqueName, type ApiFixture } from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';
import { createApiContext, fetchEntityIds } from './api-helpers';

interface ModalAction {
  label: string;
  visible: boolean;
}

interface Modal {
  title: string;
  actions: ModalAction[];
  dataCyXButton: string;
}

export interface Action {
  label: string;
  visible: boolean;
  modal?: Modal;
}

interface Params {
  permissions: Permission[];
}
function useClientActions({ permissions }: Params) {
  const isAdmin = permissions.includes('admin');

  const hasPermission = useHasPermission({ permissions });

  const hasAnyCreationPermission =
    hasPermission('create_invoice') ||
    hasPermission('create_payment') ||
    hasPermission('create_quote') ||
    hasPermission('create_credit');

  const actions: Action[] = [
    { label: 'View Statement', visible: true },
    { label: 'Settings', visible: isAdmin },
    {
      label: 'New Resource',
      visible: hasAnyCreationPermission,
      modal: {
        title: 'New Resource',
        dataCyXButton: 'cloneOptionsModalXButton',
        actions: [
          { label: 'Invoice', visible: hasPermission('create_invoice') },
          { label: 'Payment', visible: hasPermission('create_payment') },
          { label: 'Quote', visible: hasPermission('create_quote') },
          { label: 'Credit', visible: hasPermission('create_credit') },
        ],
      },
    },
    { label: 'Merge', visible: isAdmin },
  ];

  return actions;
}

interface CreateParams {
  page: Page;
  api: ApiFixture;
  isTableEditable?: boolean;
  clientName?: string;
  assignTo?: string;
  withNavigation?: boolean;
  email?: string;
}

const createClient = async (params: CreateParams) => {
  const {
    page,
    api,
    clientName = uniqueName('client'),
    assignTo,
    withNavigation = true,
    isTableEditable = true,
    email,
  } = params;

  if (withNavigation) {
    await page
      .locator('[data-cy="navigationBar"]')
      .getByRole('link', { name: 'Clients', exact: true })
      .click();

    await checkTableEditability(page, isTableEditable);
  }

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Client' })
    .click();

  await page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox').fill(clientName);
  // await page.locator('#name').fill(clientName);
  await page.locator('#first_name_0').fill('First Name');
  await page.locator('#last_name_0').fill('Last Name');
  await page.locator('#email_0').fill(email || 'first@example.com');

  if (assignTo) {
    const assignedUserInput = page.getByTestId('combobox-input-field').first();
    await assignedUserInput.scrollIntoViewIfNeeded();
    await assignedUserInput.click();
    // UserSelector label is first_name only, so search by first word
    await assignedUserInput.fill(assignTo.split(' ')[0]);

    const option = page.getByRole('option', { name: assignTo }).first();
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created client', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  const id = page.url().match(/clients\/([^/]+)/)?.[1];
  if (id) api.trackEntity('clients', id);
};

const checkShowPage = async (page: Page, isEditable: boolean) => {
  await page.waitForURL('**/clients/**');

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Details' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Address' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Contacts' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Standing' })
      .first()
  ).toBeVisible({ timeout: 10000 });

  if (!isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Edit', exact: true })
    ).not.toBeVisible({ timeout: 10000 });
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Edit', exact: true })
    ).toBeVisible({ timeout: 10000 });
  }
};

const checkEditPage = async (page: Page) => {
  await page.waitForURL('**/clients/**/edit');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: 'Company Details', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: 'Contacts', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('heading', { name: 'Address', exact: true })
  ).toBeVisible({ timeout: 10000 });

};

test("can't view clients without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Clients'
  );

  await logout(page);
});

test('can view client', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('test view client');

  await login(page);
  await clear('clients@example.com');
  await set('view_client');
  await save();

  await createClient({ page, api, clientName });

  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await page
    .getByRole('link', { name: clientName, exact: true })
    .first()
    .click();

  await checkShowPage(page, false);

  await logout(page);
});

test('can edit client', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useClientActions({
    permissions: ['edit_client'],
  });

  const clientName = uniqueName('test edit client');

  await login(page);
  await clear('clients@example.com');
  await set('edit_client');
  await save();

  await createClient({ page, api, clientName });

  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await page
    .getByRole('link', { name: clientName, exact: true })
    .first()
    .click();

  await checkShowPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Edit', exact: true })
    .click();

  await checkEditPage(page);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated client', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'clientActionDropdown', '', true);

  await logout(page);
});

test('can create a client', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useClientActions({
    permissions: ['create_client'],
  });

  const clientName = uniqueName('test create client');

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await createClient({
    page,
    api,
    clientName,
    isTableEditable: false,
  });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await page.waitForURL('**/clients');

  await page
    .getByRole('link', { name: clientName, exact: true })
    .first()
    .click();

  await checkShowPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Edit', exact: true })
    .click();

  await checkEditPage(page);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated client', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'clientActionDropdown', '', true);

  await logout(page);
});

test('can view and edit assigned client with create_client', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useClientActions({
    permissions: ['create_client'],
  });

  const clientName = uniqueName('test assigned client');

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
  await save();

  await createClient({
    page,
    api,
    clientName,
    assignTo: 'Clients Example',
  });

  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await page
    .getByRole('link', { name: clientName, exact: true })
    .first()
    .click();

  await checkShowPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Edit', exact: true })
    .click();

  await checkEditPage(page);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated client', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'clientActionDropdown', '', true);

  await logout(page);
});

test('deleting client with edit_client', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client', 'edit_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/clients');

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createClient({ page, api, withNavigation: false });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted client')).toBeVisible({ timeout: 10000 });

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible({ timeout: 10000 });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted client')).toBeVisible({ timeout: 10000 });
  }
});

test('archiving client withe edit_client', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client', 'edit_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  await page.waitForURL('**/clients');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createClient({ page, api, withNavigation: false });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived client')).toBeVisible({ timeout: 10000 });

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

    await expect(page.getByText('Successfully archived client')).toBeVisible({ timeout: 10000 });
  }
});

test("can't purge client without admin permission", async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useClientActions({
    permissions: ['create_client'],
  });

  const clientName = uniqueName('test purge client');

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await createClient({
    page,
    api,
    clientName,
    isTableEditable: false,
  });

  await checkShowPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'clientActionDropdown', '', true);

  await logout(page);
});

test('can purge client with admin permission', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const clientName = uniqueName('test purge client');

  await login(page);
  await clear('clients@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await createClient({
    page,
    api,
    clientName,
    isTableEditable: true,
  });

  await checkShowPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page.getByText('Purge', { exact: true }).click();

  const purgeModal = page.getByRole('heading', { name: 'Purge Client' });
  await purgeModal.waitFor({ state: 'visible', timeout: 5000 });

  const passwordField = page.locator('#current_password');
  if (await passwordField.isVisible({ timeout: 1000 }).catch(() => false)) {
    await passwordField.fill('password');
  }

  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('Successfully purged client')).toBeVisible({ timeout: 10000 });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();
  await page.waitForURL('**/clients');
  await page.locator('#filter').fill(clientName);
  await expect(page.getByRole('link', { name: clientName, exact: true })).toHaveCount(0);

  await logout(page);
});

test('client documents preview with edit_client', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client', 'edit_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  await page.waitForURL('**/clients');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createClient({ page, api });

    await page
      .getByRole('button')
      .filter({ has: page.getByText('Edit') })
      .click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await checkEditPage(page);

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .first()
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible({ timeout: 10000 });
});

test('client documents uploading with edit_client', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client', 'edit_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  await page.waitForURL('**/clients');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createClient({ page, api });

    await page
      .getByRole('button')
      .filter({ has: page.getByText('Edit') })
      .click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await checkEditPage(page);

  await page
    .getByRole('link', {
      name: 'Documents',
    })
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

  const actions = useClientActions({
    permissions: ['admin'],
  });

  const clientName = uniqueName('test dropdown client');

  await login(page);
  await clear('clients@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await createClient({
    page,
    api,
    clientName,
    isTableEditable: true,
  });

  await checkShowPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();
  await page.locator('[data-cy="clientActionDropdown"]').waitFor({ state: 'visible', timeout: 5000 });

  await checkDropdownActions(page, actions, 'clientActionDropdown', '', true);

  await logout(page);
});

test('New Invoice, Enter Credit, New Quote and Enter Payment displayed with creation permissions', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useClientActions({
    permissions: [
      'create_invoice',
      'create_credit',
      'create_quote',
      'create_payment',
    ],
  });

  const clientName = uniqueName('test actions client');

  await login(page);
  await clear('clients@example.com');
  await set(
    'create_client',
    'create_invoice',
    'create_credit',
    'create_quote',
    'create_payment'
  );
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await createClient({
    page,
    api,
    clientName,
    isTableEditable: false,
  });

  await checkShowPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();
  await page.locator('[data-cy="clientActionDropdown"]').waitFor({ state: 'visible', timeout: 5000 });

  await checkDropdownActions(page, actions, 'clientActionDropdown', '', true);

  await logout(page);
});

test('View Statement action opens the statement page', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);
  const clientName = uniqueName('test statement client');

  await login(page);
  await clear('clients@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await createClient({
    page,
    api,
    clientName,
    isTableEditable: true,
  });

  const clientId = page.url().match(/clients\/([^/]+)/)?.[1];
  expect(clientId).toBeTruthy();

  await page.locator('[data-cy="chevronDownButton"]').first().click();
  await page
    .locator('[data-cy="clientActionDropdown"]')
    .getByRole('link', { name: 'View Statement', exact: true })
    .click();

  await page.waitForURL('**/clients/**/statement');

  await logout(page);
});

test('Settings action opens company settings in client context', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);
  const clientName = uniqueName('test settings action client');

  await login(page);
  await clear('clients@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await createClient({
    page,
    api,
    clientName,
    isTableEditable: true,
  });

  await page.locator('[data-cy="chevronDownButton"]').first().click();
  await page
    .locator('[data-cy="clientActionDropdown"]')
    .getByRole('button', { name: 'Settings', exact: true })
    .click();

  await page.waitForURL('**/settings/company_details');
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible({
    timeout: 10000,
  });

  await logout(page);
});

test('New Resource action routes to Invoice create for selected client', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);
  const clientName = uniqueName('test new resource route client');

  await login(page);
  await clear('clients@example.com');
  await set('create_client', 'edit_client', 'create_invoice');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await createClient({
    page,
    api,
    clientName,
    isTableEditable: true,
  });

  const clientId = page.url().match(/clients\/([^/]+)/)?.[1];
  expect(clientId).toBeTruthy();
  if (!clientId) throw new Error('Failed to extract client id');

  await page.locator('[data-cy="chevronDownButton"]').first().click();
  await page
    .locator('[data-cy="clientActionDropdown"]')
    .getByRole('button', { name: 'New Resource', exact: true })
    .click();

  await expect(page.getByRole('heading', { name: 'New Resource' })).toBeVisible({
    timeout: 10000,
  });

  await page.getByRole('button', { name: 'Invoice', exact: true }).click();

  await page.waitForURL(`**/invoices/create?client=${clientId}`);

  await logout(page);
});

test('Clone action creates a new client from overview', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);
  const clientName = uniqueName('test clone client');

  await login(page);
  await clear('clients@example.com');
  await set('create_client', 'edit_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await createClient({
    page,
    api,
    clientName,
    isTableEditable: true,
  });

  const adminApi = await createApiContext(process.env.VITE_API_URL!);
  const beforeCount = (await fetchEntityIds(adminApi, 'clients')).length;

  await page.locator('[data-cy="chevronDownButton"]').first().click();
  await page
    .locator('[data-cy="clientActionDropdown"]')
    .getByRole('button', { name: 'Clone', exact: true })
    .click();

  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.waitForURL('**/clients');
  await waitForTableData(page);

  await expect
    .poll(async () => (await fetchEntityIds(adminApi, 'clients')).length, {
      timeout: 10000,
    })
    .toBeGreaterThan(beforeCount);

  await logout(page);
});

test('Add Comment action saves and displays a client comment', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);
  const clientName = uniqueName('test comment client');
  const comment = uniqueName('client-comment');

  await login(page);
  await clear('clients@example.com');
  await set('create_client', 'edit_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await createClient({
    page,
    api,
    clientName,
    isTableEditable: true,
  });

  await page.locator('[data-cy="chevronDownButton"]').first().click();
  await page
    .locator('[data-cy="clientActionDropdown"]')
    .getByRole('button', { name: 'Add Comment', exact: true })
    .click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 10000 });
  await dialog.locator('textarea').fill(comment);
  await dialog.getByRole('button', { name: 'Add', exact: true }).click();

  await expect(dialog).not.toBeVisible({ timeout: 10000 });

  await page
    .getByRole('link', { name: 'History / Activity', exact: true })
    .click();
  await page.waitForURL('**/history_and_activities');

  await expect(page.getByText(comment)).toBeVisible({ timeout: 10000 });

  await logout(page);
});

test('Merge client action', async ({ page, api }) => {

    // test.setTimeout(120000); // 2 minutes

  const mergeOneName = uniqueName('test merge one');
  const mergeTwoName = uniqueName('test merge two');

  await login(page);

  await createClient({
    page,
    api,
    clientName: mergeOneName,
    email: 'firstMerge@example.com',
  });

  await createClient({
    page,
    api,
    clientName: mergeTwoName,
    email: 'secondMerge@example.com',
  });

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page
    .getByRole('button', { name: 'Merge', exact: true })
    .first()
    .click();

  await expect(page.getByText('Merge Into')).toBeVisible({ timeout: 10000 });

  await page.locator('[data-testid="combobox-input-field"]').click();

  await page
    .locator('[data-testid="combobox-input-field"]')
    .fill('firstMerge@example.com');

  await page.getByRole('option').first().click();

  await page.getByRole('button', { name: 'Merge' }).click();

  if (await page.getByRole('heading', { name: 'Confirmation' }).isVisible()) {
    await page.getByLabel('Current password*').fill('password');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
  }

  await expect(page.getByText('Merge Into')).not.toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Successfully merged client')).toBeVisible({ timeout: 10000 });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await expect(page.getByText('firstMerge@example.com').first()).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('secondMerge@example.com').first()).not.toBeVisible({ timeout: 10000 });

  await logout(page);
});

test('Testing military_time property on all settings levels', async ({
  page,
  api,
  settingsGuard,
}) => {
  await settingsGuard.snapshot();

  const clientName = uniqueName('test settings prop');
  const groupName = uniqueName('test group');

  await login(page);

  await createClient({
    page,
    api,
    clientName,
  });

  await expect(page.locator('[data-cy="settingsTestingSpan"]')).toContainText(
    'Company: false'
  );

  await page
    .getByRole('link', { name: 'Settings', exact: true })
    .first()
    .click();

  await page
    .getByRole('link', { name: 'Group Settings', exact: true })
    .first()
    .click();

  await page
    .getByRole('link', { name: 'New Group', exact: true })
    .first()
    .click();

  await page.waitForURL('**/settings/group_settings/create');

  await page.locator('[data-cy="groupSettingsNameField"]').fill(groupName);

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Successfully created group')).toBeVisible({ timeout: 10000 });

  await api.trackEntityByName('group_settings', groupName);

  await page.getByRole('button', { name: 'Configure Settings' }).click();

  await page
    .getByRole('link', { name: 'Localization', exact: true })
    .first()
    .click();

  await page.waitForURL('**/settings/localization');

  await page.getByText('24 Hour Time').click();
  await page.locator('[data-cy="militaryTimeToggle"]').check();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Successfully updated group')).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('link', { name: 'Clients', exact: true })
    .first()
    .click();

  await page
    .getByRole('link', { name: clientName, exact: true })
    .first()
    .click();

  await page.getByRole('button', { name: 'Edit', exact: true }).first().click();

  await page.waitForURL('**/clients/**/edit');

  // Group field is a react-select custom selector
  // Find it by looking for the input near the Group label
  const groupContainer = page.locator('div:has(> dt:has-text("Group"))').first();
  const groupInput = groupContainer.locator('input[role="combobox"]');
  await groupContainer.scrollIntoViewIfNeeded();
  await groupInput.click();
  await groupInput.fill(groupName);
  await page.getByText(groupName, { exact: true }).first().waitFor({ state: 'visible', timeout: 5000 });
  await page.getByText(groupName, { exact: true }).first().click();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Successfully updated client')).toBeVisible({ timeout: 10000 });

  await page.waitForURL('**/clients/**');

  await expect(page.locator('[data-cy="settingsTestingSpan"]')).toContainText(
    'Group: true'
  );

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page
    .getByRole('button', { name: 'Settings', exact: true })
    .first()
    .click();

  await page
    .getByRole('link', { name: 'Localization', exact: true })
    .first()
    .click();

  await page.waitForURL('**/settings/localization');

  await page.getByText('24 Hour Time').click();
  await page.locator('[data-cy="militaryTimeToggle"]').check();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Successfully updated settings')).toBeVisible({ timeout: 10000 });

  await page
    .getByRole('link', { name: 'Clients', exact: true })
    .first()
    .click();

  await page
    .getByRole('link', { name: clientName, exact: true })
    .first()
    .click();

  await expect(page.locator('[data-cy="settingsTestingSpan"]')).toContainText(
    'Client: true'
  );

  await logout(page);
});
