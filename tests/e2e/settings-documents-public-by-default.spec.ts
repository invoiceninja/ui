import { request as playwrightRequest, type Page } from '@playwright/test';
import { login } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';

resetAccountBeforeAll();

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

interface UploadedDocument {
  id: string;
  name: string;
  is_public: boolean;
}

test('company document uploads follow documents_public_by_default', async ({
  page,
  api,
  settingsGuard,
}) => {
  test.setTimeout(90_000);

  await settingsGuard.snapshot();
  await login(page);

  await openCompanyDocumentsSettings(page);

  const toggle = documentsPublicByDefaultToggle(page);
  await expect(toggle).toBeVisible({ timeout: 10000 });
  await expect(toggle).toHaveAttribute('aria-checked', 'true', {
    timeout: 10000,
  });

  const publicName = `${uniqueName('doc-public')}.png`;
  const publicDoc = await uploadDocument(page, publicName);

  expect(publicDoc.is_public).toBe(true);
  await expect(page.getByText(publicName, { exact: true }).first()).toBeVisible({
    timeout: 10000,
  });
  expect((await fetchDocument(api, publicDoc.id)).is_public).toBe(true);

  await setDocumentsPublicByDefault(page, false);
  await saveCompanySettings(page, false);
  await expect(toggle).toHaveAttribute('aria-checked', 'false');

  const privateName = `${uniqueName('doc-private')}.png`;
  const privateDoc = await uploadDocument(page, privateName);

  expect(privateDoc.is_public).toBe(false);
  await expect(page.getByText(privateName, { exact: true }).first()).toBeVisible(
    {
      timeout: 10000,
    }
  );
  expect((await fetchDocument(api, privateDoc.id)).is_public).toBe(false);

  await deleteDocuments(api, [publicDoc.id, privateDoc.id]);
});

test('invoice document uploads inherit documents_public_by_default', async ({
  page,
  api,
  settingsGuard,
}) => {
  test.setTimeout(90_000);

  await settingsGuard.snapshot();
  await login(page);

  const client = await api.createEntity('clients', {
    name: uniqueName('doc-public-client'),
    contacts: [
      {
        first_name: 'Document',
        last_name: 'Client',
        email: uniqueName('doc-public-client') + '@example.test',
      },
    ],
  });

  const invoice = await api.createEntity('invoices', {
    client_id: client.id,
    number: uniqueName('doc-public-invoice'),
    status_id: '1',
    date: '2026-08-13',
    line_items: [
      {
        quantity: 1,
        cost: 10,
        product_key: 'Document Setting',
        notes: 'Document visibility setting',
        type_id: '1',
      },
    ],
  });

  await openCompanyDocumentsSettings(page);
  await setDocumentsPublicByDefault(page, false);
  await saveCompanySettings(page, false);

  await page.goto(`/invoices/${invoice.id}/documents`);
  await page.waitForURL(`**/invoices/${invoice.id}/documents`);
  await expect(page.getByText('Drop files or click to upload')).toBeVisible({
    timeout: 10000,
  });

  const privateName = `${uniqueName('invoice-doc-private')}.png`;
  const privateDoc = await uploadDocument(page, privateName);

  expect(privateDoc.is_public).toBe(false);
  expect((await fetchDocument(api, privateDoc.id)).is_public).toBe(false);

  await openCompanyDocumentsSettings(page);
  await setDocumentsPublicByDefault(page, true);
  await saveCompanySettings(page, true);

  await page.goto(`/invoices/${invoice.id}/documents`);
  await page.waitForURL(`**/invoices/${invoice.id}/documents`);
  await expect(page.getByText('Drop files or click to upload')).toBeVisible({
    timeout: 10000,
  });

  const publicName = `${uniqueName('invoice-doc-public')}.png`;
  const publicDoc = await uploadDocument(page, publicName);

  expect(publicDoc.is_public).toBe(true);
  expect((await fetchDocument(api, publicDoc.id)).is_public).toBe(true);

  await deleteDocuments(api, [privateDoc.id, publicDoc.id]);
});

function documentsPublicByDefaultToggle(page: Page) {
  return page.locator('[data-cy="documentsPublicByDefaultToggle"]');
}

async function openCompanyDocumentsSettings(page: Page) {
  await page.goto('/settings/company_details/documents');
  await page.waitForURL('**/settings/company_details/documents');
  await expect(documentsPublicByDefaultToggle(page)).toBeVisible({
    timeout: 10000,
  });
}

async function setDocumentsPublicByDefault(page: Page, desired: boolean) {
  const toggle = documentsPublicByDefaultToggle(page);
  const desiredValue = desired ? 'true' : 'false';

  if ((await toggle.getAttribute('aria-checked')) !== desiredValue) {
    await toggle.click();
  }

  await expect(toggle).toHaveAttribute('aria-checked', desiredValue, {
    timeout: 10000,
  });
}

async function saveCompanySettings(page: Page, expectedPublicByDefault: boolean) {
  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/companies/') &&
      response.request().method() === 'PUT',
    { timeout: 10000 }
  );

  await page.getByRole('button', { name: 'Save', exact: true }).first().click();

  const response = await updateResponse;
  expect(response.ok()).toBeTruthy();

  const payload = JSON.parse(response.request().postData() || '{}') as {
    settings?: { documents_public_by_default?: boolean };
  };

  expect(payload.settings?.documents_public_by_default).toBe(
    expectedPublicByDefault
  );

  await expect(
    page.getByText('Successfully updated settings', { exact: true })
  ).toBeVisible({ timeout: 10000 });
}

async function uploadDocument(page: Page, fileName: string) {
  const uploadResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/upload') &&
      response.request().method() === 'POST' &&
      response.ok(),
    { timeout: 15000 }
  );

  await page.locator('input[type="file"]').first().setInputFiles({
    name: fileName,
    mimeType: 'image/png',
    buffer: PNG_1X1,
  });

  await expect(
    page.getByText('Successfully uploaded document', { exact: true })
  ).toBeVisible({ timeout: 15000 });

  const body = (await (await uploadResponse).json()) as {
    data?: { documents?: UploadedDocument[] };
  };

  const document = body.data?.documents?.find((item) => item.name === fileName);

  if (!document) {
    throw new Error(`Upload response did not include document ${fileName}`);
  }

  return document;
}

async function fetchDocument(api: ApiFixture, id: string) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const response = await context.get(`/api/v1/documents/${id}`, {
      headers: api.context.headers,
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to fetch document ${id}: ${response.status()} ${await response.text()}`
      );
    }

    return ((await response.json()) as { data: UploadedDocument }).data;
  } finally {
    await context.dispose();
  }
}

async function deleteDocuments(api: ApiFixture, ids: string[]) {
  if (!ids.length) {
    return;
  }

  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    await context.post('/api/v1/documents/bulk', {
      headers: api.context.headers,
      data: { action: 'delete', ids },
    });
  } finally {
    await context.dispose();
  }
}
