import { getCompany, updateCompany } from './api-helpers';
import { resetAccountBeforeAll, test, expect } from './fixtures';
import {
  expectNotes,
  assertServerNotes,
  changeNotes,
  cloneRow,
  deleteFirstLine,
  documentKinds,
  lineNotes,
  openList,
  returnToList,
  seedDocument,
  startSession,
} from './document-isolation-helpers';

resetAccountBeforeAll();

// Desired behavior, not expected failures: these tests turn green when the
// clone handoff/editor is isolated or the app safely refreshes the source.
// No reloads, page.goto(), saves, or API writes occur between the two clones.
test.describe('document clone isolation', () => {
  test.setTimeout(60000);

  for (const source of documentKinds) {
    for (const destination of documentKinds) {
      for (const mutation of ['edit', 'delete'] as const) {
        test(`${source.label} to ${destination.label}: abandoned ${mutation} must not affect the next clone`, async ({
          page,
          api,
        }) => {
          const document = await seedDocument(api, source);
          await startSession(page, api);
          await openList(page, source.type);

          await test.step('Given a clone of a saved source', async () => {
            await cloneRow(page, document.id, destination);
            await expectNotes(lineNotes(page), document.notes);
          });
          await test.step('When the draft is edited and abandoned without saving', async () => {
            if (mutation === 'edit')
              await changeNotes(page, 'Only for the abandoned draft');
            else await deleteFirstLine(page);
            await returnToList(page, source.type);
            await assertServerNotes(
              page,
              api,
              source.type,
              document.id,
              document.notes
            );
          });
          await test.step('Then cloning the same list row must use the original saved lines', async () => {
            // Do not require two rows inside cloneRow: deletion is the assertion
            // under test, not a prerequisite for the second clone.
            await cloneRow(page, document.id, destination);
            await expectNotes(lineNotes(page), document.notes);
          });
        });
      }
    }
  }
});

// Peppol uses a separate invoice-to-credit builder. Exercise it through the same
// visible Clone To action, without saving or sending an electronic document.
for (const mutation of ['edit', 'delete'] as const) {
  test(`Peppol credit: abandoned ${mutation} must not affect the next clone`, async ({
    page,
    api,
    settingsGuard,
  }) => {
    test.setTimeout(60000);
    await settingsGuard.snapshot();
    const { companyId, company } = await getCompany(api.context);
    await updateCompany(api.context, companyId, {
      ...company,
      settings: { ...company.settings, e_invoice_type: 'PEPPOL' },
    });
    const source = documentKinds[0];
    const destination = documentKinds[2];
    const document = await seedDocument(api, source);
    await startSession(page, api);
    await openList(page, source.type);
    await cloneRow(page, document.id, destination);
    await expectNotes(lineNotes(page), document.notes);
    if (mutation === 'edit')
      await changeNotes(page, 'Only for the abandoned Peppol draft');
    else await deleteFirstLine(page);
    await returnToList(page, source.type);
    await assertServerNotes(
      page,
      api,
      source.type,
      document.id,
      document.notes
    );
    await cloneRow(page, document.id, destination);
    await expectNotes(lineNotes(page), document.notes);
  });
}
