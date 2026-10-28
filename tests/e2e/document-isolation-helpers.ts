import { expect, type Locator, type Page } from '@playwright/test';
import { login } from './helpers';
import { updateUserReactSettings, type EntityType } from './api-helpers';
import { uniqueName, type ApiFixture } from './fixtures';

export const documentKinds = [
  { type: 'invoices', label: 'Invoice' },
  { type: 'quotes', label: 'Quote' },
  { type: 'credits', label: 'Credit' },
  { type: 'recurring_invoices', label: 'Recurring Invoice' },
  { type: 'purchase_orders', label: 'Purchase Order' },
] as const;
export type DocumentKind = (typeof documentKinds)[number];

export async function startSession(
  page: Page,
  api: ApiFixture,
  guided = false
) {
  await updateUserReactSettings(
    api.context,
    {
      show_advanced_invoice_editor: !guided,
      show_pdf_preview: false,
    },
    { quiet: true }
  );
  await login(page);
}

export async function createClient(api: ApiFixture) {
  const client = await api.createEntity('clients', {
    name: uniqueName('isolation-client'),
    contacts: [
      {
        first_name: 'Isolation',
        email: uniqueName('isolation') + '@example.test',
      },
    ],
  });
  expect(client?.id, 'API setup must create a client').toBeTruthy();
  return String(client.id);
}

export async function seedDocument(api: ApiFixture, kind: DocumentKind) {
  const clientId = await createClient(api);
  const marker = uniqueName('isolation');
  const notes = [`${marker} first`, `${marker} second`];
  const vendor =
    kind.type === 'purchase_orders'
      ? await api.createEntity('vendors', {
          name: uniqueName('isolation-vendor'),
        })
      : undefined;
  const document = await api.createEntity(kind.type, {
    client_id: clientId,
    ...(vendor ? { vendor_id: vendor.id } : {}),
    ...(kind.type === 'recurring_invoices' ? { frequency_id: '5' } : {}),
    line_items: notes.map((note, index) => ({
      product_key: `${marker}-${index}`,
      notes: note,
      quantity: 1,
      cost: 10 + index,
      type_id: '1',
      tax_id: '1',
    })),
  });
  expect(document?.id, `API setup must create ${kind.type}`).toBeTruthy();
  return { id: String(document.id), clientId, notes };
}

export function listRow(page: Page, id: string) {
  return page
    .locator('[data-cy="dataTable"] tbody tr')
    .filter({ has: page.locator(`a[href*="/${id}"]`) });
}

export const lineNotes = (page: Page) =>
  page.locator('tr[id^="line-item-"] textarea#notes');

export async function openList(page: Page, type: string) {
  await page.goto(`/${type}`);
  await expect(page.locator('[data-cy="dataTable"]')).toBeVisible();
  // A hard reload between actions would erase the cache and hide the regression.
  await page.evaluate(() => {
    (window as unknown as { isolationSession: string }).isolationSession =
      'same-document';
  });
}

export async function returnToList(page: Page, type: string) {
  await page.locator(`[data-cy="navigationBar"] a[href="/${type}"]`).click();
  const discard = page.getByRole('button', {
    name: 'Discard Changes',
    exact: true,
  });
  await expect
    .poll(
      async () =>
        new URL(page.url()).pathname === `/${type}` ||
        (await discard.isVisible())
    )
    .toBe(true);
  if (await discard.isVisible()) await discard.click();
  await expect(page).toHaveURL(new RegExp(`/${type}(?:\\?.*)?$`));
  await expect(page.locator('[data-cy="dataTable"]')).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { isolationSession?: string }).isolationSession
    )
  ).toBe('same-document');
}

export async function cloneRow(
  page: Page,
  sourceId: string,
  destination: DocumentKind,
  guided = false
) {
  await listRow(page, sourceId)
    .getByRole('button', { name: 'Actions', exact: true })
    .click();
  await page
    .locator('[data-tippy-root]:visible')
    .getByText('Clone To', { exact: true })
    .click();
  const dialog = page.getByRole('dialog').filter({ hasText: 'Clone To' });
  await dialog
    .getByRole('button', { name: destination.label, exact: true })
    .click();
  if (guided && destination.type === 'invoices') {
    await expect(page).toHaveURL(/\/invoices\/guided/);
  } else {
    await expect(page).toHaveURL(
      new RegExp(`/${destination.type}/create\\?action=clone`)
    );
    await expect(lineNotes(page).first()).toBeVisible();
  }
}

export async function changeNotes(page: Page, value: string) {
  await lineNotes(page).first().fill(value);
  await lineNotes(page).first().blur();
  await expect(lineNotes(page).first()).toHaveValue(value);
}

export async function deleteFirstLine(page: Page) {
  await page
    .locator('tr[id^="line-item-"]')
    .first()
    .locator('td')
    .last()
    .getByRole('button')
    .last()
    .click();
  await expect(lineNotes(page)).toHaveCount(1);
}

export async function assertServerNotes(
  page: Page,
  api: ApiFixture,
  type: EntityType,
  id: string,
  expected: string[]
) {
  const response = await page.request.get(
    `${api.context.baseUrl}/api/v1/${type}/${id}`,
    { headers: api.context.headers }
  );
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(
    body.data.line_items.map((item: { notes: string }) => item.notes)
  ).toEqual(expected);
}

export async function chooseTaskInvoice(
  page: Page,
  rows: Locator[],
  bulk: boolean
) {
  if (bulk) {
    for (const row of rows) {
      await row.locator('[data-cy="dataTableCheckbox"]').click();
      await expect(row.locator('[data-cy="dataTableCheckbox"]')).toBeChecked();
    }
    await page.locator('[data-cy="bulkActionsTrigger"]').click();
    await page
      .locator('[data-cy="bulkActionsDropdown"]')
      .getByText('Invoice Task', { exact: true })
      .click();
  } else {
    await rows[0].getByRole('button', { name: 'Actions', exact: true }).click();
    await page
      .locator('[data-tippy-root]:visible')
      .getByText('Invoice Task', { exact: true })
      .click();
  }
  await expect(page).toHaveURL(/\/invoices\/create\?.*action=invoice_task/);
}

export async function expectNotes(notes: Locator, expected: string[]) {
  await expect(notes).toHaveCount(expected.length);
  for (const [index, value] of expected.entries()) {
    await expect(notes.nth(index)).toHaveValue(value);
  }
}
