import { login } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { request as playwrightRequest, type Locator, type Page } from '@playwright/test';

resetAccountBeforeAll();

function getCustomSelectByLabel(page: Page, labelText: string): Locator {
  return page
    .locator('dt')
    .filter({ hasText: new RegExp(`^${labelText}$`) })
    .locator('..')
    .locator('dd');
}

async function openCustomSelect(page: Page, labelText: string) {
  const dd = getCustomSelectByLabel(page, labelText);
  await dd.locator('svg').last().click();
}

async function selectCustomOption(
  page: Page,
  labelText: string,
  optionText: string
) {
  await openCustomSelect(page, labelText);
  await page.getByText(optionText, { exact: true }).click();
}

test('report previews render seeded client, vendor, and task data', async ({
  page,
  api,
}) => {
  test.setTimeout(120000);

  const client = await createClient(api, 'preview-client');
  const vendor = await createVendor(api, 'preview-vendor');
  const task = await createTask(api, client.id, uniqueName('preview-task'));

  await login(page);
  await page.goto('/reports');
  await page.waitForURL('**/reports');

  await previewReport(page, 'Client', client.name);
  await previewReport(page, 'Vendor', vendor.name);
  await previewReport(page, 'Task', task.description);
});

async function previewReport(
  page: Page,
  reportLabel: string,
  expectedText: string
) {
  await selectCustomOption(page, 'Report', reportLabel);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Actions', exact: true })
    .click();

  const previewResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/reports/preview/') &&
      response.request().method() === 'POST' &&
      response.status() === 200,
    { timeout: 30000 }
  );

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Preview', exact: true })
    .click();

  await previewResponse;

  const previewTable = page.locator('#preview-table');
  await expect(previewTable).toBeVisible({ timeout: 10000 });
  await expect(previewTable).toContainText(expectedText, { timeout: 10000 });
  await expect(
    previewTable.getByRole('button', {
      name: 'Download CSV file',
      exact: true,
    })
  ).toBeVisible();
}

async function createClient(api: ApiFixture, prefix: string) {
  const name = uniqueName(prefix);
  const client = await api.createEntity('clients', {
    name,
    contacts: [
      {
        first_name: 'Preview',
        last_name: 'Client',
        email: `${name}@example.test`,
      },
    ],
  });

  return { id: client.id as string, name: client.name as string };
}

async function createVendor(api: ApiFixture, prefix: string) {
  const name = uniqueName(prefix);
  const vendor = await api.createEntity('vendors', {
    name,
    contacts: [
      {
        first_name: 'Preview',
        last_name: 'Vendor',
        email: `${name}@example.test`,
      },
    ],
  });

  return { id: vendor.id as string, name: vendor.name as string };
}

async function createTask(
  api: ApiFixture,
  clientId: string,
  description: string
) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const blankResponse = await context.get('/api/v1/tasks/create', {
      headers: api.context.headers,
    });

    if (!blankResponse.ok()) {
      throw new Error('Failed to fetch blank task: ' + blankResponse.status());
    }

    const blank = (await blankResponse.json()).data;
    const response = await context.post('/api/v1/tasks', {
      headers: api.context.headers,
      data: {
        ...blank,
        client_id: clientId,
        description,
        is_date_based: true,
        date: '2026-06-09',
        time_log: '[]',
      },
    });

    if (!response.ok()) {
      throw new Error('Failed to create task: ' + response.status());
    }

    const task = (await response.json()).data;
    api.trackEntity('tasks', task.id);

    return task as { id: string; description: string };
  } finally {
    await context.dispose();
  }
}
