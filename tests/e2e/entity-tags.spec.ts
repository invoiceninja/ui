import { login } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { type EntityType } from '$tests/e2e/api-helpers';
import { request as playwrightRequest, type Page } from '@playwright/test';

resetAccountBeforeAll();

const TAGS = 'tags' as EntityType;

async function createEntity(
  api: ApiFixture,
  type: EntityType,
  overrides: Record<string, unknown> = {}
): Promise<Record<string, unknown>> {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const blankResponse = await context.get(`/api/v1/${type}/create`, {
      headers: api.context.headers,
    });

    if (!blankResponse.ok()) {
      throw new Error(
        `Failed to fetch blank ${type} (${blankResponse.status()}): ${(
          await blankResponse.text()
        ).slice(0, 300)}`
      );
    }

    const blank = (await blankResponse.json()).data;

    // /create returns line_items as the string "[]"; the store endpoint needs an array.
    const payload = { ...blank, ...overrides };
    if (typeof payload.line_items === 'string') {
      try {
        payload.line_items = JSON.parse(payload.line_items as string);
      } catch {
        payload.line_items = [];
      }
    }

    const response = await context.post(`/api/v1/${type}`, {
      headers: api.context.headers,
      data: payload,
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to create ${type} (${response.status()}): ${(
          await response.text()
        ).slice(0, 300)}`
      );
    }

    const entity = (await response.json()).data;

    if (entity?.id) {
      api.trackEntity(type, entity.id as string);
    }

    return entity;
  } finally {
    await context.dispose();
  }
}

async function createBankIntegration(
  api: ApiFixture,
  name: string
): Promise<{ id: string }> {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const response = await context.post('/api/v1/bank_integrations', {
      headers: api.context.headers,
      data: {
        bank_account_name: name,
        provider_name: 'Playwright Provider',
        bank_account_number: String(Date.now()),
        bank_account_type: 'checking',
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to create bank integration: ${await response.text()}`
      );
    }

    return (await response.json()).data;
  } finally {
    await context.dispose();
  }
}

async function createTagFromSelector(page: Page, api: ApiFixture, name: string) {
  const input = page.locator('[data-cy="tagSelectorInput"]').first();
  await input.waitFor({ state: 'visible', timeout: 15000 });

  await input.click();
  await input.fill(name);

  const tagCreated = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/tags') &&
      response.request().method() === 'POST'
  );

  await page.locator('[data-cy="createTagOption"]').first().click();

  const response = await tagCreated;
  const tagId = (await response.json())?.data?.id;
  if (tagId) api.trackEntity(TAGS, tagId as string);

  await expect(page.getByText(name, { exact: true }).first()).toBeVisible({
    timeout: 10000,
  });
}

async function saveEntity(page: Page) {
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(page.getByText('Successfully updated').first()).toBeVisible({
    timeout: 15000,
  });
}

async function assertTagPersists(
  page: Page,
  api: ApiFixture,
  editPath: string,
  entityId: string
) {
  const tagName = uniqueName('entity-tag');
  const editUrl = `/${editPath}/${entityId}/edit`;

  await page.goto(editUrl);
  await page.waitForURL(`**${editUrl}`);

  await createTagFromSelector(page, api, tagName);

  await saveEntity(page);

  // Some entities (e.g. clients) redirect to the show page after save.
  await page.goto(editUrl);
  await page.waitForURL(`**${editUrl}`);

  await expect(page.getByText(tagName, { exact: true }).first()).toBeVisible({
    timeout: 15000,
  });
}

interface EntityCase {
  label: string;
  apiType: EntityType;
  editPath: string;
  buildOverrides?: (api: ApiFixture) => Promise<Record<string, unknown>>;
}

async function withClient(api: ApiFixture) {
  const client = await createEntity(api, 'clients', {
    name: uniqueName('tag-client'),
  });

  return { client_id: client.id };
}

async function withVendor(api: ApiFixture) {
  const vendor = await createEntity(api, 'vendors', {
    name: uniqueName('tag-vendor'),
  });

  return { vendor_id: vendor.id };
}

async function withClientDocument(api: ApiFixture) {
  return {
    ...(await withClient(api)),
    line_items: [],
  };
}

const ENTITY_CASES: EntityCase[] = [
  {
    label: 'client',
    apiType: 'clients',
    editPath: 'clients',
    buildOverrides: async () => ({ name: uniqueName('tag-client') }),
  },
  {
    label: 'vendor',
    apiType: 'vendors',
    editPath: 'vendors',
    buildOverrides: async () => ({ name: uniqueName('tag-vendor') }),
  },
  {
    label: 'product',
    apiType: 'products',
    editPath: 'products',
    buildOverrides: async () => ({ product_key: uniqueName('tag-product') }),
  },
  {
    label: 'project',
    apiType: 'projects',
    editPath: 'projects',
    buildOverrides: async (api) => ({
      name: uniqueName('tag-project'),
      ...(await withClient(api)),
    }),
  },
  {
    label: 'task',
    apiType: 'tasks',
    editPath: 'tasks',
    buildOverrides: async () => ({ description: uniqueName('tag-task') }),
  },
  { label: 'expense', apiType: 'expenses', editPath: 'expenses' },
  {
    label: 'recurring expense',
    apiType: 'recurring_expenses',
    editPath: 'recurring_expenses',
    buildOverrides: async () => ({
      frequency_id: '5',
      next_send_date: new Date().toISOString().slice(0, 10),
    }),
  },
  {
    label: 'invoice',
    apiType: 'invoices',
    editPath: 'invoices',
    buildOverrides: withClientDocument,
  },
  {
    label: 'quote',
    apiType: 'quotes',
    editPath: 'quotes',
    buildOverrides: withClientDocument,
  },
  {
    label: 'credit',
    apiType: 'credits',
    editPath: 'credits',
    buildOverrides: withClientDocument,
  },
  {
    label: 'recurring invoice',
    apiType: 'recurring_invoices',
    editPath: 'recurring_invoices',
    buildOverrides: async (api) => ({
      ...(await withClientDocument(api)),
      frequency_id: '5',
      next_send_date: new Date().toISOString().slice(0, 10),
    }),
  },
  {
    label: 'payment',
    apiType: 'payments',
    editPath: 'payments',
    buildOverrides: async (api) => ({
      ...(await withClient(api)),
      amount: 10,
      date: '2026-06-09',
    }),
  },
  {
    label: 'purchase order',
    apiType: 'purchase_orders',
    editPath: 'purchase_orders',
    buildOverrides: async (api) => ({
      ...(await withVendor(api)),
      line_items: [],
    }),
  },
];

for (const entityCase of ENTITY_CASES) {
  test(`can create and persist a tag on a ${entityCase.label}`, async ({
    page,
    api,
  }) => {
    test.setTimeout(60000);
    await login(page);

    const overrides = entityCase.buildOverrides
      ? await entityCase.buildOverrides(api)
      : {};

    const entity = await createEntity(api, entityCase.apiType, overrides);

    await assertTagPersists(page, api, entityCase.editPath, entity.id as string);
  });
}

test('can create and persist a tag on a bank transaction', async ({
  page,
  api,
}) => {
  await login(page);

  const bankIntegration = await createBankIntegration(
    api,
    uniqueName('tag-bank')
  );

  const transaction = await createEntity(api, 'bank_transactions', {
    bank_integration_id: bankIntegration.id,
    amount: 10,
    base_type: 'DEBIT',
    date: '2026-06-09',
    description: uniqueName('tag-transaction'),
  });

  await assertTagPersists(page, api, 'transactions', transaction.id as string);

});
