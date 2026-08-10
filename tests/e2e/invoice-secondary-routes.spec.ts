import { login } from '$tests/e2e/helpers';
import {
  extractIdFromUrl,
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { type Page } from '@playwright/test';

resetAccountBeforeAll();

test('invoice secondary routes render expected controls and empty states', async ({
  page,
  api,
}) => {
  await login(page);
  const { invoiceId } = await createInvoice(page, api);

  await page.goto(`/invoices/${invoiceId}/pdf`);
  await expect(page.getByText('Delivery Note', { exact: true })).toBeVisible({
    timeout: 10000,
  });
  await expect(
    page.getByRole('button', { name: 'Email Invoice', exact: true })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Download', exact: true })
  ).toBeVisible();

  await page.goto(`/invoices/${invoiceId}/email`);
  await expect(
    page.getByRole('button', { name: 'Send Email', exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('To', { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText('Template', { exact: true }).first()
  ).toBeVisible();
  await expect(
    page.getByText('Subject', { exact: true }).first()
  ).toBeVisible();

  await page.goto(`/invoices/${invoiceId}/activity`);
  await expect(page.getByText('Activity', { exact: true }).first()).toBeVisible({
    timeout: 10000,
  });

  await page.goto(`/invoices/${invoiceId}/history`);
  await expect(page.getByText('History', { exact: true }).first()).toBeVisible({
    timeout: 10000,
  });

  await page.goto(`/invoices/${invoiceId}/email_history`);
  await expect(
    page.getByText('Email History', { exact: true }).first()
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByText(
      'No email history found, this feature only available when sending with Postmark/Mailgun.',
      { exact: true }
    )
  ).toBeVisible();

  await page.goto(`/invoices/${invoiceId}/payment_schedule`);
  await expect(
    page.getByText('Payment Schedule', { exact: true }).first()
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByRole('heading', { name: 'Choose Schedule Type', exact: true })
  ).toBeVisible();
  await expect(page.getByText('Split Payments', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Manually create a custom payment schedule', {
      exact: true,
    })
  ).toBeVisible();
});

test('invoice unapplied payments route exposes an eligible payment to apply', async ({
  page,
  api,
}) => {
  await login(page);
  const { clientId, invoiceId } = await createInvoice(page, api);

  await api.createEntity('payments', {
    client_id: clientId,
    amount: 12,
    date: '2026-06-09',
  });

  await page.goto(`/invoices/${invoiceId}/unapplied_payments`);

  await expect(
    page.getByText('Unapplied Payments', { exact: true }).first()
  ).toBeVisible({ timeout: 10000 });
  await expect(page.getByText(/12\.00/).first()).toBeVisible({
    timeout: 10000,
  });
  await expect(
    page.getByRole('button', { name: 'Apply', exact: true }).first()
  ).toBeVisible();
});

async function createInvoice(page: Page, api: ApiFixture) {
  const client = await api.createEntity('clients', {
    name: uniqueName('secondary-client'),
    contacts: [
      {
        first_name: 'Secondary',
        last_name: 'Routes',
        email: uniqueName('secondary-client') + '@example.test',
      },
    ],
  });

  await gotoAppPath(page, `/invoices/create?client=${client.id}`, async () => {
    await expect(
      page.getByRole('heading', { name: 'New Invoice', exact: true })
    ).toBeVisible({ timeout: 10000 });
  });

  await save(page);
  await expect(
    page.getByText('Successfully created invoice', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByRole('heading', { name: 'Edit Invoice', exact: true })
  ).toBeVisible({ timeout: 10000 });

  const invoiceId = trackEntityFromUrl(api, 'invoices', 'invoices', page.url());

  return {
    clientId: client.id as string,
    invoiceId,
  };
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

async function save(page: Page) {
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
}

function trackEntityFromUrl(
  api: ApiFixture,
  entityType: 'invoices',
  entityPath: string,
  url: string
) {
  const pathname = new URL(url).pathname;
  const id =
    extractIdFromUrl(pathname, entityPath) ||
    pathname.match(new RegExp(`/${entityPath}/([^/]+)`))?.[1] ||
    null;

  if (!id) {
    throw new Error('Could not extract ' + entityType + ' id from ' + url);
  }

  api.trackEntity(entityType, id);

  return id;
}
