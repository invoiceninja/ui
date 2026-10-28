import { resetAccountBeforeAll, test, expect, uniqueName } from './fixtures';
import {
  chooseTaskInvoice,
  createClient,
  lineNotes,
  listRow,
  openList,
  returnToList,
  startSession,
} from './document-isolation-helpers';

resetAccountBeforeAll();

// These should pass with the task cloneDeep fix and fail with the old shallow copy.
for (const scenario of ['single', 'bulk', 'different client'] as const) {
  test(`task invoicing: ${scenario} selection must not leak into the next invoice`, async ({
    page,
    api,
  }) => {
    test.setTimeout(60000);
    const clientId = await createClient(api);
    const nextClientId =
      scenario === 'different client' ? await createClient(api) : clientId;
    const marker = uniqueName('task-isolation');
    const tasks: Record<string, unknown>[] = [];
    for (const [index, name] of ['A', 'B', 'C'].entries()) {
      const task = await api.createEntity('tasks', {
        client_id: index === 2 ? nextClientId : clientId,
        description: `${marker}-${name}`,
        rate: 100,
        time_log: JSON.stringify([[1700000000, 1700003600, '', true]]),
      });
      expect(task?.id).toBeTruthy();
      tasks.push(task);
    }
    await startSession(page, api);
    await openList(page, 'tasks');

    await test.step('Given an invoice prepared from an earlier selection', async () => {
      const first = scenario === 'bulk' ? tasks.slice(0, 2) : tasks.slice(0, 1);
      await chooseTaskInvoice(
        page,
        first.map((task) => listRow(page, String(task.id))),
        scenario === 'bulk'
      );
      await expect(lineNotes(page)).toHaveCount(first.length);
      await expect
        .poll(() =>
          lineNotes(page).evaluateAll((elements) =>
            elements.map((element) => (element as HTMLTextAreaElement).value)
          )
        )
        .toEqual(
          expect.arrayContaining(
            first.map((task) =>
              expect.stringContaining(String(task.description))
            )
          )
        );
    });
    await test.step('When returning without reloading and invoicing only C', async () => {
      await returnToList(page, 'tasks');
      await chooseTaskInvoice(
        page,
        [listRow(page, String(tasks[2].id))],
        false
      );
    });
    await test.step('Then the new invoice contains only C', async () => {
      await expect(lineNotes(page)).toHaveCount(1);
      await expect(lineNotes(page).first()).toHaveValue(
        new RegExp(`${marker}-C`)
      );
    });
  });
}

test('adding an unbilled task to the current invoice must not duplicate earlier tasks', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);
  const clientId = await createClient(api);
  const marker = uniqueName('task-append');
  const tasks: Record<string, unknown>[] = [];
  for (const suffix of ['A', 'B']) {
    tasks.push(
      await api.createEntity('tasks', {
        client_id: clientId,
        description: `${marker}-${suffix}`,
        rate: 100,
        time_log: JSON.stringify([[1700000000, 1700003600, '', true]]),
      })
    );
  }
  for (const task of tasks) expect(task?.id).toBeTruthy();
  await startSession(page, api);
  await openList(page, 'tasks');
  await chooseTaskInvoice(page, [listRow(page, String(tasks[0].id))], false);
  await expect(lineNotes(page)).toHaveCount(1);

  // The floating plus opens Add Uninvoiced Items; the table's Add Line creates
  // an empty row instead and would not exercise the task invoicing hook.
  await page.locator('.fixed.right-10.bottom-10').click();
  const dialog = page.getByRole('dialog').filter({ hasText: 'Add Item' });
  const tasksLoaded = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/tasks?') &&
      response.url().includes('client_status=uninvoiced') &&
      response.ok()
  );
  await dialog.getByRole('button', { name: 'Tasks', exact: true }).click();
  await tasksLoaded;
  const selector = dialog.getByRole('combobox', { name: 'Tasks', exact: true });
  await selector.click();
  await page
    .getByRole('option')
    .filter({ hasText: String(tasks[1].number) })
    .click();
  await dialog.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(dialog).not.toBeVisible();

  await expect(lineNotes(page)).toHaveCount(2);
  await expect
    .poll(() =>
      lineNotes(page).evaluateAll((elements) =>
        elements.map((element) => (element as HTMLTextAreaElement).value)
      )
    )
    .toEqual([
      expect.stringContaining(`${marker}-A`),
      expect.stringContaining(`${marker}-B`),
    ]);
});
