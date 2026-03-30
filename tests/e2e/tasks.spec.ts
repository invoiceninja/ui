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
import { createApiContext, ensurePermissionUserExists } from './api-helpers';

test.beforeAll(async () => {
  const api = await createApiContext(process.env.VITE_API_URL!);
  await ensurePermissionUserExists(api, 'tasks@example.com', 'Tasks', 'Example');
});

interface Params {
  permissions: Permission[];
}
function useTasksActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Invoice Task',
      visible: hasPermission('create_invoice'),
    },
    {
      label: 'Clone',
      visible: hasPermission('create_task'),
    },
  ];

  return actions;
}

function useCustomTaskActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Invoice Task',
      visible: hasPermission('create_invoice'),
    },
  ];

  return actions;
}

const checkEditPage = async (
  page: Page,
  isEditable: boolean,
  _isAdmin: boolean
) => {
  await page.waitForURL('**/tasks/**/edit');

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
};

interface CreateParams {
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
}
const createTask = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo } = params;

  await createClient({
    page,
    withNavigation: true,
    createIfNotExist: true,
    name: uniqueName('task-client'),
  });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Tasks', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page.getByRole('main').getByRole('link', { name: 'New Task' }).click();

  await page.waitForTimeout(500);

  // Select client from combobox
  await page.locator('[data-testid="combobox-input-field"]').first().click();
  const clientOption = page.getByRole('option').first();
  await clientOption.waitFor({ state: 'visible', timeout: 5000 });
  await clientOption.click();

  if (assignTo) {
    await page.locator('[data-testid="combobox-input-field"]').nth(2).click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created task')).toBeVisible();
};

test("can't view tasks without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('tasks@example.com');
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Tasks'
  );

  await logout(page);
});

test('can view task', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('tasks@example.com');
  await set('view_task', 'view_client');
  await save();

  await createTask({ page });

  const id = page.url().match(/tasks\/([^/]+)/)?.[1];
  if (id) api.trackEntity('tasks', id);

  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Tasks', exact: true })
    .click();

  await checkTableEditability(page, false);

  const tableRow = page.locator('tbody').first().getByRole('row').first();

  await tableRow.getByRole('link').first().click();

  await checkEditPage(page, false, false);

  await logout(page);
});

test('can edit task', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useTasksActions({
    permissions: ['edit_task', 'view_client'],
  });

  await login(page);
  await clear('tasks@example.com');
  await set('edit_task', 'view_client');
  await save();

  await createTask({ page });

  const id = page.url().match(/tasks\/([^/]+)/)?.[1];
  if (id) api.trackEntity('tasks', id);

  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Tasks', exact: true })
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
    page.getByText('Successfully updated task', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'taskActionDropdown', '', true);

  await logout(page);
});

test('can create a task', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const actions = useTasksActions({
    permissions: ['create_task'],
  });

  await login(page);
  await clear('tasks@example.com');
  await set('create_task', 'create_client');
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  await createTask({ page, isTableEditable: false });

  const id = page.url().match(/tasks\/([^/]+)/)?.[1];
  if (id) api.trackEntity('tasks', id);

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated task', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'taskActionDropdown', '', true);

  await logout(page);
});

test('can view and edit assigned task with create_task', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useTasksActions({
    permissions: ['create_task'],
  });

  await login(page);
  await clear('tasks@example.com');
  await set('create_task');
  await save();

  await createTask({ page, assignTo: 'Tasks Example' });

  const id = page.url().match(/tasks\/([^/]+)/)?.[1];
  if (id) api.trackEntity('tasks', id);

  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Tasks', exact: true })
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
    page.getByText('Successfully updated task', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'taskActionDropdown', '', true);

  await logout(page);
});

test('deleting task with edit_task', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('tasks@example.com');
  await set('create_task', 'edit_task', 'create_client');
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Tasks', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/tasks');

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createTask({ page });

    const id = page.url().match(/tasks\/([^/]+)/)?.[1];
    if (id) api.trackEntity('tasks', id);

    const moreActionsButton = page
      .locator('[data-cy="chevronDownButton"]')
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted task')).toBeVisible();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted task')).toBeVisible();
  }
});

test('archiving task withe edit_task', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('tasks@example.com');
  await set('create_task', 'edit_task', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Tasks', exact: true }).click();

  await page.waitForURL('**/tasks');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createTask({ page });

    const id = page.url().match(/tasks\/([^/]+)/)?.[1];
    if (id) api.trackEntity('tasks', id);

    const moreActionsButton = page
      .locator('[data-cy="chevronDownButton"]')
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived task')).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Restore', exact: true })
    ).toBeVisible();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived task')).toBeVisible();
  }
});

test('task documents preview with edit_task', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('tasks@example.com');
  await set('create_client', 'create_task', 'edit_task');
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Tasks', exact: true }).click();

  await page.waitForURL('**/tasks');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createTask({ page });

    const id = page.url().match(/tasks\/([^/]+)/)?.[1];
    if (id) api.trackEntity('tasks', id);
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/tasks/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/tasks/**/documents');

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('task documents uploading with edit_task', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('tasks@example.com');
  await set('create_client', 'create_task', 'edit_task');
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Tasks', exact: true }).click();

  await page.waitForURL('**/tasks');

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createTask({ page });

    const id = page.url().match(/tasks\/([^/]+)/)?.[1];
    if (id) api.trackEntity('tasks', id);
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/tasks/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await page.waitForURL('**/tasks/**/documents');

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

  const actions = useTasksActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('tasks@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  await createTask({ page });

  const id = page.url().match(/tasks\/([^/]+)/)?.[1];
  if (id) api.trackEntity('tasks', id);

  await checkEditPage(page, true, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'taskActionDropdown', '', true);

  await logout(page);
});

test('invoice_task and clone action displayed with creation permissions', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useTasksActions({
    permissions: ['create_invoice', 'create_task'],
  });

  await login(page);
  await clear('tasks@example.com');
  await set('create_invoice', 'create_task', 'create_client');
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  await createTask({ page, isTableEditable: false });

  const id = page.url().match(/tasks\/([^/]+)/)?.[1];
  if (id) api.trackEntity('tasks', id);

  await checkEditPage(page, true, false);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'taskActionDropdown', '', true);

  await logout(page);
});

test('cloning task', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('tasks@example.com');
  await set('create_task', 'edit_task', 'create_client');
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Tasks', exact: true })
    .click();

  await page.waitForURL('**/tasks');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  const doRecordsExist = await waitForTableData(page);

  if (!doRecordsExist) {
    await createTask({ page });

    const id = page.url().match(/tasks\/([^/]+)/)?.[1];
    if (id) api.trackEntity('tasks', id);

    await page.locator('[data-cy="chevronDownButton"]').first().click();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('Actions') })
      .first()
      .click();
  }

  await page.getByText('Clone').first().click();

  await page.waitForURL('**/tasks/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created task')).toBeVisible();

  await page.waitForURL('**/tasks/**/edit');

  const clonedId = page.url().match(/tasks\/([^/]+)/)?.[1];
  if (clonedId) api.trackEntity('tasks', clonedId);

  await expect(
    page.getByRole('heading', { name: 'Edit Task' }).first()
  ).toBeVisible();
});

test('Invoice Task displayed with admin permission', async ({ page, api }) => {
  const { clear, save, set } = permissions(page);

  const customActions = useCustomTaskActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('tasks@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  await createTask({ page });

  const id = page.url().match(/tasks\/([^/]+)/)?.[1];
  if (id) api.trackEntity('tasks', id);

  await checkEditPage(page, true, true);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Tasks', exact: true })
    .click();

  await page.waitForTimeout(500);

  await page.locator('[data-cy="dataTableCheckbox"]').first().click();

  // Wait for bulk actions button to appear after checkbox selection
  await page
    .locator('[data-cy="dataTable"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .first()
    .waitFor({ state: 'visible', timeout: 5000 });

  await checkDropdownActions(
    page,
    customActions,
    'bulkActionsDropdown',
    'dataTable'
  );

  await logout(page);
});

test('Invoice Task displayed with creation permissions', async ({
  page,
  api,
}) => {
  const { clear, save, set } = permissions(page);

  const customActions = useCustomTaskActions({
    permissions: ['create_invoice'],
  });

  await login(page);
  await clear('tasks@example.com');
  await set(
    'create_task',
    'create_invoice',
    'edit_task',
    'create_client',
    'view_client'
  );
  await save();
  await logout(page);

  await login(page, 'tasks@example.com', 'password');

  await createTask({ page });

  const id = page.url().match(/tasks\/([^/]+)/)?.[1];
  if (id) api.trackEntity('tasks', id);

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Tasks', exact: true })
    .click();

  await page.waitForTimeout(500);

  await page.locator('[data-cy="dataTableCheckbox"]').first().click();

  // Wait for bulk actions button to appear after checkbox selection
  await page
    .locator('[data-cy="dataTable"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .first()
    .waitFor({ state: 'visible', timeout: 5000 });

  await checkDropdownActions(
    page,
    customActions,
    'bulkActionsDropdown',
    'dataTable'
  );

  await logout(page);
});
