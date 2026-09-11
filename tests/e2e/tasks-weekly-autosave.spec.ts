import { login } from '$tests/e2e/helpers';
import { test, expect, uniqueName, type ApiFixture } from '$tests/e2e/fixtures';
import type { Page } from '@playwright/test';

// Point WEEKLY_NETWORK_BASE_URL at a Vite dev server to cover StrictMode remounts.
test.use({
  timezoneId: 'UTC',
  ...(process.env.WEEKLY_NETWORK_BASE_URL
    ? { baseURL: process.env.WEEKLY_NETWORK_BASE_URL }
    : {}),
});
const date = '2026-06-09';

async function setup(
  page: Page,
  api: ApiFixture,
  project?: Record<string, unknown>
) {
  const description = uniqueName('weekly-autosave');
  const start = Date.UTC(2026, 5, 9, 9) / 1000;
  const blank = await page.request.get(
    `${api.context.baseUrl}/api/v1/tasks/create`,
    { headers: api.context.headers }
  );
  expect(blank.ok()).toBeTruthy();
  const task = await api.createEntity('tasks', {
    ...(await blank.json()).data,
    ...(project
      ? { project_id: project.id, client_id: project.client_id }
      : {}),
    description,
    date,
    is_date_based: true,
    time_log: JSON.stringify([[start, start + 4500, '', true]]),
  });
  expect(task.id).toBeTruthy();
  await login(page);
  await page.goto(
    `/tasks/daily?date=${date}${project ? `&project=${project.id}` : ''}`
  );
  await page.getByRole('link', { name: 'Weekly', exact: true }).click();
  const cell = page
    .getByRole('row')
    .filter({ hasText: description })
    .locator('input[data-weekly-cell]')
    .nth(2);
  await expect(cell).toHaveValue('1.25');
  if (project)
    await expect(
      page.getByPlaceholder('Filter by Project', { exact: true })
    ).toHaveValue(String(project.name));
  const now = new Date();
  await page.clock.install({ time: now });
  await page.clock.pauseAt(now);
  const readSeconds = async () => {
    const response = await page.request.get(
      `${api.context.baseUrl}/api/v1/tasks/${task.id}`,
      { headers: api.context.headers }
    );
    expect(response.ok()).toBeTruthy();
    return JSON.parse((await response.json()).data.time_log).reduce(
      (sum: number, [s, e]: number[]) => sum + e - s,
      0
    );
  };
  const dialog = page
    .getByRole('dialog')
    .filter({ hasText: 'Please save or cancel your changes' });
  const leave = async () => {
    await page.getByRole('link', { name: 'Daily', exact: true }).click();
    await page.clock.runFor(350);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button')).toHaveCount(2);
    await expect(page).toHaveURL(`/tasks/weekly?date=${date}`);
  };
  return { cell, task, dialog, leave, readSeconds };
}

for (const choice of ['Discard Changes', 'Continue Editing']) {
  test(`weekly pending edits: ${choice}`, async ({ page, api }) => {
    const { cell, dialog, leave, readSeconds } = await setup(page, api);
    await cell.fill('2');
    await leave();
    // An open dialog pauses the debounce: discard must not race an autosave.
    await page.clock.runFor(3000);
    expect(await readSeconds()).toBe(4500);
    await dialog.getByRole('button', { name: choice, exact: true }).click();
    await page.clock.runFor(350);
    if (choice === 'Continue Editing') {
      await expect(page).toHaveURL(`/tasks/weekly?date=${date}`);
      await expect(cell).toHaveValue('2');
      await page.clock.runFor(2500);
      await expect.poll(readSeconds).toBe(7200);
    } else {
      await expect(page).toHaveURL(`/tasks/daily?date=${date}`);
      expect(await readSeconds()).toBe(4500);
    }
  });
}

test('weekly save failure retains edits and permits retry before leaving', async ({
  page,
  api,
}) => {
  const { cell, task, dialog, leave, readSeconds } = await setup(page, api);
  let fail = true;
  await page.route(`**/api/v1/tasks/${task.id}`, async (route) => {
    if (route.request().method() === 'PUT' && fail) {
      await route.fulfill({
        status: 422,
        json: {
          message: 'Save rejected',
          errors: { time_log: ['Save rejected'] },
        },
      });
    } else await route.continue();
  });
  await cell.fill('2');
  await page.clock.runFor(2500);
  await expect(
    page.getByRole('alert').filter({ hasText: 'Changes could not be saved' })
  ).toBeVisible();
  await leave();
  await dialog
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();
  await page.clock.runFor(350);
  await expect(cell).toHaveValue('2');
  expect(await readSeconds()).toBe(4500);
  fail = false;
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect.poll(readSeconds).toBe(7200);
  await page.clock.runFor(350);
  await page.getByRole('link', { name: 'Daily', exact: true }).click();
  await expect(page).toHaveURL(`/tasks/daily?date=${date}`);
});

test('weekly waits for an active save before leaving and disables discard', async ({
  page,
  api,
}) => {
  const { cell, task, dialog, leave, readSeconds } = await setup(page, api);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requested!: () => void;
  const started = new Promise<void>((resolve) => {
    requested = resolve;
  });
  await page.route(`**/api/v1/tasks/${task.id}`, async (route) => {
    if (route.request().method() === 'PUT') {
      requested();
      await gate;
    }
    await route.continue();
  });
  try {
    await cell.fill('2');
    await page.clock.runFor(2000);
    await started;
    await cell.fill('3');
    await leave();
    await expect(
      dialog.getByRole('button', { name: 'Discard Changes', exact: true })
    ).toBeDisabled();
    release();
    await expect.poll(readSeconds).toBe(7200);
    await page.clock.runFor(350);
    await dialog
      .getByRole('button', { name: 'Discard Changes', exact: true })
      .click();
    await expect(page).toHaveURL(`/tasks/daily?date=${date}`);
    // The completed request stays saved; the newer, unsent edit is discarded.
    expect(await readSeconds()).toBe(7200);
  } finally {
    release();
  }
});

test('weekly protects week changes and discards only unsent edits', async ({
  page,
  api,
}) => {
  const { cell, dialog, readSeconds } = await setup(page, api);
  await cell.fill('2');
  await page.getByRole('button', { name: 'next week', exact: true }).click();
  await page.clock.runFor(350);
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(`/tasks/weekly?date=${date}`);
  await dialog
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();
  await expect(page).toHaveURL('/tasks/weekly?date=2026-06-14');
  expect(await readSeconds()).toBe(4500);
});

test('weekly browser Back opens the dialog and Continue Editing preserves the page', async ({
  page,
  api,
}) => {
  const { cell, dialog } = await setup(page, api);
  await cell.fill('2');
  await page.clock.runFor(100);
  await page.goBack();
  await page.clock.runFor(350);
  await expect(dialog).toBeVisible();
  await dialog
    .getByRole('button', { name: 'Continue Editing', exact: true })
    .click();
  await page.clock.runFor(350);
  await expect(page).toHaveURL(`/tasks/weekly?date=${date}`);
  await expect(cell).toHaveValue('2');
});

test('weekly clean navigation has no prompt after autosave', async ({
  page,
  api,
}) => {
  const { cell, dialog, readSeconds } = await setup(page, api);
  await cell.fill('2');
  await page.clock.runFor(2500);
  await expect.poll(readSeconds).toBe(7200);
  await page.clock.runFor(350);
  await expect(
    page.getByText('Successfully updated task', { exact: true })
  ).toBeVisible();
  await page.getByRole('link', { name: 'Daily', exact: true }).click();
  await expect(page).toHaveURL(`/tasks/daily?date=${date}`);
  await expect(dialog).not.toBeVisible();
});

test('weekly refresh warns about unsaved edits', async ({ page, api }) => {
  const { cell } = await setup(page, api);
  await cell.fill('2');
  await page.clock.runFor(100);
  const warning = page.waitForEvent('dialog');
  const reload = page.evaluate(() => {
    window.location.reload();
  });
  const nativeDialog = await warning;
  expect(nativeDialog.type()).toBe('beforeunload');
  await nativeDialog.dismiss();
  await reload;
  await expect(cell).toHaveValue('2');
});

for (const destination of ['sidebar', 'task']) {
  test(`weekly guards ${destination} navigation`, async ({ page, api }) => {
    const { cell, task, dialog, readSeconds } = await setup(page, api);
    await cell.fill('2');
    if (destination === 'sidebar') {
      await page
        .getByRole('link', { name: 'Dashboard', exact: true })
        .first()
        .click();
    } else {
      await cell
        .locator('xpath=ancestor::tr')
        .getByRole('button')
        .first()
        .click();
    }
    await page.clock.runFor(350);
    await expect(dialog).toBeVisible();
    await dialog
      .getByRole('button', { name: 'Discard Changes', exact: true })
      .click();
    await expect(page).toHaveURL(
      destination === 'sidebar' ? '/dashboard' : `/tasks/${task.id}/edit`
    );
    expect(await readSeconds()).toBe(4500);
  });
}

test('weekly guards project filter changes', async ({ page, api }) => {
  const client = await api.createEntity('clients', {
    name: uniqueName('weekly-filter-client'),
    contacts: [{ first_name: 'Weekly', email: 'weekly-filter@example.test' }],
  });
  expect(client.id).toBeTruthy();
  const project = await api.createEntity('projects', {
    name: uniqueName('weekly-filter'),
    client_id: client.id,
    task_rate: 0,
  });
  expect(project.id).toBeTruthy();
  const { cell, dialog, readSeconds } = await setup(page, api, project);
  await cell.fill('2');
  // Clearing an active filter changes the displayed data and must be guarded.
  await page
    .getByPlaceholder('Filter by Project', { exact: true })
    .locator('..')
    .getByRole('button')
    .click();
  await page.clock.runFor(350);
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(
    `/tasks/weekly?date=${date}&project=${project.id}`
  );
  await dialog
    .getByRole('button', { name: 'Discard Changes', exact: true })
    .click();
  await expect(page).toHaveURL(`/tasks/weekly?date=${date}`);
  expect(await readSeconds()).toBe(4500);
});

for (const choice of ['Discard Changes']) {
  test(`weekly browser Back: ${choice} resumes the original destination`, async ({
    page,
    api,
  }) => {
    const { cell, dialog, readSeconds } = await setup(page, api);
    await cell.fill('2');
    await page.clock.runFor(100);
    await page.goBack();
    await page.clock.runFor(350);
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: choice, exact: true }).click();
    await expect(page).toHaveURL(`/tasks/daily?date=${date}`);
    expect(await readSeconds()).toBe(4500);
  });
}

test('weekly editing a value sends one save and one list refresh', async ({
  page,
  api,
}) => {
  const { cell, task, readSeconds } = await setup(page, api);
  const saves: string[] = [];
  const refreshes: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (
      request.method() === 'PUT' &&
      url.pathname === `/api/v1/tasks/${task.id}`
    )
      saves.push(request.url());
    if (
      request.method() === 'GET' &&
      url.pathname === '/api/v1/tasks' &&
      url.searchParams.get('sort') === 'date|asc'
    )
      refreshes.push(request.url());
  });
  const refreshed = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      response.ok() &&
      response.request().method() === 'GET' &&
      url.pathname === '/api/v1/tasks' &&
      url.searchParams.get('sort') === 'date|asc'
    );
  });
  await cell.fill('2');
  await page.clock.runFor(2500);
  await refreshed;
  await page.clock.runFor(5000);
  expect(await readSeconds()).toBe(7200);
  expect(saves).toHaveLength(1);
  expect(refreshes).toHaveLength(1);
});
