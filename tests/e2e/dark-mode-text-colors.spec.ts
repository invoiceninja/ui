import {
  expectNotHardcodedGrayText,
  expectReadableText,
  loginWithDarkMode,
  TAILWIND_GRAY_500,
  TAILWIND_GRAY_600,
  TAILWIND_GRAY_900,
} from '$tests/e2e/dark-mode-helpers';
import {
  type ApiFixture,
  expect,
  resetAccountBeforeAll,
  test,
  uniqueName,
} from '$tests/e2e/fixtures';

resetAccountBeforeAll();

test.describe('dark mode text colors (PR #2479)', () => {
  test('dashboard widget table headers use theme colors, not Tailwind gray-500', async ({
    page,
    api,
  }) => {
    test.setTimeout(60_000);

    await loginWithDarkMode(page, api.context);
    await page.goto('/dashboard');
    await expect(
      page.getByRole('heading', { name: 'Recent Payments', exact: true })
    ).toBeVisible({ timeout: 15_000 });

    const recentPaymentsTable = page
      .getByRole('heading', { name: 'Recent Payments', exact: true })
      .locator('xpath=ancestor::*[.//table][1]//table')
      .first();

    const headerCell = recentPaymentsTable.locator('th').first();
    await expectNotHardcodedGrayText(headerCell, TAILWIND_GRAY_500);
    await expectReadableText(headerCell, 3);
  });

  test('dashboard recent transactions labels remain readable in dark mode', async ({
    page,
    api,
  }) => {
    test.setTimeout(60_000);

    await loginWithDarkMode(page, api.context);
    await page.goto('/dashboard');
    await expect(
      page.getByRole('heading', { name: 'Recent Transactions', exact: true })
    ).toBeVisible({ timeout: 15_000 });

    const invoicesLabel = page
      .getByRole('heading', { name: 'Recent Transactions', exact: true })
      .locator(
        'xpath=ancestor::div[contains(@class,"shadow-sm")][1]//div[contains(@class,"border-dashed")][1]/span[1]'
      );
    await expectNotHardcodedGrayText(
      invoicesLabel,
      TAILWIND_GRAY_500,
      TAILWIND_GRAY_600
    );
    await expectReadableText(invoicesLabel, 3);
  });

  test('invoice PDF toolbar actions stay readable in dark mode', async ({
    page,
    api,
  }) => {
    test.setTimeout(90_000);

    await loginWithDarkMode(page, api.context);
    const { invoiceId } = await createInvoiceForDarkMode(api);

    await page.goto(`/invoices/${invoiceId}/pdf`);
    await expect(
      page.getByRole('heading', { name: 'View PDF', exact: true })
    ).toBeVisible({ timeout: 15_000 });

    const downloadButton = page.getByRole('button', {
      name: 'Download',
      exact: true,
    });
    await expect(downloadButton).toBeVisible();
    await expectReadableText(downloadButton, 3);

    const emailButton = page.getByRole('button', {
      name: 'Email Invoice',
      exact: true,
    });
    await expect(emailButton).toBeVisible();
    await expectReadableText(emailButton, 3);
  });

  test('credit PDF toolbar actions stay readable in dark mode', async ({
    page,
    api,
  }) => {
    test.setTimeout(90_000);

    await loginWithDarkMode(page, api.context);
    const credit = await createCredit(api);

    await page.goto(`/credits/${credit.id}/pdf`);
    await expect(
      page.getByRole('heading', { name: 'View PDF', exact: true })
    ).toBeVisible({ timeout: 15_000 });

    const downloadButton = page.getByRole('button', {
      name: 'Download',
      exact: true,
    });
    await expect(downloadButton).toBeVisible();
    await expectReadableText(downloadButton, 3);
  });

  test('payment schedule helper copy uses theme secondary text in dark mode', async ({
    page,
    api,
  }) => {
    test.setTimeout(90_000);

    await loginWithDarkMode(page, api.context);
    const { invoiceId } = await createInvoiceForDarkMode(api);

    await page.goto(`/invoices/${invoiceId}/payment_schedule`);
    await expect(
      page.getByRole('heading', { name: 'Choose Schedule Type', exact: true })
    ).toBeVisible({ timeout: 15_000 });

    const splitPaymentsHelp = page
      .locator('div')
      .filter({
        has: page.getByRole('heading', { name: 'Split Payments', exact: true }),
      })
      .locator('p')
      .first();

    await expectNotHardcodedGrayText(
      splitPaymentsHelp,
      TAILWIND_GRAY_500,
      TAILWIND_GRAY_600
    );
    await expectReadableText(splitPaymentsHelp, 3);
  });

  test('quote action confirmation modal body text is readable in dark mode', async ({
    page,
    api,
  }) => {
    test.setTimeout(90_000);

    await loginWithDarkMode(page, api.context);
    const quote = await createQuote(api);

    await page.goto(`/quotes/${quote.id}/edit`);
    await expect(
      page.getByRole('heading', { name: 'Edit Quote', exact: true })
    ).toBeVisible({ timeout: 15_000 });

    await page.locator('[data-cy="chevronDownButton"]').first().click();
    const markSent = page.getByRole('button', {
      name: 'Mark Sent',
      exact: true,
    });
    await markSent.waitFor({ state: 'visible', timeout: 10_000 });
    await markSent.click();

    const confirmation = page
      .getByRole('dialog')
      .getByText('Are you sure?', { exact: true });
    await expect(confirmation).toBeVisible({ timeout: 10_000 });
    await expectNotHardcodedGrayText(confirmation, TAILWIND_GRAY_900);
    await expectReadableText(confirmation, 4.5);
  });
});

async function createInvoiceForDarkMode(api: ApiFixture) {
  const client = await api.createEntity('clients', {
    name: uniqueName('dark-mode-invoice-client'),
    contacts: [
      {
        first_name: 'Dark',
        last_name: 'Mode',
        email: `${uniqueName('dark-mode-invoice')}@example.test`,
      },
    ],
  });

  const blank = await fetchBlankDocument(api, 'invoices');
  const invoice = await postDocument(api, 'invoices', {
    ...blank,
    client_id: client.id,
    date: '2026-06-09',
    line_items: [
      {
        product_key: 'Dark mode test',
        notes: 'Dark mode test line',
        cost: 10,
        qty: 1,
      },
    ],
  });

  api.trackEntity('invoices', invoice.id as string);

  return { invoiceId: invoice.id as string };
}

async function createCredit(api: ApiFixture) {
  const client = await api.createEntity('clients', {
    name: uniqueName('dark-mode-credit-client'),
    contacts: [
      {
        first_name: 'Dark',
        last_name: 'Mode',
        email: `${uniqueName('dark-mode-credit')}@example.test`,
      },
    ],
  });

  const blank = await fetchBlankDocument(api, 'credits');
  const credit = await postDocument(api, 'credits', {
    ...blank,
    client_id: client.id,
    date: '2026-06-09',
    line_items: [
      {
        product_key: 'Dark mode credit',
        notes: 'Dark mode credit line',
        cost: 5,
        qty: 1,
      },
    ],
  });

  api.trackEntity('credits', credit.id as string);

  return credit;
}

async function createQuote(api: ApiFixture) {
  const client = await api.createEntity('clients', {
    name: uniqueName('dark-mode-quote-client'),
    contacts: [
      {
        first_name: 'Dark',
        last_name: 'Mode',
        email: `${uniqueName('dark-mode-quote')}@example.test`,
      },
    ],
  });

  const blank = await fetchBlankDocument(api, 'quotes');
  const quote = await postDocument(api, 'quotes', {
    ...blank,
    client_id: client.id,
    date: '2026-06-09',
    line_items: [
      {
        product_key: 'Dark mode quote',
        notes: 'Dark mode quote line',
        cost: 8,
        qty: 1,
      },
    ],
  });

  api.trackEntity('quotes', quote.id as string);

  return quote;
}

async function fetchBlankDocument(
  api: ApiFixture,
  type: 'invoices' | 'credits' | 'quotes'
) {
  const { request } = await import('@playwright/test');
  const context = await request.newContext({ baseURL: api.context.baseUrl });

  try {
    const response = await context.get(`/api/v1/${type}/create`, {
      headers: api.context.headers,
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to fetch blank ${type}: ${(await response.text()).slice(0, 200)}`
      );
    }

    return ((await response.json()) as { data: Record<string, unknown> }).data;
  } finally {
    await context.dispose();
  }
}

async function postDocument(
  api: ApiFixture,
  type: 'invoices' | 'credits' | 'quotes',
  payload: Record<string, unknown>
) {
  const { request } = await import('@playwright/test');
  const context = await request.newContext({ baseURL: api.context.baseUrl });

  try {
    const response = await context.post(`/api/v1/${type}`, {
      headers: api.context.headers,
      data: payload,
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to create ${type}: ${(await response.text()).slice(0, 200)}`
      );
    }

    const body = (await response.json()) as { data: Record<string, unknown> };
    return body.data;
  } finally {
    await context.dispose();
  }
}
