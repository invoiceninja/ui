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
  isAdmin: boolean
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
const createTask = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo } = params;

  await createClient({ page, withNavigation: true, createIfNotExist: true });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Tasks', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page.getByRole('main').getByRole('link', { name: 'New Task' }).click();

  await page.waitForTimeout(900);

  await page.locator('[data-testid="combobox-input-field"]').first().click();

  await page.getByRole('option').first().click();

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

test('can view task', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('tasks@example.com');
  await set('view_task', 'view_client');
  await save();

  await createTask({ page });

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

test('can edit task', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useTasksActions({
    permissions: ['edit_task', 'view_client'],
  });

  await login(page);
  await clear('tasks@example.com');
  await set('edit_task', 'view_client');
  await save();

  await createTask({ page });

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

test('can create a task', async ({ page }) => {
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

test('can view and edit assigned task with create_task', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useTasksActions({
    permissions: ['create_task'],
  });

  await login(page);
  await clear('tasks@example.com');
  await set('create_task');
  await save();

  await createTask({ page, assignTo: 'Tasks Example' });

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

test('deleting task with edit_task', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createTask({ page });

    const moreActionsButton = page
      .locator('[data-cy="chevronDownButton"]')
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted task')).toBeVisible();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted task')).toBeVisible();
  }
});

test('archiving task withe edit_task', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createTask({ page });

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
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived task')).toBeVisible();
  }
});

test('task documents preview with edit_task', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createTask({ page });
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
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

test('task documents uploading with edit_task', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createTask({ page });
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
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

  await checkEditPage(page, true, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'taskActionDropdown', '', true);

  await logout(page);
});

test('invoice_task and clone action displayed with creation permissions', async ({
  page,
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

  await checkEditPage(page, true, false);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'taskActionDropdown', '', true);

  await logout(page);
});

test('cloning task', async ({ page }) => {
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

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createTask({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();
  } else {
    await tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first()
      .click();
  }

  await page.getByText('Clone').first().click();

  await page.waitForURL('**/tasks/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created task')).toBeVisible();

  await page.waitForURL('**/tasks/**/edit');

  await expect(
    page.getByRole('heading', { name: 'Edit Task' }).first()
  ).toBeVisible();
});

test('Invoice Task displayed with admin permission', async ({ page }) => {
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

  await checkEditPage(page, true, true);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Tasks', exact: true })
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

test('Invoice Task displayed with creation permissions', async ({ page }) => {
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

  await checkEditPage(page, true, false);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Tasks', exact: true })
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
