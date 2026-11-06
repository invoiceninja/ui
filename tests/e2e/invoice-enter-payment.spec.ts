import { resetAccountBeforeAll, test, expect, uniqueName } from './fixtures';
import { login } from './helpers';
import { createClient } from './client-helpers';
import {
  PARTIAL_PAYMENT_FLOAT_CASES,
  createClientViaApi,
  createSentInvoiceViaApi,
  expectEnterPaymentToggleVisible,
  expectPaidToDate,
  fetchInvoiceViaApi,
  fillPartialPaymentAmount,
  fillPaymentReference,
  openNewInvoiceForClient,
  selectPaymentAmountType,
  setEnterPaymentToggle,
} from './invoice-enter-payment-helpers';

resetAccountBeforeAll();

test.describe('invoice enter payment toggle', () => {
  test('hidden without create_payment on create; visible with permission', async ({
    page,
    api,
  }) => {
    await api.setPermissions('invoices@example.com', [
      'create_invoice',
      'edit_invoice',
      'view_client',
      'create_client',
    ]);

    await login(page, 'invoices@example.com', 'password');
    await createClient({ page, withNavigation: true, createIfNotExist: true });
    await openNewInvoiceForClient(page);

    await expectEnterPaymentToggleVisible(page, false);

    await api.setPermissions('invoices@example.com', [
      'create_invoice',
      'edit_invoice',
      'create_payment',
      'view_client',
      'create_client',
    ]);

    await page.goto('/invoices/create');
    await page.getByRole('option').first().waitFor({ state: 'visible', timeout: 10000 });
    await page.getByRole('option').first().click();
    await expectEnterPaymentToggleVisible(page, true);
  });

  test('toggle reveals amount fields and hides them when turned off', async ({
    page,
    api,
  }) => {
    await api.setPermissions('invoices@example.com', [
      'create_invoice',
      'create_payment',
      'view_client',
      'create_client',
    ]);

    await login(page, 'invoices@example.com', 'password');
    await createClient({ page, withNavigation: true, createIfNotExist: true });
    await openNewInvoiceForClient(page);

    await expect(page.locator('[data-cy="invoicePaymentAmountFields"]')).not.toBeVisible();

    await setEnterPaymentToggle(page, true);

    await expect(page.locator('[data-cy="invoicePaymentAmountFields"]')).toBeVisible();
    await expect(page.locator('[data-cy="invoicePaymentReference"]')).toBeVisible();
    await expect(page.locator('[data-cy="invoicePaymentAmount"]')).not.toBeVisible();

    await selectPaymentAmountType(page, 'Partial Payment');
    await expect(page.locator('[data-cy="invoicePaymentAmount"]')).toBeVisible();

    await setEnterPaymentToggle(page, false);
    await expect(page.locator('[data-cy="invoicePaymentAmountFields"]')).not.toBeVisible();
  });
});

test('create invoice with paid in full sends paid flag and records full balance', async ({
  page,
  api,
}) => {
  test.setTimeout(90000);

  await api.setPermissions('invoices@example.com', [
    'create_invoice',
    'create_payment',
    'view_client',
    'create_client',
  ]);

  await login(page, 'invoices@example.com', 'password');
  await createClient({
    page,
    withNavigation: true,
    createIfNotExist: true,
    name: uniqueName('inv-pay-full'),
  });
  await openNewInvoiceForClient(page);
  const createRequest = page.waitForRequest(
    (request) =>
      request.method() === 'POST' && request.url().includes('/api/v1/invoices')
  );

  await setEnterPaymentToggle(page, true);
  await fillPaymentReference(page, 'FULL-PAY-REF');

  await page.getByRole('button', { name: 'Save' }).click();

  const request = await createRequest;
  const payload = request.postDataJSON() as Record<string, unknown>;

  expect(payload.paid).toBe(true);
  expect(payload.amount_paid).toBeFalsy();
  expect(payload.reference).toBe('FULL-PAY-REF');

  await expect(page.getByText('Successfully created invoice')).toBeVisible({
    timeout: 10000,
  });

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  expect(invoiceId).toBeTruthy();
  if (invoiceId) {
    api.trackEntity('invoices', invoiceId);
  }
});

test('edit invoice paid in full records entire balance', async ({ page, api }) => {
  test.setTimeout(90000);

  await api.setPermissions('invoices@example.com', [
    'edit_invoice',
    'create_payment',
    'view_invoice',
    'view_client',
  ]);

  const clientId = await createClientViaApi(api, uniqueName('inv-full-edit-client'));
  api.trackEntity('clients', clientId);

  const invoiceId = await createSentInvoiceViaApi(api, clientId, 123.45);
  api.trackEntity('invoices', invoiceId);

  await login(page, 'invoices@example.com', 'password');
  await page.goto(`/invoices/${invoiceId}/edit`);

  await setEnterPaymentToggle(page, true);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(page.getByText('Successfully updated invoice')).toBeVisible({
    timeout: 10000,
  });

  const invoice = await fetchInvoiceViaApi(api, invoiceId);
  expectPaidToDate(invoice, 123.45);
});

for (const { invoiceTotal, amountPaid } of PARTIAL_PAYMENT_FLOAT_CASES) {
  test(`edit invoice partial payment applies ${amountPaid} of ${invoiceTotal}`, async ({
    page,
    api,
  }) => {
    test.setTimeout(90000);

    await api.setPermissions('invoices@example.com', [
      'edit_invoice',
      'create_payment',
      'view_invoice',
      'view_client',
    ]);

    const clientId = await createClientViaApi(api, uniqueName('inv-partial-client'));
    api.trackEntity('clients', clientId);

    const invoiceId = await createSentInvoiceViaApi(api, clientId, invoiceTotal);
    api.trackEntity('invoices', invoiceId);

    await login(page, 'invoices@example.com', 'password');
    await page.goto(`/invoices/${invoiceId}/edit`);

    await expect(page.getByRole('heading', { name: 'Edit Invoice' })).toBeVisible({
      timeout: 10000,
    });

    const updateRequest = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' &&
        request.url().includes(`/api/v1/invoices/${invoiceId}`)
    );

    await setEnterPaymentToggle(page, true);
    await selectPaymentAmountType(page, 'Partial Payment');
    await fillPartialPaymentAmount(page, amountPaid);
    await fillPaymentReference(page, `PARTIAL-${amountPaid}`);

    await page
      .locator('[data-cy="topNavbar"]')
      .getByRole('button', { name: 'Save', exact: true })
      .click();

    const request = await updateRequest;
    const payload = request.postDataJSON() as Record<string, unknown>;

    expect(payload.paid).toBeFalsy();
    expect(Number(payload.amount_paid)).toBeCloseTo(amountPaid, 2);
    expect(payload.reference).toBe(`PARTIAL-${amountPaid}`);

    await expect(page.getByText('Successfully updated invoice')).toBeVisible({
      timeout: 10000,
    });

    const invoice = await fetchInvoiceViaApi(api, invoiceId);
    expectPaidToDate(invoice, amountPaid);
  });
}

test('enter payment toggle hidden on paid invoice edit', async ({ page, api }) => {
  const clientId = await createClientViaApi(api, uniqueName('inv-paid-client'));
  api.trackEntity('clients', clientId);

  const invoiceId = await createSentInvoiceViaApi(api, clientId, 50);
  api.trackEntity('invoices', invoiceId);

  await api.createEntity('payments', {
    client_id: clientId,
    amount: 50,
    date: '2026-06-02',
    invoices: [{ invoice_id: invoiceId, amount: 50 }],
  });

  await api.setPermissions('invoices@example.com', [
    'edit_invoice',
    'create_payment',
    'view_invoice',
    'view_client',
  ]);

  await login(page, 'invoices@example.com', 'password');
  await page.goto(`/invoices/${invoiceId}/edit`);

  await expectEnterPaymentToggleVisible(page, false);
});
