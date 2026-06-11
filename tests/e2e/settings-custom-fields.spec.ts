import { login } from '$tests/e2e/helpers';
import {
  extractIdFromUrl,
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { Locator, request as playwrightRequest, Page } from '@playwright/test';

resetAccountBeforeAll();

type CompanyRecord = Record<string, any>;

const save = async (page: Page) => {
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
};

const saveCompanySettings = async (page: Page) => {
  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/companies/') &&
      response.request().method() === 'PUT',
    { timeout: 10000 }
  );

  await save(page);

  expect((await updateResponse).ok()).toBeTruthy();
  await expect(
    page.getByText('Successfully updated settings', { exact: true })
  ).toBeVisible({ timeout: 10000 });
};

const customFieldConfig = [
  { route: 'clients', field: 'client1' },
  { route: 'products', field: 'product1' },
  { route: 'invoices', field: 'invoice1' },
  { route: 'payments', field: 'payment1' },
  { route: 'projects', field: 'project1' },
  { route: 'tasks', field: 'task1' },
  { route: 'vendors', field: 'vendor1' },
  { route: 'expenses', field: 'expense1' },
] as const;

const typeTextbox = async (input: Locator, value: string) => {
  await input.click();
  await input.press('Control+A');
  await input.press('Backspace');

  if (value) {
    await input.pressSequentially(value, { delay: 10 });
  }

  await input.press('Tab');
};

const appRouteCandidates = (path: string) => [path];

async function gotoAppPath(
  page: Page,
  path: string,
  ready: () => Promise<void>
) {
  let lastError: unknown;

  for (const route of appRouteCandidates(path)) {
    for (let attempt = 0; attempt < 2; attempt++) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      try {
        await ready();
        return;
      } catch (error) {
        lastError = error;
      }
    }
  }

  throw lastError;
}

async function setCustomFieldLabels(
  page: Page,
  labels: Record<string, string>
) {
  for (const { route, field } of customFieldConfig) {
    const input = page.locator('#' + field);

    await gotoAppPath(page, '/settings/custom_fields/' + route, async () => {
      await expect(input).toBeVisible({ timeout: 5000 });
    });
    await typeTextbox(input, labels[field] || '');
    await saveCompanySettings(page);
  }
}

async function fetchCompany(api: ApiFixture) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  const response = await context.get('/api/v1/companies', {
    headers: api.context.headers,
  });

  if (!response.ok()) {
    throw new Error('Failed to fetch company: ' + response.status());
  }

  const body = await response.json();

  await context.dispose();

  return body.data[0] as CompanyRecord;
}

function expectStoredCustomFields(
  company: CompanyRecord,
  labels: Record<string, string>
) {
  for (const [field, label] of Object.entries(labels)) {
    expect(String(company.custom_fields?.[field] || '')).toContain(label);
  }
}

async function updateCompany(api: ApiFixture, company: CompanyRecord) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  const response = await context.put('/api/v1/companies/' + company.id, {
    headers: api.context.headers,
    data: company,
  });

  if (!response.ok()) {
    const text = await response.text();
    await context.dispose();
    throw new Error(
      'Failed to update company: ' + response.status() + ' ' + text.slice(0, 300)
    );
  }

  await context.dispose();
}

function trackEntityFromUrl(
  api: ApiFixture,
  type:
    | 'invoices'
    | 'payments'
    | 'tasks'
    | 'expenses',
  entityPath: string,
  url: string
) {
  const id = extractIdFromUrl(url.split('?')[0], entityPath);

  if (!id) {
    throw new Error('Could not extract ' + entityPath + ' id from ' + url);
  }

  api.trackEntity(type, id);

  return id;
}

async function createInvoice(page: Page, api: ApiFixture) {
  await gotoAppPath(page, '/invoices/create', async () => {
    await page.getByRole('option').first().waitFor({ state: 'visible' });
  });
  await page.getByRole('option').first().click();
  await save(page);
  await expect(
    page.getByText('Successfully created invoice', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByRole('heading', { name: 'Edit Invoice' }).first()
  ).toBeVisible({ timeout: 10000 });

  return trackEntityFromUrl(api, 'invoices', 'invoices', page.url());
}

async function createPayment(page: Page, api: ApiFixture, clientId: string) {
  await gotoAppPath(page, '/payments/create?client=' + clientId, async () => {
    await expect(
      page.getByText('Amount received', { exact: true }).first()
    ).toBeVisible({ timeout: 10000 });
  });
  await typeTextbox(
    page
      .getByText('Amount received', { exact: true })
      .first()
      .locator('xpath=ancestor::div[contains(@class, "sm:grid")][1]')
      .getByRole('textbox')
      .first(),
    '1'
  );
  await save(page);
  await expect(
    page.getByText('Successfully created payment', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/payments/**/edit');

  return trackEntityFromUrl(api, 'payments', 'payments', page.url());
}

async function createTask(page: Page, api: ApiFixture, description: string) {
  await gotoAppPath(page, '/tasks/create', async () => {
    await expect(page.getByTestId('combobox-input-field').first()).toBeVisible({
      timeout: 10000,
    });
  });
  await page.getByTestId('combobox-input-field').first().click();
  await page.getByRole('option').first().waitFor({ state: 'visible' });
  await page.getByRole('option').first().click();
  await page
    .getByText('Description', { exact: true })
    .first()
    .locator('xpath=ancestor::section[1]')
    .getByRole('textbox')
    .fill(description);
  await save(page);
  await expect(
    page.getByText('Successfully created task', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/tasks/**/edit');

  return trackEntityFromUrl(api, 'tasks', 'tasks', page.url());
}

async function createExpense(page: Page, api: ApiFixture, note: string) {
  await gotoAppPath(page, '/expenses/create', async () => {
    await expect(
      page.getByText('Public Notes', { exact: true }).first()
    ).toBeVisible({ timeout: 10000 });
  });
  await page
    .getByText('Public Notes', { exact: true })
    .first()
    .locator('xpath=ancestor::section[1]')
    .getByRole('textbox')
    .fill(note);
  await save(page);
  await expect(
    page.getByText('Successfully created expense', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/expenses/**/edit');

  return trackEntityFromUrl(api, 'expenses', 'expenses', page.url());
}

async function expectCustomFieldOnEditPage(
  page: Page,
  route: string,
  label: string
) {
  await gotoAppPath(page, route, async () => {
    await expect(
      page.getByRole('main').getByText(label, { exact: true }).first()
    ).toBeVisible({ timeout: 10000 });
  });
}

test('custom fields render on matching edit forms', async ({ page, api }) => {
  test.setTimeout(240000);

  const suffix = Date.now().toString(36).slice(-6);
  const labels = {
    client1: 'CF Client ' + suffix,
    product1: 'CF Product ' + suffix,
    invoice1: 'CF Invoice ' + suffix,
    payment1: 'CF Payment ' + suffix,
    project1: 'CF Project ' + suffix,
    task1: 'CF Task ' + suffix,
    vendor1: 'CF Vendor ' + suffix,
    expense1: 'CF Expense ' + suffix,
  };

  const originalCompany = await fetchCompany(api);

  await login(page);
  await setCustomFieldLabels(page, labels);
  expectStoredCustomFields(await fetchCompany(api), labels);
  await page.reload();
  await page.waitForLoadState('networkidle');

  try {
    const client = await api.createEntity('clients', {
      name: uniqueName('cf-client'),
      contacts: [
        {
          first_name: 'Custom',
          last_name: 'Field',
          email: uniqueName('cf-client') + '@example.test',
        },
      ],
    });
    const product = await api.createEntity('products', {
      product_key: uniqueName('cf-product'),
      notes: 'custom field product',
      price: 10,
      cost: 5,
    });
    const vendor = await api.createEntity('vendors', {
      name: uniqueName('cf-vendor'),
      contacts: [],
    });
    const project = await api.createEntity('projects', {
      name: uniqueName('cf-project'),
      client_id: client.id,
    });

    const invoiceId = await createInvoice(page, api);
    const paymentId = await createPayment(page, api, client.id as string);
    const taskId = await createTask(page, api, uniqueName('cf-task'));
    const expenseId = await createExpense(page, api, uniqueName('cf-expense'));

    await expectCustomFieldOnEditPage(
      page,
      '/clients/' + client.id + '/edit',
      labels.client1
    );
    await expectCustomFieldOnEditPage(
      page,
      '/products/' + product.id + '/edit',
      labels.product1
    );
    await expectCustomFieldOnEditPage(
      page,
      '/invoices/' + invoiceId + '/edit',
      labels.invoice1
    );
    await expectCustomFieldOnEditPage(
      page,
      '/payments/' + paymentId + '/edit',
      labels.payment1
    );
    await expectCustomFieldOnEditPage(
      page,
      '/projects/' + project.id + '/edit',
      labels.project1
    );
    await expectCustomFieldOnEditPage(
      page,
      '/tasks/' + taskId + '/edit',
      labels.task1
    );
    await expectCustomFieldOnEditPage(
      page,
      '/vendors/' + vendor.id + '/edit',
      labels.vendor1
    );
    await expectCustomFieldOnEditPage(
      page,
      '/expenses/' + expenseId + '/edit',
      labels.expense1
    );
  } finally {
    await updateCompany(api, {
      ...originalCompany,
      custom_fields: originalCompany.custom_fields || {},
    });
  }
});
