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

test('quote secondary routes render PDF, email, activity, history, and email history surfaces', async ({
  page,
  api,
}) => {
  const client = await createClient(api, 'quote-secondary-client');
  const quote = await createDocument(api, 'quotes', {
    client_id: client.id,
    line_items: [lineItem('quote-secondary-service', 31)],
  });

  await login(page);

  await expectPdfRoute(page, `/quotes/${quote.id}/pdf`, {
    emailButton: 'Email Quote',
    hasDownload: true,
  });
  await expectEmailRoute(page, `/quotes/${quote.id}/email`);
  await expectNestedRoute(page, `/quotes/${quote.id}/activity`, 'Activity');
  await expectNestedRoute(page, `/quotes/${quote.id}/history`, 'History');
  await expectEmailHistoryRoute(page, `/quotes/${quote.id}/email_history`);
});

test('credit secondary routes render PDF, email, activity, and history surfaces', async ({
  page,
  api,
}) => {
  const client = await createClient(api, 'credit-secondary-client');
  const credit = await createDocument(api, 'credits', {
    client_id: client.id,
    line_items: [lineItem('credit-secondary-service', 19)],
  });

  await login(page);

  await expectPdfRoute(page, `/credits/${credit.id}/pdf`, {
    emailButton: 'Email Credit',
    hasDownload: true,
  });
  await expectEmailRoute(page, `/credits/${credit.id}/email`);
  await expectNestedRoute(page, `/credits/${credit.id}/activity`, 'Activity');
  await expectNestedRoute(page, `/credits/${credit.id}/history`, 'History');
});

test('purchase order secondary routes render PDF, email, activity, history, and email history surfaces', async ({
  page,
  api,
}) => {
  const vendor = await createVendor(api, 'po-secondary-vendor');
  const purchaseOrder = await createDocument(api, 'purchase_orders', {
    vendor_id: vendor.id,
    line_items: [lineItem('po-secondary-service', 42)],
  });

  await login(page);

  await expectPdfRoute(page, `/purchase_orders/${purchaseOrder.id}/pdf`, {
    hasDownload: false,
  });
  await expectEmailRoute(page, `/purchase_orders/${purchaseOrder.id}/email`);
  await expectNestedRoute(
    page,
    `/purchase_orders/${purchaseOrder.id}/activity`,
    'Activity'
  );
  await expectNestedRoute(
    page,
    `/purchase_orders/${purchaseOrder.id}/history`,
    'History'
  );
  await expectEmailHistoryRoute(
    page,
    `/purchase_orders/${purchaseOrder.id}/email_history`
  );
});

async function expectPdfRoute(
  page: Page,
  path: string,
  options: { emailButton?: string; hasDownload: boolean }
) {
  await gotoAppPath(page, path, async () => {
    await expect(
      page.getByRole('heading', { name: 'View PDF', exact: true })
    ).toBeVisible({ timeout: 10000 });
  });

  if (options.emailButton) {
    await expect(
      page.getByRole('button', { name: options.emailButton, exact: true })
    ).toBeVisible({ timeout: 10000 });
  }

  if (options.hasDownload) {
    await expect(
      page.getByRole('button', { name: 'Download', exact: true })
    ).toBeVisible({ timeout: 10000 });
  }
}

async function expectEmailRoute(page: Page, path: string) {
  await gotoAppPath(page, path, async () => {
    await expect(
      page.getByRole('button', { name: 'Send Email', exact: true })
    ).toBeVisible({ timeout: 10000 });
  });

  await expect(page.getByText('To', { exact: true }).first()).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText('Template', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Subject', { exact: true }).first()).toBeVisible();
}

async function expectNestedRoute(page: Page, path: string, title: string) {
  await gotoAppPath(page, path, async () => {
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible({
      timeout: 10000,
    });
  });
}

async function expectEmailHistoryRoute(page: Page, path: string) {
  await expectNestedRoute(page, path, 'Email History');

  await expect(
    page.getByText(
      'No email history found, this feature only available when sending with Postmark/Mailgun.',
      { exact: true }
    )
  ).toBeVisible({ timeout: 10000 });
}

async function gotoAppPath(
  page: Page,
  path: string,
  ready: () => Promise<void>
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    try {
      await ready();
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function createClient(api: ApiFixture, prefix: string) {
  const name = uniqueName(prefix);
  const client = await api.createEntity('clients', {
    name,
    contacts: [
      {
        first_name: 'Secondary',
        last_name: 'Client',
        email: name + '@example.test',
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
        first_name: 'Secondary',
        last_name: 'Vendor',
        email: name + '@example.test',
      },
    ],
  });

  return { id: vendor.id as string, name: vendor.name as string };
}

async function createDocument(
  api: ApiFixture,
  type: Extract<EntityType, 'quotes' | 'credits' | 'purchase_orders'>,
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
        `Failed to fetch blank ${type}: ${await blankResponse.text()}`
      );
    }

    const blank = ((await blankResponse.json()) as { data: object }).data;
    const response = await context.post(`/api/v1/${type}`, {
      headers: api.context.headers,
      data: {
        ...blank,
        date: '2026-06-09',
        ...overrides,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to create ${type}: ${await response.text()}`);
    }

    const entity = ((await response.json()) as {
      data: { id: string };
    }).data;
    api.trackEntity(type, entity.id);

    return entity;
  } finally {
    await context.dispose();
  }
}

function lineItem(productKey: string, cost: number) {
  return {
    product_key: productKey,
    notes: productKey + ' notes',
    cost,
    quantity: 1,
  };
}
