import { login, waitForTableData } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { request as playwrightRequest, type Page } from '@playwright/test';

resetAccountBeforeAll();

type ImportEntityType =
  | 'invoices'
  | 'recurring_invoices'
  | 'quotes'
  | 'purchase_orders'
  | 'payments'
  | 'bank_transactions'
  | 'tasks';

interface ImportCase {
  entityType: ImportEntityType;
  importEntity:
    | 'invoice'
    | 'recurring_invoice'
    | 'quote'
    | 'purchase_order'
    | 'payment'
    | 'bank_transaction'
    | 'task';
  route: string;
  listRoute: string;
  csv: string;
  mappings: string[];
  listSearch?: string;
  listAssertText?: string | RegExp;
  expectedApiFields: Record<string, string | number | boolean>;
  expectedAmount?: number;
  bankAccountName?: string;
}

test('imports invoices, quotes, and recurring invoices from mapped CSV files', async ({
  page,
  api,
}) => {
  await login(page);

  const invoiceClient = await createClient(api, 'import-invoice-client');
  const quoteClient = await createClient(api, 'import-quote-client');
  const recurringClient = await createClient(api, 'import-recurring-client');

  await importEntity(page, api, {
    entityType: 'invoices',
    importEntity: 'invoice',
    route: '/invoices/import',
    listRoute: '/invoices',
    csv: [
      'Client,Invoice Date,Due Date,Item,Description,Unit Cost,Quantity,Public Notes',
      [
        invoiceClient.name,
        '2026-06-09',
        '2026-06-16',
        uniqueName('invoice-item'),
        'Imported invoice line',
        '10',
        '2',
        uniqueName('imported-invoice-notes'),
      ].join(','),
    ].join('\n'),
    mappings: [
      'client.name',
      'invoice.date',
      'invoice.due_date',
      'item.product_key',
      'item.notes',
      'item.cost',
      'item.quantity',
      'invoice.public_notes',
    ],
    listSearch: invoiceClient.name,
    expectedApiFields: {
      client_id: invoiceClient.id,
      date: '2026-06-09',
      due_date: '2026-06-16',
    },
    expectedAmount: 20,
  });

  await importEntity(page, api, {
    entityType: 'quotes',
    importEntity: 'quote',
    route: '/quotes/import',
    listRoute: '/quotes',
    csv: [
      'Client,Quote Date,Item,Description,Unit Cost,Quantity,Public Notes',
      [
        quoteClient.name,
        '2026-06-09',
        uniqueName('quote-item'),
        'Imported quote line',
        '11',
        '3',
        uniqueName('imported-quote-notes'),
      ].join(','),
    ].join('\n'),
    mappings: [
      'client.name',
      'quote.date',
      'item.product_key',
      'item.notes',
      'item.cost',
      'item.quantity',
      'quote.public_notes',
    ],
    listSearch: quoteClient.name,
    expectedApiFields: {
      client_id: quoteClient.id,
      date: '2026-06-09',
    },
    expectedAmount: 33,
  });

  await importEntity(page, api, {
    entityType: 'recurring_invoices',
    importEntity: 'recurring_invoice',
    route: '/recurring_invoices/import',
    listRoute: '/recurring_invoices',
    csv: [
      'Client,Start Date,Frequency,Item,Description,Unit Cost,Quantity,Public Notes',
      [
        recurringClient.name,
        '2026-06-09',
        '5',
        uniqueName('recurring-item'),
        'Imported recurring invoice line',
        '7',
        '4',
        uniqueName('imported-recurring-notes'),
      ].join(','),
    ].join('\n'),
    mappings: [
      'client.name',
      'invoice.next_send_date',
      'invoice.frequency_id',
      'item.product_key',
      'item.notes',
      'item.cost',
      'item.quantity',
      'invoice.public_notes',
    ],
    listSearch: recurringClient.name,
    expectedApiFields: {
      client_id: recurringClient.id,
    },
    expectedAmount: 28,
  });
});

test('imports purchase orders and payments from mapped CSV files', async ({
  page,
  api,
}) => {
  await login(page);

  const vendor = await createVendor(api, 'import-po-vendor');
  const paymentClient = await createClient(api, 'import-payment-client');
  const paymentReference = uniqueName('import-payment-ref');

  await importEntity(page, api, {
    entityType: 'purchase_orders',
    importEntity: 'purchase_order',
    route: '/purchase_orders/import',
    listRoute: '/purchase_orders',
    csv: [
      'Vendor,Date,Item,Description,Unit Cost,Quantity,Public Notes',
      [
        vendor.name,
        '2026-06-09',
        uniqueName('po-item'),
        'Imported purchase order line',
        '5',
        '6',
        uniqueName('imported-po-notes'),
      ].join(','),
    ].join('\n'),
    mappings: [
      'vendor.name',
      'purchase_order.date',
      'item.product_key',
      'item.notes',
      'item.cost',
      'item.quantity',
      'purchase_order.public_notes',
    ],
    listSearch: vendor.name,
    expectedApiFields: {
      vendor_id: vendor.id,
      date: '2026-06-09',
    },
    expectedAmount: 30,
  });

  await importEntity(page, api, {
    entityType: 'payments',
    importEntity: 'payment',
    route: '/payments/import',
    listRoute: '/payments',
    csv: [
      'Client ID,Amount,Date,Transaction Reference',
      [paymentClient.id, '12.34', '2026-06-09', paymentReference].join(','),
    ].join('\n'),
    mappings: [
      'payment.client_id',
      'payment.amount',
      'payment.date',
      'payment.transaction_reference',
    ],
    listAssertText: /\$ 12\.34/,
    expectedApiFields: {
      date: '2026-06-09',
    },
    expectedAmount: 12.34,
  });
});

test('imports tasks and bank transactions from mapped CSV files', async ({
  page,
  api,
}) => {
  await login(page);

  const client = await createClient(api, 'import-task-client');
  const taskDescription = uniqueName('imported-task');
  const bankAccountName = await ensureBankAccount(api);
  const transactionDescription = uniqueName('imported-bank-transaction');

  await importEntity(page, api, {
    entityType: 'tasks',
    importEntity: 'task',
    route: '/tasks/import',
    listRoute: '/tasks',
    csv: [
      'Client,Description,Start Date,Duration,Billable',
      [client.name, taskDescription, '2026-06-09', '3600', 'true'].join(','),
    ].join('\n'),
    mappings: [
      'client.name',
      'task.description',
      'task.start_date',
      'task.duration',
      'task.billable',
    ],
    listSearch: taskDescription,
    expectedApiFields: {
      client_id: client.id,
      description: taskDescription,
      is_running: false,
    },
  });

  await importEntity(page, api, {
    entityType: 'bank_transactions',
    importEntity: 'bank_transaction',
    route: '/transactions/import',
    listRoute: '/transactions',
    csv: [
      'Date,Amount,Description',
      ['2026-06-09', '17.89', transactionDescription].join(','),
    ].join('\n'),
    mappings: [
      'transaction.date',
      'transaction.amount',
      'transaction.description',
    ],
    listSearch: transactionDescription,
    expectedApiFields: {
      date: '2026-06-09',
      description: transactionDescription,
    },
    expectedAmount: 17.89,
    bankAccountName,
  });
});

async function importEntity(page: Page, api: ApiFixture, testCase: ImportCase) {
  await page.goto(testCase.route);
  await page.waitForURL(`**${testCase.route}`);

  await expect(page.getByText('CSV file', { exact: true }).first()).toBeVisible();

  const preimportResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/preimport') && response.status() === 200
  );

  await uploadCsv(page, `${testCase.importEntity}.csv`, testCase.csv);
  await preimportResponse;

  const mappingTable = page.getByRole('table');
  await expect(mappingTable).toBeVisible({ timeout: 10000 });
  await mapColumns(mappingTable, testCase.csv, testCase.mappings);

  if (testCase.bankAccountName) {
    await page.getByTestId('combobox-input-field').first().click();
    await page
      .getByRole('option', { name: testCase.bankAccountName, exact: true })
      .first()
      .click();
  }

  const importResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/import') && response.status() === 200
  );

  await mappingTable
    .getByRole('button', { name: 'Import', exact: true })
    .click();
  await importResponse;

  await declineTemplateSave(page);
  await page.waitForURL(`**${testCase.listRoute}`, { timeout: 10000 });

  await waitForTableData(page);

  if (testCase.listSearch) {
    await page.locator('#filter').fill(testCase.listSearch);
  }

  await expect(page.locator('[data-cy="dataTable"] tbody')).toContainText(
    testCase.listAssertText || testCase.listSearch || '',
    { timeout: 10000 }
  );

  const importedEntity = await waitForImportedEntity(api, testCase);

  api.trackEntity(testCase.entityType, importedEntity.id as string);

  for (const [field, value] of Object.entries(testCase.expectedApiFields)) {
    expect(importedEntity[field]).toEqual(value);
  }

  if (typeof testCase.expectedAmount === 'number') {
    expect(Number(importedEntity.amount)).toBeCloseTo(testCase.expectedAmount);
  }
}

async function uploadCsv(page: Page, name: string, csv: string) {
  await page.locator('input[type="file"]').first().setInputFiles({
    name,
    mimeType: 'text/csv',
    buffer: Buffer.from(csv + '\n', 'utf8'),
  });
}

async function mapColumns(
  mappingTable: ReturnType<Page['getByRole']>,
  csv: string,
  mappings: string[]
) {
  const headers = csv.split('\n')[0].split(',');
  const rows = mappingTable.locator('tbody tr');

  for (const [index, mapping] of mappings.entries()) {
    await expect(rows.nth(index).locator('td').first()).toContainText(
      headers[index]
    );
    await rows.nth(index).locator('select').selectOption(mapping);
  }
}

async function declineTemplateSave(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Save Template Mapping' });

  await expect(dialog).toBeVisible({ timeout: 10000 });
  await dialog.getByRole('button', { name: 'No', exact: true }).click();
}

async function waitForImportedEntity(api: ApiFixture, testCase: ImportCase) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    let importedEntity: Record<string, unknown> | undefined;

    await expect
      .poll(
        async () => {
          const response = await context.get(
            `/api/v1/${testCase.entityType}?per_page=100&status=active`,
            { headers: api.context.headers }
          );

          if (!response.ok()) {
            return false;
          }

          const body = await response.json();
          importedEntity = (body.data || []).find(
            (entity: Record<string, unknown>) =>
              Object.entries(testCase.expectedApiFields).every(
                ([field, value]) => entity[field] === value
              )
          );

          return Boolean(importedEntity);
        },
        { timeout: 10000 }
      )
      .toBe(true);

    return importedEntity as Record<string, unknown>;
  } finally {
    await context.dispose();
  }
}

async function createClient(api: ApiFixture, prefix: string) {
  const name = uniqueName(prefix);
  const client = await api.createEntity('clients', {
    name,
    contacts: [
      {
        first_name: 'Import',
        last_name: 'Client',
        email: `${name}@example.test`,
      },
    ],
  });

  return {
    id: client.id as string,
    name: client.name as string,
  };
}

async function createVendor(api: ApiFixture, prefix: string) {
  const name = uniqueName(prefix);
  const vendor = await api.createEntity('vendors', {
    name,
    contacts: [
      {
        first_name: 'Import',
        last_name: 'Vendor',
        email: `${name}@example.test`,
      },
    ],
  });

  return {
    id: vendor.id as string,
    name: vendor.name as string,
  };
}

async function ensureBankAccount(api: ApiFixture) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  const existing = await context.get(
    '/api/v1/bank_integrations?per_page=1&status=active',
    {
      headers: api.context.headers,
    }
  );
  const existingBody = await existing.json();

  if (existingBody.data?.[0]?.bank_account_name) {
    await context.dispose();
    return existingBody.data[0].bank_account_name as string;
  }

  const bankAccountName = uniqueName('import-bank-account');
  const response = await context.post('/api/v1/bank_integrations', {
    headers: api.context.headers,
    data: {
      bank_account_name: bankAccountName,
      provider_name: 'Test Provider',
      bank_account_number: String(Date.now()),
      bank_account_type: 'checking',
    },
  });

  if (!response.ok()) {
    const text = await response.text();
    await context.dispose();
    throw new Error('Failed to create bank account: ' + text);
  }

  await context.dispose();

  return bankAccountName;
}
