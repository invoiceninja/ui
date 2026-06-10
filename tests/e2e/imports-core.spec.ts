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

type ImportEntityType = 'clients' | 'products' | 'vendors' | 'expenses';

interface ImportCase {
  entityType: ImportEntityType;
  importEntity: 'client' | 'product' | 'vendor' | 'expense';
  route: string;
  listRoute: string;
  name: string;
  csv: string;
  mappings: string[];
  expectedApiFields: Record<string, string | number>;
  expectedAmount?: number;
  assertListLink?: boolean;
}

test('import form exposes mapping controls after CSV upload', async ({ page }) => {
  await login(page);
  await page.goto('/clients/import');

  await expect(page.getByText('CSV file', { exact: true })).toBeVisible();
  await expect(page.getByText('Drop files or click to upload')).toBeVisible();

  const preimportResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/preimport') && response.status() === 200
  );

  await uploadCsv(
    page,
    'client-import-preview.csv',
    'Name,Email\nPreview Client,preview@example.com'
  );
  await preimportResponse;

  const mappingTable = page.getByRole('table');
  await expect(mappingTable).toBeVisible({ timeout: 10000 });
  await expect(mappingTable.locator('tbody tr').nth(0)).toContainText('Name');
  await expect(mappingTable.locator('tbody tr').nth(1)).toContainText('Email');
  await expect(
    mappingTable.getByRole('button', { name: 'Import', exact: true })
  ).toBeVisible();
});

test('imports clients from a mapped CSV file', async ({ page, api }) => {
  const clientName = uniqueName('import-client');
  const contactEmail = `${clientName}@example.com`;

  await importEntity(page, api, {
    entityType: 'clients',
    importEntity: 'client',
    route: '/clients/import',
    listRoute: '/clients',
    name: clientName,
    csv: [
      'Name,First Name,Last Name,Email',
      `${clientName},Import,Client,${contactEmail}`,
    ].join('\n'),
    mappings: [
      'client.name',
      'contact.first_name',
      'contact.last_name',
      'contact.email',
    ],
    expectedApiFields: {
      name: clientName,
    },
  });
});

test('imports products from a mapped CSV file', async ({ page, api }) => {
  const productKey = uniqueName('import-product');

  await importEntity(page, api, {
    entityType: 'products',
    importEntity: 'product',
    route: '/products/import',
    listRoute: '/products',
    name: productKey,
    csv: [
      'Product Key,Notes,Cost,Price',
      `${productKey},Imported product notes,12.34,56.78`,
    ].join('\n'),
    mappings: [
      'product.product_key',
      'product.notes',
      'product.cost',
      'product.price',
    ],
    expectedApiFields: {
      product_key: productKey,
      notes: 'Imported product notes',
    },
  });
});

test('imports vendors from a mapped CSV file', async ({ page, api }) => {
  const vendorName = uniqueName('import-vendor');
  const contactEmail = `${vendorName}@example.com`;

  await importEntity(page, api, {
    entityType: 'vendors',
    importEntity: 'vendor',
    route: '/vendors/import',
    listRoute: '/vendors',
    name: vendorName,
    csv: [
      'Name,First Name,Last Name,Email',
      `${vendorName},Import,Vendor,${contactEmail}`,
    ].join('\n'),
    mappings: [
      'vendor.name',
      'contact.first_name',
      'contact.last_name',
      'contact.email',
    ],
    expectedApiFields: {
      name: vendorName,
    },
  });
});

test('imports expenses with an existing vendor from a mapped CSV file', async ({
  page,
  api,
}) => {
  const vendorName = uniqueName('import-expense-vendor');
  const expenseNotes = uniqueName('import-expense-notes');
  const expenseDate = '2026-06-09';
  const amount = 43.21;

  const vendor = await api.createEntity('vendors', {
    name: vendorName,
    contacts: [
      {
        first_name: 'Import',
        last_name: 'Vendor',
        email: `${vendorName}@example.com`,
      },
    ],
  });

  await importEntity(page, api, {
    entityType: 'expenses',
    importEntity: 'expense',
    route: '/expenses/import',
    listRoute: '/expenses',
    name: expenseNotes,
    csv: [
      'Vendor,Amount,Date,Public Notes',
      `${vendorName},${amount},${expenseDate},${expenseNotes}`,
    ].join('\n'),
    mappings: [
      'expense.vendor',
      'expense.amount',
      'expense.date',
      'expense.public_notes',
    ],
    expectedApiFields: {
      public_notes: expenseNotes,
      vendor_id: vendor.id as string,
      date: expenseDate,
    },
    expectedAmount: amount,
    assertListLink: false,
  });
});

async function importEntity(page: Page, api: ApiFixture, testCase: ImportCase) {
  await login(page);
  await page.goto(testCase.route);
  await page.waitForURL(`**${testCase.route}`);

  await expect(page.getByText('CSV file', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Drop files or click to upload').first()
  ).toBeVisible();

  const preimportResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/preimport') && response.status() === 200
  );

  await uploadCsv(page, `${testCase.importEntity}.csv`, testCase.csv);
  await preimportResponse;

  const mappingTable = page.getByRole('table');
  await expect(mappingTable).toBeVisible({ timeout: 10000 });
  await mapColumns(mappingTable, testCase.csv, testCase.mappings);

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
  await page.locator('#filter').fill(testCase.name);

  const importedLink = page
    .locator('[data-cy="dataTable"]')
    .getByRole('link', { name: testCase.name, exact: true })
    .first();

  if (testCase.assertListLink ?? true) {
    await expect(importedLink).toBeVisible({ timeout: 10000 });
  } else {
    await expect(page.locator('[data-cy="dataTable"] tbody')).toContainText(
      testCase.name,
      { timeout: 10000 }
    );
  }

  const importedEntity = await waitForImportedEntity(
    api,
    testCase.entityType,
    testCase.name
  );

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
  await expect(
    dialog.getByText(
      'Would you like to save this import mapping as a template for future use?'
    )
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'No', exact: true }).click();
}

async function waitForImportedEntity(
  api: ApiFixture,
  entityType: ImportEntityType,
  filter: string
) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    let importedEntity: Record<string, unknown> | undefined;

    await expect
      .poll(
        async () => {
          const response = await context.get(
            `/api/v1/${entityType}?filter=${encodeURIComponent(
              filter
            )}&per_page=10&status=active`,
            { headers: api.context.headers }
          );

          if (!response.ok()) {
            return false;
          }

          const body = await response.json();
          importedEntity = (body.data || []).find(
            (entity: Record<string, unknown>) =>
              entity.name === filter ||
              entity.product_key === filter ||
              entity.public_notes === filter
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
