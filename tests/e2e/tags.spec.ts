import { login, logout, waitForTableData } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll, test,
  expect,
  uniqueName,
  extractIdFromUrl,
} from '$tests/e2e/fixtures';
import { bulkAction, type EntityType } from '$tests/e2e/api-helpers';
import { Page } from '@playwright/test';

resetAccountBeforeAll();

/**
 * Tags live under Settings → Tags and are split into two entity types,
 * surfaced as tabs: "Tasks" (/settings/tags) and "Projects"
 * (/settings/tags/projects). Each tab is a resourceful DataTable backed by
 * /api/v1/tags, so they share the standard create / edit / bulk-action
 * patterns used across the app.
 *
 * Tags are admin/owner-only (the blank-tag query is gated behind isAdmin), so
 * these tests run as the default owner account.
 */

// `tags` is not part of the shared EntityType union, so cast at the boundary —
// the same approach api-helpers uses for tax_rates / expense_categories.
const TAGS = 'tags' as EntityType;

type TagType = 'tasks' | 'projects';

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

const navigateToTags = async (page: Page, type: TagType = 'tasks') => {
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page.getByRole('link', { name: 'Tags', exact: true }).click();

  await page.waitForURL('**/settings/tags');

  if (type === 'projects') {
    // Scope to the tag-type Tabs — a "Projects" link also exists in the main
    // navigation sidebar, which would otherwise match.
    await page
      .getByLabel('Tabs')
      .getByRole('link', { name: 'Projects', exact: true })
      .click();
    await page.waitForURL('**/settings/tags/projects');
  }
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

  await navigateToTags(page, type);

  await page.getByRole('main').getByRole('link', { name: 'New Tag' }).click();

  await page.waitForURL(`**/settings/tags/${type}/create`);

  const nameInput = page.getByRole('main').getByRole('textbox').first();
  await nameInput.waitFor({ state: 'visible', timeout: 5000 });
  await nameInput.click();
  await nameInput.fill(name);

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(page.getByText('Successfully created tag')).toBeVisible({
    timeout: 10000,
  });

  await page.waitForURL(`**/settings/tags/${type}/**/edit`);
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

  const checkbox = page
    .locator('tbody [data-cy="dataTableCheckbox"]')
    .first();
  await checkbox.waitFor({ state: 'visible', timeout: 10000 });
  await checkbox.click();
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

  const tagId = extractIdFromUrl(page.url(), 'tasks');
  if (tagId) createdTagIds.push(tagId);

  // The edit page renders the saved name and an active status badge.
  await expect(page.getByRole('main').getByRole('textbox').first()).toHaveValue(
    name
  );
  await expect(page.getByText('Active', { exact: true })).toBeVisible({
    timeout: 10000,
  });

  await logout(page);
});

test('can create a project tag', async ({ page, api }) => {
  await login(page);

  const name = uniqueName('project-tag');

  await createTag({ page, name, type: 'projects' });

  const tagId = extractIdFromUrl(page.url(), 'projects');
  if (tagId) createdTagIds.push(tagId);

  await expect(page.getByRole('main').getByRole('textbox').first()).toHaveValue(
    name
  );

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

  await navigateToTags(page, 'tasks');

  await waitForTableData(page);

  await page.locator('#filter').fill(name);
  await page.waitForTimeout(600);

  // The name cell links through to the edit page.
  await page.getByRole('link', { name, exact: true }).first().click();

  await page.waitForURL(`**/settings/tags/tasks/${tag.id}/edit`);

  await expect(page.getByRole('main').getByRole('textbox').first()).toHaveValue(
    name
  );

  await logout(page);
});

test('can edit a task tag', async ({ page, api }) => {
  await login(page);

  const name = uniqueName('edit-tag');

  await createTag({ page, name });

  const tagId = extractIdFromUrl(page.url(), 'tasks');
  if (tagId) createdTagIds.push(tagId);

  const updatedName = `${name}-updated`;

  const nameInput = page.getByRole('main').getByRole('textbox').first();
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

  const tagId = extractIdFromUrl(page.url(), 'tasks');
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

  const tagId = extractIdFromUrl(page.url(), 'tasks');
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

  const { id: createdId } = await api.createEntity(TAGS, { name, entity_type: 'task' });
  if (createdId) createdTagIds.push(createdId as string);

  await navigateToTags(page, 'tasks');

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

  const { id: createdId } = await api.createEntity(TAGS, { name, entity_type: 'task' });
  if (createdId) createdTagIds.push(createdId as string);

  await navigateToTags(page, 'tasks');

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

  const { id: createdId } = await api.createEntity(TAGS, { name, entity_type: 'task' });
  if (createdId) createdTagIds.push(createdId as string);

  await navigateToTags(page, 'tasks');

  await selectTagRow(page, name);

  await runBulkAction(page, 'Delete');

  await expect(page.getByText('Successfully deleted tag')).toBeVisible({
    timeout: 10000,
  });

  await logout(page);
});
