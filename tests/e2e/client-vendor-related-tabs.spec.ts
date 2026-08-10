import { login, waitForTableData } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { request as playwrightRequest, type Page } from '@playwright/test';
import { type EntityType } from '$tests/e2e/api-helpers';

resetAccountBeforeAll();

test('client show tabs list related sales, project, task, and expense records', async ({
  page,
  api,
}) => {
  test.setTimeout(120000);

  const client = await createClient(api, 'related-client');
  const invoice = await createDocument(api, 'invoices', {
    client_id: client.id,
    line_items: [lineItem(uniqueName('client-invoice-item'), 10)],
  });
  const quote = await createDocument(api, 'quotes', {
    client_id: client.id,
    line_items: [lineItem(uniqueName('client-quote-item'), 11)],
  });
  const payment = await api.createEntity('payments', {
    client_id: client.id,
    amount: 12.34,
    date: '2026-06-09',
  });
  const credit = await createDocument(api, 'credits', {
    client_id: client.id,
    line_items: [lineItem(uniqueName('client-credit-item'), 13)],
  });
  const project = await api.createEntity('projects', {
    client_id: client.id,
    name: uniqueName('related-project'),
  });
  const task = await createFromBlank(api, 'tasks', {
    client_id: client.id,
    description: uniqueName('related-task'),
    is_date_based: true,
    date: '2026-06-09',
    time_log: '[]',
  });
  const expense = await createFromBlank(api, 'expenses', {
    client_id: client.id,
    amount: 21.43,
    date: '2026-06-09',
    public_notes: uniqueName('related-client-expense'),
  });

  await login(page);

  await expectRelatedTable(page, `/clients/${client.id}`, invoice.number);
  await expectRelatedTable(page, `/clients/${client.id}/quotes`, quote.number);
  await expectRelatedTable(page, `/clients/${client.id}/payments`, /12\.34/);
  await expectRelatedTable(page, `/clients/${client.id}/credits`, credit.number);
  await expectRelatedTable(
    page,
    `/clients/${client.id}/projects`,
    project.name as string
  );
  await expectRelatedTable(
    page,
    `/clients/${client.id}/tasks`,
    task.description as string
  );
  await expectRelatedTable(page, `/clients/${client.id}/expenses`, /21\.43/);
});

test('vendor show tabs list related purchase order and expense records', async ({
  page,
  api,
}) => {
  test.setTimeout(90000);

  const vendor = await createVendor(api, 'related-vendor');
  const purchaseOrder = await createDocument(api, 'purchase_orders', {
    vendor_id: vendor.id,
    line_items: [lineItem(uniqueName('vendor-po-item'), 14)],
  });
  const expense = await createFromBlank(api, 'expenses', {
    vendor_id: vendor.id,
    amount: 31.45,
    date: '2026-06-09',
    public_notes: uniqueName('related-vendor-expense'),
  });
  const recurringExpense = await createFromBlank(api, 'recurring_expenses', {
    vendor_id: vendor.id,
    amount: 41.56,
    date: '2026-06-09',
    frequency_id: '5',
    public_notes: uniqueName('related-vendor-recurring-expense'),
  });

  await login(page);

  await expectRelatedTable(
    page,
    `/vendors/${vendor.id}`,
    purchaseOrder.number
  );
  await expectRelatedTable(page, `/vendors/${vendor.id}/expenses`, /31\.45/);
  await expectRelatedTable(
    page,
    `/vendors/${vendor.id}/recurring_expenses`,
    /41\.56/
  );
});

async function expectRelatedTable(
  page: Page,
  route: string,
  expectedText: string | RegExp
) {
  await page.goto(route);
  await page.waitForURL(`**${route}`);

  await waitForTableData(page);
  await expect(page.locator('[data-cy="dataTable"] tbody')).toContainText(
    expectedText,
    { timeout: 10000 }
  );
}

async function createClient(api: ApiFixture, prefix: string) {
  const name = uniqueName(prefix);
  const client = await api.createEntity('clients', {
    name,
    contacts: [
      {
        first_name: 'Related',
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
        first_name: 'Related',
        last_name: 'Vendor',
        email: `${name}@example.test`,
      },
    ],
  });

  return { id: vendor.id as string, name: vendor.name as string };
}

function lineItem(productKey: string, cost: number) {
  return {
    product_key: productKey,
    notes: productKey + ' notes',
    cost,
    quantity: 1,
  };
}

async function createDocument(
  api: ApiFixture,
  type: Extract<
    EntityType,
    'invoices' | 'quotes' | 'credits' | 'purchase_orders'
  >,
  overrides: Record<string, unknown>
) {
  return createFromBlank(api, type, {
    date: '2026-06-09',
    ...overrides,
  });
}

async function createFromBlank(
  api: ApiFixture,
  type: EntityType,
  overrides: Record<string, unknown>
) {
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
    const response = await context.post(`/api/v1/${type}`, {
      headers: api.context.headers,
      data: {
        ...blank,
        ...overrides,
      },
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
      api.trackEntity(type, entity.id);
    }

    return entity as Record<string, any>;
  } finally {
    await context.dispose();
  }
}
