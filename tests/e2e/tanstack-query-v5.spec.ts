import { login, waitForTableData } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
} from '$tests/e2e/fixtures';

resetAccountBeforeAll();

/**
 * Regression coverage for the React Query v5 upgrade.
 *
 * These tests exercise query loading/refetch semantics (isLoading / isFetching /
 * isPending), v5 invalidateQueries filter objects, and enabled-guarded entity
 * queries — without relying on unrelated feature behaviour.
 */

test('client list refetches after create invalidation', async ({ page, api }) => {
  const clientName = uniqueName('rq-v5-client');

  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await page.waitForURL('**/clients');
  await waitForTableData(page);

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Client', exact: true })
    .click();

  await page
    .locator('div')
    .filter({ hasText: /^Name$/ })
    .getByRole('textbox')
    .fill(clientName);

  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(
    page.getByText('Successfully created client', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  const clientId = page.url().match(/clients\/([^/]+)/)?.[1];
  if (clientId) {
    api.trackEntity('clients', clientId);
  }

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await page.waitForURL('**/clients');
  await waitForTableData(page);

  await page.locator('#filter').fill(clientName);
  await page.waitForTimeout(600);

  await expect(
    page.locator('[data-cy="dataTable"]').getByRole('link', { name: clientName })
  ).toBeVisible({ timeout: 10000 });
});

test('direct client edit route loads an enabled entity query', async ({
  page,
  api,
}) => {
  const clientName = uniqueName('rq-v5-direct');

  const { id: clientId } = await api.createEntity('clients', {
    name: clientName,
    contacts: [
      {
        first_name: 'Direct',
        last_name: 'Route',
        email: `${clientName}@example.test`,
      },
    ],
  });

  await login(page);
  await page.goto(`/clients/${clientId}/edit`);

  await expect(
    page.locator('div').filter({ hasText: /^Name$/ }).getByRole('textbox')
  ).toHaveValue(clientName, { timeout: 10000 });
});

test('data table text filter refetches and narrows results', async ({
  page,
  api,
}) => {
  const prefix = uniqueName('rq-v5-filter');
  const keepName = `${prefix}-keep`;
  const dropName = `${prefix}-drop`;

  await api.createEntity('clients', {
    name: keepName,
    contacts: [
      {
        first_name: 'Keep',
        last_name: 'Client',
        email: `${keepName}@example.test`,
      },
    ],
  });

  await api.createEntity('clients', {
    name: dropName,
    contacts: [
      {
        first_name: 'Drop',
        last_name: 'Client',
        email: `${dropName}@example.test`,
      },
    ],
  });

  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await page.waitForURL('**/clients');
  await waitForTableData(page);

  await page.locator('#filter').fill(`${prefix}-keep`);
  await page.waitForTimeout(600);

  await expect(
    page.locator('[data-cy="dataTable"]').getByRole('link', { name: keepName })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.locator('[data-cy="dataTable"]').getByRole('link', { name: dropName })
  ).toHaveCount(0);
});

test('dashboard recent activity query resolves without a stuck spinner', async ({
  page,
}) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Dashboard', exact: true })
    .click();

  await page.waitForURL('**/dashboard');

  const activityCard = page
    .getByRole('heading', { name: 'Recent Activity', exact: true })
    .locator('xpath=ancestor::div[contains(@class,"shadow-sm")]')
    .first();

  await expect(activityCard).toBeVisible({ timeout: 10000 });

  await expect(activityCard.locator('svg.animate-spin')).toHaveCount(0, {
    timeout: 15000,
  });
});

test('tag bulk delete refetches the list without a full page reload', async ({
  page,
  api,
}) => {
  const name = uniqueName('rq-v5-tag');

  const { id: tagId } = await api.createEntity('tags', {
    name,
    entity_type: 'task',
  });

  if (tagId) {
    api.trackEntity('tags', tagId as string);
  }

  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();

  await page.getByRole('link', { name: 'Tags', exact: true }).click();
  await page.waitForURL('**/settings/tags');
  await waitForTableData(page);

  await page.locator('#filter').fill(name);
  await page.waitForTimeout(600);

  const checkbox = page.locator('tbody [data-cy="dataTableCheckbox"]').first();
  await checkbox.waitFor({ state: 'visible', timeout: 10000 });
  await checkbox.click();

  await page.locator('[data-cy="bulkActionsTrigger"]').click();
  await page
    .locator('[data-cy="bulkActionsDropdown"]')
    .getByRole('button', { name: 'Delete', exact: true })
    .click();

  await expect(page.getByText('Successfully deleted tag')).toBeVisible({
    timeout: 10000,
  });

  await expect(
    page.locator('[data-cy="dataTable"]').getByRole('link', { name })
  ).toHaveCount(0, { timeout: 10000 });
});

test('invoice create page loads blank entity query without a stuck spinner', async ({
  page,
}) => {
  await login(page);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page.waitForURL('**/invoices');

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Invoice', exact: true })
    .click();

  await page.waitForURL('**/invoices/create');

  await expect(
    page.getByRole('button', { name: 'Add Item', exact: true }).first()
  ).toBeVisible({ timeout: 15000 });

  await expect(page.locator('main svg.animate-spin')).toHaveCount(0, {
    timeout: 15000,
  });
});
