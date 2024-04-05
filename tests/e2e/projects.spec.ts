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
function useProjectsActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Invoice Project',
      visible: hasPermission('create_invoice'),
    },
    {
      label: 'Clone',
      visible: hasPermission('create_project'),
    },
  ];

  return actions;
}

function useCustomQuoteActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Invoice Project',
      visible: hasPermission('create_invoice'),
    },
  ];

  return actions;
}

const checkEditPage = async (page: Page, isEditable: boolean) => {
  await page.waitForURL('**/projects/**/edit');

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

const checkShowPage = async (page: Page, isEditable: boolean) => {
  await page.waitForURL('**/projects/**');

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Details' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Notes' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Summary' })
      .first()
  ).toBeVisible();

  if (!isEditable) {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'More Actions', exact: true })
    ).not.toBeVisible();
  } else {
    await expect(
      page
        .locator('[data-cy="topNavbar"]')
        .getByRole('button', { name: 'More Actions', exact: true })
    ).toBeVisible();
  }
};

interface CreateParams {
  name?: string;
  page: Page;
  assignTo?: string;
  isTableEditable?: boolean;
}
const createProject = async (params: CreateParams) => {
  const { page, isTableEditable = true, assignTo, name } = params;

  await createClient({ page, withNavigation: true, createIfNotExist: true });

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();

  await checkTableEditability(page, isTableEditable);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Project' })
    .click();

  await page.waitForTimeout(500);

  await page.locator('[data-cy="name"]').fill(name ?? 'test project');

  await page.locator('[data-testid="combobox-input-field"]').first().click();

  await page.getByRole('option').first().click();

  if (assignTo) {
    await page.locator('[data-testid="combobox-input-field"]').last().click();
    await page.getByRole('option', { name: assignTo }).first().click();
  }

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created project')).toBeVisible();
};

test("can't view projects without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('projects@example.com');
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Projects'
  );

  await logout(page);
});

test('can view project', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('projects@example.com');
  await set('view_project', 'view_client');
  await save();

  await createProject({ page, name: 'test viewing project' });

  await logout(page);

  await login(page, 'projects@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: 'test viewing project', exact: true })
    .first()
    .click();

  await checkShowPage(page, false);

  await logout(page);
});

test('can edit project', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useProjectsActions({
    permissions: ['edit_project', 'view_client'],
  });

  await login(page);
  await clear('projects@example.com');
  await set('edit_project', 'view_client');
  await save();

  await createProject({ page, name: 'test editing project' });

  await logout(page);

  await login(page, 'projects@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();

  await checkTableEditability(page, true);

  await page
    .getByRole('link', { name: 'test editing project', exact: true })
    .first()
    .click();

  await checkShowPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page.getByRole('button', { name: 'Edit', exact: true }).first().click();

  await page.waitForURL('**/projects/**/edit');

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated project', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'projectActionDropdown', '', true);

  await logout(page);
});

test('can create a project', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const actions = useProjectsActions({
    permissions: ['create_project'],
  });

  await login(page);
  await clear('projects@example.com');
  await set('create_project', 'create_client');
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  await createProject({ page, isTableEditable: false });

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated project', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'projectActionDropdown', '', true);

  await logout(page);
});

test('can view and edit assigned project with create_project', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useProjectsActions({
    permissions: ['create_project'],
  });

  await login(page);
  await clear('projects@example.com');
  await set('create_project');
  await save();

  await createProject({
    page,
    assignTo: 'Projects Example',
    name: 'test assigned project',
  });

  await logout(page);

  await login(page, 'projects@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: 'test assigned project', exact: true })
    .first()
    .click();

  await checkShowPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page.getByRole('button', { name: 'Edit', exact: true }).first().click();

  await page.waitForURL('**/projects/**/edit');

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated project', { exact: true })
  ).toBeVisible();

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'projectActionDropdown', '', true);

  await logout(page);
});

test('deleting project with edit_project', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('projects@example.com');
  await set('create_project', 'edit_project', 'create_client');
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Projects', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/projects');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProject({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted project')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted project')).toBeVisible();
  }
});

test('archiving project withe edit_project', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('projects@example.com');
  await set('create_project', 'edit_project', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Projects', exact: true }).click();

  await page.waitForURL('**/projects');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProject({ page });

    const moreActionsButton = page
      .locator('[data-cy="chevronDownButton"]')
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived project')).toBeVisible();

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

    await expect(page.getByText('Successfully archived project')).toBeVisible();
  }
});

test('project documents preview with edit_project', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('projects@example.com');
  await set('create_project', 'edit_project', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Projects', exact: true }).click();

  await page.waitForURL('**/projects');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProject({ page });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/projects/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('project documents uploading with edit_project', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('projects@example.com');
  await set('create_project', 'edit_project', 'view_client', 'create_client');
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Projects', exact: true }).click();

  await page.waitForURL('**/projects');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProject({ page });
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();
  }

  await page.waitForURL('**/projects/**/edit');

  await page
    .getByRole('link', {
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

test('Invoice project and clone action in dropdown displayed with admin permission', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useProjectsActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('projects@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  await createProject({ page });

  await checkEditPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'projectActionDropdown', '', true);

  await logout(page);
});

test('Invoice project and clone action displayed with creation permissions', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const actions = useProjectsActions({
    permissions: ['create_project', 'create_invoice'],
  });

  await login(page);
  await clear('projects@example.com');
  await set('create_project', 'create_invoice', 'create_client');
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  await createProject({ page, isTableEditable: false });

  await checkEditPage(page, true);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await checkDropdownActions(page, actions, 'projectActionDropdown', '', true);

  await logout(page);
});

test('cloning project', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('projects@example.com');
  await set('create_project', 'edit_project', 'create_client');
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();

  await page.waitForURL('**/projects');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProject({ page });

    await page.locator('[data-cy="chevronDownButton"]').first().click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByText('Clone').first().click();

  await page.waitForURL('**/projects/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created project')).toBeVisible();

  await page.waitForURL('**/projects/**/edit');

  await expect(
    page.getByRole('heading', { name: 'Edit project' }).first()
  ).toBeVisible();
});

test('Invoice Project displayed with admin permission', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  const customActions = useCustomQuoteActions({
    permissions: ['admin'],
  });

  await login(page);
  await clear('projects@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  await createProject({ page });

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Projects', exact: true })
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

test('Invoice Project displayed with creation permissions', async ({
  page,
}) => {
  const { clear, save, set } = permissions(page);

  const customActions = useCustomQuoteActions({
    permissions: [
      'create_invoice',
      'create_project',
      'edit_project',
      'create_client',
      'view_client',
    ],
  });

  await login(page);
  await clear('projects@example.com');
  await set(
    'create_invoice',
    'create_project',
    'edit_project',
    'create_client',
    'view_client'
  );
  await save();
  await logout(page);

  await login(page, 'projects@example.com', 'password');

  await createProject({ page });

  await checkEditPage(page, true);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Projects', exact: true })
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
