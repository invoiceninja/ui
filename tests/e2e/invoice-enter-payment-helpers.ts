import { expect, type Page } from '@playwright/test';
import { request as playwrightRequest } from '@playwright/test';
import type { ApiFixture } from './fixtures';
import { waitForDebouncedCommit } from './helpers';

export const PARTIAL_PAYMENT_FLOAT_CASES = [
  { invoiceTotal: 100, amountPaid: 33.33 },
  { invoiceTotal: 200, amountPaid: 10.5 },
  { invoiceTotal: 99.99, amountPaid: 0.01 },
  { invoiceTotal: 123.45, amountPaid: 99.99 },
] as const;

export function enterPaymentToggle(page: Page) {
  return page.locator('[data-cy="invoiceEnterPaymentToggle"]');
}

export async function expectEnterPaymentToggleVisible(
  page: Page,
  visible: boolean
) {
  const toggle = enterPaymentToggle(page);
  if (visible) {
    await expect(toggle).toBeVisible({ timeout: 10000 });
  } else {
    await expect(toggle).not.toBeVisible({ timeout: 10000 });
  }
}

export async function setEnterPaymentToggle(page: Page, enabled: boolean) {
  const toggle = enterPaymentToggle(page);
  await toggle.waitFor({ state: 'visible', timeout: 10000 });
  const isChecked = await toggle.getAttribute('aria-checked');
  const currentlyOn = isChecked === 'true';

  if (currentlyOn !== enabled) {
    await toggle.click();
  }
}

export async function selectPaymentAmountType(
  page: Page,
  optionLabel: 'Partial Payment'
) {
  const fields = page.locator('[data-cy="invoicePaymentAmountFields"]');
  await fields.locator('svg').last().click();
  await fields.getByRole('option', { name: optionLabel }).click();
}

export async function fillPartialPaymentAmount(page: Page, amount: number) {
  const input = page.locator('[data-cy="invoicePaymentAmount"]');
  await input.waitFor({ state: 'visible', timeout: 10000 });
  await input.fill(String(amount));
  await waitForDebouncedCommit(page);
}

export async function fillPaymentReference(page: Page, reference: string) {
  await page.locator('[data-cy="invoicePaymentReference"]').fill(reference);
}

export async function openNewInvoiceForClient(page: Page) {
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Invoice' })
    .click();

  await page.getByRole('option').first().waitFor({ state: 'visible', timeout: 5000 });
  await page.getByRole('option').first().click();
}

export async function createClientViaApi(api: ApiFixture, name: string) {
  const client = await api.createEntity('clients', {
    name,
    contacts: [
      {
        first_name: 'Payment',
        last_name: 'Client',
        email: `${name}@example.test`,
      },
    ],
  });
  return client.id as string;
}

export async function createSentInvoiceViaApi(
  api: ApiFixture,
  clientId: string,
  lineCost: number
) {
  const invoice = await api.createEntity('invoices', {
    client_id: clientId,
    status_id: '2',
    date: '2026-06-01',
    line_items: [
      {
        product_key: 'Payment test item',
        notes: 'Payment test line',
        cost: lineCost,
        quantity: 1,
        type_id: '1',
      },
    ],
  });

  return invoice.id as string;
}

export async function fetchInvoiceViaApi(api: ApiFixture, invoiceId: string) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const response = await context.get(`/api/v1/invoices/${invoiceId}`, {
      headers: api.context.headers,
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to load invoice ${invoiceId} (${response.status()}): ${(
          await response.text()
        ).slice(0, 200)}`
      );
    }

    const body = await response.json();
    return body.data as Record<string, unknown>;
  } finally {
    await context.dispose();
  }
}

export function expectPaidToDate(
  invoice: Record<string, unknown>,
  expected: number
) {
  expect(Number(invoice.paid_to_date)).toBeCloseTo(expected, 2);
}
