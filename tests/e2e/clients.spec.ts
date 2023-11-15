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

export interface Action {
  label: string;
  visible: boolean;
}

interface Params {
  isAdmin: boolean;
  permissions: Permission[];
}
export function useClientActions(params: Params) {
  const { isAdmin, permissions } = params;

  const hasPermission = useHasPermission({ permissions, isAdmin });

  const actions: Action[] = [
    { label: 'Settings', visible: isAdmin },
    {
      label: 'New Invoice',
      visible: hasPermission('create_invoice'),
    },
    { label: 'New Payment', visible: hasPermission('create_payment') },
    { label: 'New Quote', visible: hasPermission('create_quote') },
    { label: 'New Credit', visible: hasPermission('create_credit') },
    { label: 'Merge', visible: isAdmin },
    { label: 'Purge', visible: isAdmin },
  ];

  return actions;
}

const createClient = async (
  page: Page,
  clientName?: string,
  assignTo?: string
) => {
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Client' })
    .click();

  await page.locator('#name').fill(clientName || 'Company Name');
  await page.locator('#first_name_0').fill('First Name');
  await page.locator('#last_name_0').fill('Last Name');
  await page.locator('#email_0').fill('first@example.com');

  if (assignTo) {
    await page
      .locator('select[id="assigned_user_id"]')
      .selectOption({ label: assignTo });
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(
    page.getByText('Successfully created client', { exact: true })
  ).toBeVisible();
};

test.skip("can't view clients without permission", async ({ page }) => {
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

test.skip('can view client', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('view_client');
  await save();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await createClient(page, 'test view client');

  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: 'test view client', exact: true })
    .first()
    .click();

  await page.waitForURL('**/clients/**');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('link', { name: 'Edit Client', exact: true })
  ).not.toBeVisible();

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'More Actions', exact: true })
  ).not.toBeVisible();

  await logout(page);
});

test.skip('can edit client', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useClientActions({
    permissions: ['edit_client'],
    isAdmin: false,
  });

  await login(page);
  await clear('clients@example.com');
  await set('edit_client');
  await save();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await createClient(page, 'test edit client');

  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await checkTableEditability(page, true);

  await page
    .getByRole('link', { name: 'test edit client', exact: true })
    .first()
    .click();

  await page.waitForURL('**/clients/**');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('link', { name: 'Edit Client', exact: true })
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'More Actions', exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('link', { name: 'Edit Client', exact: true })
    .click();

  await page.waitForURL('**/clients/**/edit');

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

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated client', { exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await checkDropdownActions(page, actions, 'clientActionDropdown');

  await logout(page);
});

test.skip('can create a client', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useClientActions({
    permissions: ['create_client'],
    isAdmin: false,
  });

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

  await createClient(page, 'test create client');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await page.waitForURL('**/clients');

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: 'test create client', exact: true })
    .first()
    .click();

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

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('link', { name: 'Edit Client', exact: true })
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'More Actions', exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('link', { name: 'Edit Client', exact: true })
    .click();

  await page.waitForURL('**/clients/**/edit');

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

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated client', { exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await checkDropdownActions(page, actions, 'clientActionDropdown');

  await page.waitForTimeout(500000);

  await logout(page);
});

test('can view and edit assigned client with create_client', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useClientActions({
    permissions: ['create_client'],
    isAdmin: false,
  });

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
  await save();

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await createClient(page, 'test assigned client', 'Clients Example');

  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: 'test assigned client', exact: true })
    .first()
    .click();

  await page.waitForURL('**/clients/**');

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('link', { name: 'Edit Client', exact: true })
  ).toBeVisible();

  await expect(
    page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'More Actions', exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('link', { name: 'Edit Client', exact: true })
    .click();

  await page.waitForURL('**/clients/**/edit');

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

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated client', { exact: true })
  ).toBeVisible();

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'More Actions', exact: true })
    .click();

  await checkDropdownActions(page, actions, 'clientActionDropdown');

  await logout(page);
});

test.skip('deleting client', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
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
    await createClient(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Restore')).toBeVisible();

    await expect(page.getByText('Purge')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();
  }

  await expect(page.getByText('Successfully deleted client')).toBeVisible();
});

test.skip('archiving client', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
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
    await createClient(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Restore')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();
  }

  await expect(page.getByText('Successfully archived client')).toBeVisible();
});

test.skip('client documents preview', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
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
    await createClient(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

  await page.waitForURL('**/clients/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await expect(
    page.getByRole('heading', { name: 'Additional Info' })
  ).toBeVisible();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test.skip('client documents uploading enabled', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
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
    await createClient(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }
  await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

  await page.waitForURL('**/clients/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
      exact: true,
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

test.skip('client documents uploading disabled', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
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
    await createClient(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }
  await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

  await page.waitForURL('**/clients/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
      exact: true,
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
