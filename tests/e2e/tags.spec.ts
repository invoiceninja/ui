import { login, logout, waitForTableData } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  extractIdFromUrl,
} from '$tests/e2e/fixtures';
import { bulkAction, type EntityType } from '$tests/e2e/api-helpers';
import { Page } from '@playwright/test';

resetAccountBeforeAll();

/**
 * Tags live under Settings -> Tags in one resourceful DataTable backed by
 * /api/v1/tags. The table can be narrowed to global, task, or project tags
 * with the Type dropdown, which sends the entity_types query parameter.
 *
 * Tags are admin/owner-only (the blank-tag query is gated behind isAdmin), so
 * these tests run as the default owner account.
 */

// `tags` is not part of the shared EntityType union, so cast at the boundary —
// the same approach api-helpers uses for tax_rates / expense_categories.
const TAGS = 'tags' as EntityType;

type TagType = 'global' | 'tasks' | 'projects';

const TAG_ENTITY_TYPE_VALUES = [
  'global',
  'bank_transaction',
  'client',
  'credit',
  'expense',
  'invoice',
  'payment',
  'product',
  'project',
  'purchase_order',
  'quote',
  'recurring_expense',
  'recurring_invoice',
  'task',
  'transaction',
  'vendor',
];

const TAG_ENTITY_TYPE_LABELS = [
  'Global',
  'Bank Transaction',
  'Client',
  'Credit',
  'Expense',
  'Invoice',
  'Payment',
  'Product',
  'Project',
  'Purchase Order',
  'Quote',
  'Recurring Expense',
  'Recurring Invoice',
  'Task',
  'Transaction',
  'Vendor',
];

// Tag ids created during the active test, cleaned up in afterEach. Tags are not
// covered by the api fixture's automatic teardown order, so we sweep them here.
// Tests in a worker run sequentially, making this module-level array safe.
let createdTagIds: string[] = [];

test.beforeEach(() => {
  createdTagIds = [];
});

test.afterEach(async ({ api }) => {
  if (!createdTagIds.length) return;

  try {
    await bulkAction(api.context, TAGS, createdTagIds, 'archive');
    await bulkAction(api.context, TAGS, createdTagIds, 'delete');
  } catch {
    // Best-effort cleanup.
  }
});

const navigateToTags = async (page: Page) => {
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page.getByRole('link', { name: 'Tags', exact: true }).click();

  await page.waitForURL('**/settings/tags');
};

interface CreateParams {
  page: Page;
  name: string;
  type?: TagType;
}

/**
 * Create a tag through the UI and leave the page on its edit route.
 */
const createTag = async (params: CreateParams) => {
  const { page, name, type = 'tasks' } = params;

  await navigateToTags(page);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Tag', exact: true })
    .click();

  await page.waitForURL('**/settings/tags/create');

  if (type !== 'global') {
    await page.getByRole('main').getByRole('combobox').click();
    await page
      .getByRole('option', {
        name: type === 'projects' ? 'Project' : 'Task',
        exact: true,
      })
      .click();
  }

  const nameInput = page.locator('#name');
  await nameInput.waitFor({ state: 'visible', timeout: 5000 });
  await nameInput.click();
  await nameInput.fill(name);

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(page.getByText('Successfully created tag')).toBeVisible({
    timeout: 10000,
  });

  await page.waitForURL('**/settings/tags/**/edit');
};

/**
 * Filter the current tag table down to a single row by name and tick its
 * checkbox to arm the bulk-action dropdown.
 */
const selectTagRow = async (page: Page, name: string) => {
  await waitForTableData(page);

  await page.locator('#filter').fill(name);

  // #filter debounces (~300ms) before the request fires.
  await page.waitForTimeout(600);

  const checkbox = page.locator('tbody [data-cy="dataTableCheckbox"]').first();
  await checkbox.waitFor({ state: 'visible', timeout: 10000 });
  await checkbox.click();
};

const applyTagTypeFilter = async (
  page: Page,
  type: 'task' | 'project' | 'all'
) => {
  await page.getByText('Type:', { exact: true }).click();

  const selectedLabel =
    type === 'project' ? 'Project' : type === 'task' ? 'Task' : undefined;

  if (type === 'project') {
    for (const label of TAG_ENTITY_TYPE_LABELS.filter(
      (currentLabel) => currentLabel !== selectedLabel
    )) {
      await page.getByRole('option', { name: label, exact: true }).click();
    }
  } else if (type === 'task') {
    for (const label of TAG_ENTITY_TYPE_LABELS.filter(
      (currentLabel) => currentLabel !== selectedLabel
    )) {
      await page.getByRole('option', { name: label, exact: true }).click();
    }
  } else {
    for (const label of TAG_ENTITY_TYPE_LABELS.filter(
      (currentLabel) => currentLabel !== 'Project'
    )) {
      await page.getByRole('option', { name: label, exact: true }).click();
    }
  }

  await page.getByRole('button', { name: 'Apply', exact: true }).click();
};

/**
 * Open the armed bulk-action dropdown and invoke one of the resourceful
 * actions (Archive / Delete).
 *
 * Note: bulk Restore is intentionally not exercised here. The /api/v1/tags
 * index endpoint does not return archived (or deleted) tags, so an archived
 * row can never be surfaced in the table to restore it — restore is only
 * reachable per-record from the edit page (covered separately above).
 */
const runBulkAction = async (page: Page, action: 'Archive' | 'Delete') => {
  await expect(page.locator('[data-cy="bulkActionsTrigger"]')).toBeVisible({
    timeout: 10000,
  });
  await page.locator('[data-cy="bulkActionsTrigger"]').click();

  await page
    .locator('[data-cy="bulkActionsDropdown"]')
    .getByRole('button', { name: action, exact: true })
    .click();
};

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

test('can create a task tag', async ({ page, api }) => {
  await login(page);

  const name = uniqueName('task-tag');

  await createTag({ page, name });

  const tagId = extractIdFromUrl(page.url(), 'tags');
  if (tagId) createdTagIds.push(tagId);

  // The edit page renders the saved name and an active status badge.
  await expect(page.locator('#name')).toHaveValue(name);
  await expect(page.getByText('Active', { exact: true })).toBeVisible({
    timeout: 10000,
  });

  await logout(page);
});

test('can create a project tag', async ({ page, api }) => {
  await login(page);

  const name = uniqueName('project-tag');

  await createTag({ page, name, type: 'projects' });

  const tagId = extractIdFromUrl(page.url(), 'tags');
  if (tagId) createdTagIds.push(tagId);

  await expect(page.locator('#name')).toHaveValue(name);

  await logout(page);
});

test('can view a task tag from the list', async ({ page, api }) => {
  await login(page);

  const name = uniqueName('view-tag');

  const tag = await api.createEntity(TAGS, {
    name,
    entity_type: 'task',
    color: '#2196F3',
  });
  if (tag.id) createdTagIds.push(tag.id as string);

  await navigateToTags(page);

  await waitForTableData(page);

  await page.locator('#filter').fill(name);
  await page.waitForTimeout(600);

  // The name cell links through to the edit page.
  await page.getByRole('link', { name, exact: true }).first().click();

  await page.waitForURL(`**/settings/tags/${tag.id}/edit`);

  await expect(page.locator('#name')).toHaveValue(name);

  await logout(page);
});

test('can filter tags by entity type', async ({ page, api }) => {
  await login(page);

  const taskName = uniqueName('filter-task-tag');
  const projectName = uniqueName('filter-project-tag');

  const taskTag = await api.createEntity(TAGS, {
    name: taskName,
    entity_type: 'task',
    color: '#2196F3',
  });
  const projectTag = await api.createEntity(TAGS, {
    name: projectName,
    entity_type: 'project',
    color: '#93C5FD',
  });

  if (taskTag.id) createdTagIds.push(taskTag.id as string);
  if (projectTag.id) createdTagIds.push(projectTag.id as string);

  await navigateToTags(page);
  await waitForTableData(page);

  const filteredRequest = page.waitForResponse((response) => {
    const url = new URL(response.url());

    return (
      url.pathname.endsWith('/api/v1/tags') &&
      url.searchParams.get('entity_types') === 'project'
    );
  });

  await applyTagTypeFilter(page, 'project');
  await filteredRequest;

  await expect(page.getByRole('link', { name: projectName })).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByRole('link', { name: taskName })).not.toBeVisible();

  const resetRequest = page.waitForResponse((response) => {
    const url = new URL(response.url());

    return (
      url.pathname.endsWith('/api/v1/tags') &&
      url.searchParams.get('entity_types') === TAG_ENTITY_TYPE_VALUES.join(',')
    );
  });

  await applyTagTypeFilter(page, 'all');
  await resetRequest;
  await page.waitForTimeout(1700);

  await logout(page);
});

test('can edit a task tag', async ({ page, api }) => {
  await login(page);

  const name = uniqueName('edit-tag');

  await createTag({ page, name });

  const tagId = extractIdFromUrl(page.url(), 'tags');
  if (tagId) {
    createdTagIds.push(tagId);

    await page.goto(`/settings/tags/tasks/${tagId}/edit`);
    await page.waitForURL(`**/settings/tags/tasks/${tagId}/edit`);
  }

  const breadcrumbs = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(
    breadcrumbs.getByRole('link', { name: 'Tags', exact: true })
  ).toBeVisible();
  await expect(
    breadcrumbs.getByRole('link', { name: 'Task Tags', exact: true })
  ).toHaveCount(0);
  await expect(
    breadcrumbs.getByRole('link', { name: 'Edit Tag', exact: true })
  ).toBeVisible();

  const editForm = page.locator('form').filter({ has: page.locator('#name') });
  const entityTypeSelect = editForm.locator('#entity_type');
  await expect(entityTypeSelect).toBeDisabled();
  await expect(entityTypeSelect).toHaveValue('task');

  const updatedName = `${name}-updated`;

  const nameInput = page.locator('#name');
  await nameInput.click();
  await nameInput.fill(updatedName);

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(page.getByText('Successfully updated tag')).toBeVisible({
    timeout: 10000,
  });

  await expect(nameInput).toHaveValue(updatedName);

  await logout(page);
});

test('can delete a task tag from the edit page', async ({ page, api }) => {
  await login(page);

  const name = uniqueName('delete-tag');

  await createTag({ page, name });

  const tagId = extractIdFromUrl(page.url(), 'tags');
  if (tagId) createdTagIds.push(tagId);

  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await page.getByText('Delete', { exact: true }).click();

  await expect(page.getByText('Successfully deleted tag')).toBeVisible({
    timeout: 10000,
  });

  await expect(page.getByText('Deleted', { exact: true })).toBeVisible({
    timeout: 10000,
  });

  await logout(page);
});

test('can archive and restore a task tag from the edit page', async ({
  page,
  api,
}) => {
  await login(page);

  const name = uniqueName('archive-tag');

  await createTag({ page, name });

  const tagId = extractIdFromUrl(page.url(), 'tags');
  if (tagId) createdTagIds.push(tagId);

  // Archive
  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await page.getByText('Archive', { exact: true }).click();

  await expect(page.getByText('Successfully archived tag')).toBeVisible({
    timeout: 10000,
  });

  await expect(page.getByText('Archived', { exact: true })).toBeVisible({
    timeout: 10000,
  });

  // Reload for a clean actions dropdown that reflects the archived state — the
  // in-place menu keeps its open/closed state across the post-archive refetch.
  await page.reload();
  await expect(page.getByText('Archived', { exact: true })).toBeVisible({
    timeout: 10000,
  });

  // Restore
  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await page.getByText('Restore', { exact: true }).click();

  await expect(page.getByText('Successfully restored tag')).toBeVisible({
    timeout: 10000,
  });

  await expect(page.getByText('Active', { exact: true })).toBeVisible({
    timeout: 10000,
  });

  await logout(page);
});

// ---------------------------------------------------------------------------
// Bulk actions
// ---------------------------------------------------------------------------

test('bulk actions dropdown shows archive and delete for active tags', async ({
  page,
  api,
}) => {
  await login(page);

  const name = uniqueName('bulk-actions-tag');

  const { id: createdId } = await api.createEntity(TAGS, {
    name,
    entity_type: 'task',
  });
  if (createdId) createdTagIds.push(createdId as string);

  await navigateToTags(page);

  await selectTagRow(page, name);

  await expect(page.locator('[data-cy="bulkActionsTrigger"]')).toBeVisible({
    timeout: 10000,
  });
  await page.locator('[data-cy="bulkActionsTrigger"]').click();

  const dropdown = page.locator('[data-cy="bulkActionsDropdown"]');

  await expect(
    dropdown.getByRole('button', { name: 'Archive', exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(
    dropdown.getByRole('button', { name: 'Delete', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await logout(page);
});

test('can bulk archive tags', async ({ page, api }) => {
  await login(page);

  const name = uniqueName('bulk-archive-tag');

  const { id: createdId } = await api.createEntity(TAGS, {
    name,
    entity_type: 'task',
  });
  if (createdId) createdTagIds.push(createdId as string);

  await navigateToTags(page);

  await selectTagRow(page, name);

  await runBulkAction(page, 'Archive');

  await expect(page.getByText('Successfully archived tag')).toBeVisible({
    timeout: 10000,
  });

  await logout(page);
});

test('can bulk delete tags', async ({ page, api }) => {
  await login(page);

  const name = uniqueName('bulk-delete-tag');

  const { id: createdId } = await api.createEntity(TAGS, {
    name,
    entity_type: 'task',
  });
  if (createdId) createdTagIds.push(createdId as string);

  await navigateToTags(page);

  await selectTagRow(page, name);

  await runBulkAction(page, 'Delete');

  await expect(page.getByText('Successfully deleted tag')).toBeVisible({
    timeout: 10000,
  });

  await logout(page);
});
