import { resetAccountBeforeAll, test, expect, uniqueName } from './fixtures';
import {
  expectNotes,
  assertServerNotes,
  changeNotes,
  cloneRow,
  documentKinds,
  lineNotes,
  listRow,
  openList,
  returnToList,
  seedDocument,
  startSession,
} from './document-isolation-helpers';

resetAccountBeforeAll();

const invoice = documentKinds[0];

test('adding a line to an abandoned clone does not merge it into the next clone', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);
  const document = await seedDocument(api, invoice);
  await startSession(page, api);
  await openList(page, invoice.type);
  await cloneRow(page, document.id, invoice);
  await page.getByRole('button', { name: 'Add Item', exact: true }).click();
  await expect(lineNotes(page)).toHaveCount(3);
  await lineNotes(page).last().fill('Must not appear in a later clone');
  await lineNotes(page).last().blur();
  await returnToList(page, invoice.type);
  await cloneRow(page, document.id, invoice);
  await expectNotes(lineNotes(page), document.notes);
});

for (const mutation of ['edit', 'delete'] as const) {
  test(`guided invoice handoff isolates an abandoned ${mutation}`, async ({
    page,
    api,
  }) => {
    test.setTimeout(60000);
    const document = await seedDocument(api, invoice);
    await startSession(page, api, true);
    await openList(page, invoice.type);
    await cloneRow(page, document.id, invoice, true);
    const notes = page.locator('input[id^="iw-desc-"]');
    // A handoff with a client advances to the items step automatically.
    await expectNotes(notes, document.notes);
    if (mutation === 'edit') {
      await notes.first().fill('Only for this guided draft');
      await notes.first().blur();
      await expect(notes.first()).toHaveValue('Only for this guided draft');
    } else {
      // Use the supported keyboard action; the description label overlaps the
      // remove button's center in this layout.
      await page
        .getByRole('button', { name: 'Remove item', exact: true })
        .first()
        .press('Enter');
      await expect(notes).toHaveCount(1);
    }
    await returnToList(page, invoice.type);
    await cloneRow(page, document.id, invoice, true);
    await expectNotes(notes, document.notes);
    await assertServerNotes(
      page,
      api,
      invoice.type,
      document.id,
      document.notes
    );
  });
}

test('adding an expense then abandoning edits does not change the cached source invoice', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);
  const document = await seedDocument(api, invoice);
  const expense = await api.createEntity('expenses', {
    client_id: document.clientId,
    amount: 25,
    should_be_invoiced: true,
    public_notes: uniqueName('expense-isolation'),
    date: new Date().toISOString().slice(0, 10),
  });
  expect(expense?.id).toBeTruthy();
  await startSession(page, api);
  await openList(page, 'expenses');

  async function addExpense() {
    await listRow(page, String(expense.id))
      .getByRole('button', { name: 'Actions', exact: true })
      .click();
    await page
      .locator('[data-tippy-root]:visible')
      .getByText('Add To Invoice', { exact: true })
      .click();
    const dialog = page
      .getByRole('dialog')
      .filter({ hasText: 'Add To Invoice' });
    // The invoice chooser uses the cached list response on the second visit.
    const response = await page.request.get(
      `${api.context.baseUrl}/api/v1/invoices/${document.id}`,
      { headers: api.context.headers }
    );
    const number = (await response.json()).data.number;
    await dialog.getByText(number, { exact: true }).click();
    await expect(page).toHaveURL(
      new RegExp(`/invoices/${document.id}/edit\\?action=invoice_expense`)
    );
    await expect(lineNotes(page)).toHaveCount(3);
  }

  await addExpense();
  await changeNotes(page, 'Abandoned edit to an existing invoice line');
  await returnToList(page, 'expenses');
  await assertServerNotes(page, api, invoice.type, document.id, document.notes);
  await addExpense();
  await expectNotes(lineNotes(page), [
    ...document.notes,
    String(expense.public_notes),
  ]);
});

// Each destination has its own item-replacement utility.
for (const destination of documentKinds) {
  test(`replacing a product in an abandoned ${destination.label} clone must not replace the next clone’s product`, async ({
    page,
    api,
  }) => {
    test.setTimeout(60000);
    const document = await seedDocument(api, invoice);
    const productKey = uniqueName('replacement-product');
    const product = await api.createEntity('products', {
      product_key: productKey,
      notes: 'Replacement product description',
      price: 75,
    });
    expect(product?.id).toBeTruthy();
    await startSession(page, api);
    await openList(page, invoice.type);
    await cloneRow(page, document.id, destination);
    const item = page
      .locator('tr[id^="line-item-"]')
      .first()
      .getByRole('textbox')
      .first();
    const originalProductKey = await item.inputValue();
    await item.fill(productKey);
    await page.getByText(productKey, { exact: true }).click();
    await expect(item).toHaveValue(productKey);
    await returnToList(page, invoice.type);
    await assertServerNotes(
      page,
      api,
      invoice.type,
      document.id,
      document.notes
    );
    await cloneRow(page, document.id, destination);
    await expect(item).toHaveValue(originalProductKey);
  });
}
