import { login } from '$tests/e2e/helpers';
import { test, expect, uniqueName } from '$tests/e2e/fixtures';

// Fixtures use UTC instants; pin the browser zone for midnight boundaries.
test.use({ timezoneId: 'UTC' });

const date = '2026-06-09';
const timestamp = (day: number, hour: number) =>
  Date.UTC(2026, 5, day, hour) / 1000;

for (const scenario of [
  {
    name: 'multiple entries with different notes and billing flags',
    logs: [
      [timestamp(9, 9), timestamp(9, 10), 'Billable session', true],
      [timestamp(9, 11), timestamp(9, 13), 'Internal session', false],
    ],
    locked: [2],
    reason: 'Multiple time entries—edit individually.',
    total: '3',
  },
  {
    name: 'an overnight entry on both affected days',
    logs: [[timestamp(9, 23), timestamp(10, 2), 'Overnight work', false]],
    locked: [2, 3],
    reason: 'This time entry spans multiple days—edit individually.',
    total: '1',
  },
]) {
  test(`weekly protects ${scenario.name}`, async ({ page, api }) => {
    const description = uniqueName('weekly-read-only');
    const blank = await page.request.get(
      `${api.context.baseUrl}/api/v1/tasks/create`,
      { headers: api.context.headers }
    );
    expect(blank.ok()).toBeTruthy();
    const task = await api.createEntity('tasks', {
      ...(await blank.json()).data,
      description,
      date,
      is_date_based: true,
      time_log: JSON.stringify(scenario.logs),
    });
    expect(task.id).toBeTruthy();
    const readTask = async () => {
      const response = await page.request.get(
        `${api.context.baseUrl}/api/v1/tasks/${task.id}`,
        { headers: api.context.headers }
      );
      expect(response.ok()).toBeTruthy();
      return (await response.json()).data;
    };
    const before = await readTask();
    await login(page);
    await page.goto(`/tasks/weekly?date=${date}`);
    const row = page.getByRole('row').filter({ hasText: description });
    const inputs = row.locator('input[data-weekly-cell]');
    await expect(inputs.nth(2)).toHaveValue(scenario.total);
    for (const index of scenario.locked) {
      const input = inputs.nth(index);
      await expect(input).toHaveAttribute('readonly', '');
      await expect(input).not.toHaveAttribute('title');
      await input.hover();
      await expect(
        page.getByText(scenario.reason, { exact: true })
      ).toBeVisible();
      await expect(
        input.locator('..').getByRole('button', { name: 'note', exact: true })
      ).toBeDisabled();
      await input.focus();
      await input.press('7');
    }
    // Locking one day must not lock the whole task. Editing an empty day also
    // proves the resulting PUT preserves all protected time entries verbatim.
    const empty = inputs.nth(4);
    await expect(empty).toBeEditable();
    const update = page.waitForResponse(
      (r) =>
        new URL(r.url()).pathname === `/api/v1/tasks/${task.id}` &&
        r.request().method() === 'PUT'
    );
    await empty.fill('0.5');
    expect((await update).ok()).toBeTruthy();
    const after = await readTask();
    expect(JSON.parse(after.time_log)).toEqual(
      expect.arrayContaining(JSON.parse(before.time_log))
    );
    expect(JSON.parse(after.time_log)).toHaveLength(scenario.logs.length + 1);
    await expect(
      row.getByRole('button', { name: 'Edit time entries', exact: true })
    ).toHaveCount(0);
  });
}

test('weekly permits a single entry ending at midnight and preserves duration on note edits', async ({
  page,
  api,
}) => {
  const description = uniqueName('weekly-midnight');
  const blank = await page.request.get(
    `${api.context.baseUrl}/api/v1/tasks/create`,
    { headers: api.context.headers }
  );
  expect(blank.ok()).toBeTruthy();
  const task = await api.createEntity('tasks', {
    ...(await blank.json()).data,
    description,
    date,
    is_date_based: true,
    time_log: JSON.stringify([
      [timestamp(9, 23), timestamp(10, 0), 'Original note', false],
    ]),
  });
  expect(task.id).toBeTruthy();
  await login(page);
  await page.goto(`/tasks/weekly?date=${date}`);
  const row = page.getByRole('row').filter({ hasText: description });
  const input = row.locator('input[data-weekly-cell]').nth(2);
  await expect(input).toHaveValue('1');
  await expect(input).toBeEditable();
  await expect(row.locator('input[data-weekly-cell]').nth(3)).toBeEditable();
  await input
    .locator('..')
    .getByRole('button', { name: 'note', exact: true })
    .click();
  const update = page.waitForResponse(
    (r) =>
      new URL(r.url()).pathname === `/api/v1/tasks/${task.id}` &&
      r.request().method() === 'PUT'
  );
  await page.locator('textarea').fill('Updated note');
  const response = await update;
  expect(response.ok()).toBeTruthy();
  const saved = (await response.json()).data;
  expect(JSON.parse(saved.time_log)).toEqual([
    [timestamp(9, 23), timestamp(10, 0), 'Updated note', false],
  ]);
});
