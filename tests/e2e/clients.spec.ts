import {
  Permission,
  checkDropdownActions,
  checkTableEditability,
  login,
  logout,
  permissions,
  useHasPermission,
} from '$tests/e2e/helpers';
import { test, expect, uniqueName, type ApiFixture } from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';

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

  const actions: Action[] = [
    { label: 'Settings', visible: isAdmin },
    {
      label: 'New Invoice',
      visible: hasPermission('create_invoice'),
    },
    { label: 'Enter Payment', visible: hasPermission('create_payment') },
    { label: 'New Quote', visible: hasPermission('create_quote') },
    { label: 'Enter Credit', visible: hasPermission('create_credit') },
    { label: 'Merge', visible: isAdmin },
    { label: 'Purge', visible: isAdmin },
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

  await page.waitForTimeout(200);

  await page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox').fill(clientName);
  // await page.locator('#name').fill(clientName);
  await page.locator('#first_name_0').fill('First Name');
  await page.locator('#last_name_0').fill('Last Name');
  await page.locator('#email_0').fill(email || 'first@example.com');

  if (assignTo) {
    await page
      .locator('select[id="assigned_user_id"]')
      .selectOption({ label: assignTo });
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created client', { exact: true })
  ).toBeVisible();

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
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Address' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Contacts' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Standing' })
      .first()
  ).toBeVisible();

  if (!isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Edit', exact: true })
    ).not.toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'Edit', exact: true })
    ).toBeVisible();
  }
};

const checkEditPage = async (page: Page) => {
  await page.waitForURL('**/clients/**/edit');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Company Details', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Contacts', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Address', exact: true })
  ).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Additional Info', exact: true })
  ).toBeVisible();
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
  ).toBeVisible();

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
  ).toBeVisible();

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
  ).toBeVisible();

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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createClient({ page, api, withNavigation: false });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted client')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted client')).toBeVisible();
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createClient({ page, api, withNavigation: false });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived client')).toBeVisible();

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

    await expect(page.getByText('Successfully archived client')).toBeVisible();
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

  await expect(
    page.getByRole('heading', { name: 'Confirmation' })
  ).toBeVisible();

  await page.getByLabel('Current Password').fill('password');
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByText('Successfully purged client')).toBeVisible();

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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

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
    .getByRole('button', {
      name: 'Documents',
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

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

  await checkDropdownActions(page, actions, 'clientActionDropdown', '', true);

  await logout(page);
});

test('Merge client action', async ({ page, api }) => {
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

  await expect(page.getByText('Merge Into')).toBeVisible();

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

  await expect(page.getByText('Merge Into')).not.toBeVisible();
  await expect(page.getByText('Successfully merged client')).toBeVisible();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await expect(page.getByText('firstMerge@example.com')).toBeVisible();
  await expect(page.getByText('secondMerge@example.com')).not.toBeVisible();

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

  await page.waitForTimeout(100);

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
  await expect(page.getByText('Successfully created group')).toBeVisible();

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
  await expect(page.getByText('Successfully updated group')).toBeVisible();

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

  await page
    .locator('#group_settings_id')
    .selectOption({ label: groupName });

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Successfully updated client')).toBeVisible();

  await page.waitForURL('**/clients/**');

  await page.waitForTimeout(200);

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
  await expect(page.getByText('Successfully updated settings')).toBeVisible();

  await page
    .getByRole('link', { name: 'Clients', exact: true })
    .first()
    .click();

  await page
    .getByRole('link', { name: clientName, exact: true })
    .first()
    .click();

  await page.waitForTimeout(200);

  await expect(page.locator('[data-cy="settingsTestingSpan"]')).toContainText(
    'Client: true'
  );

  await logout(page);
});
