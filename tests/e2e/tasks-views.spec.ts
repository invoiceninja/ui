import { login } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { type EntityType } from '$tests/e2e/api-helpers';
import {
  request as playwrightRequest,
  type Locator,
  type Page,
} from '@playwright/test';

resetAccountBeforeAll();

const TASK_STATUSES = 'task_statuses' as EntityType;
const TASK_DATE = '2026-06-09';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const timestampFor = (date: string, hour: number, minute = 0) =>
  (() => {
    const [year, month, day] = date.split('-').map(Number);

    return Math.floor(Date.UTC(year, month - 1, day, hour, minute, 0) / 1000);
  })();

const timeLog = (
  date: string,
  startHour: number,
  startMinute: number,
  durationSeconds: number,
  billable = true
) => {
  const start = timestampFor(date, startHour, startMinute);

  return JSON.stringify([[start, start + durationSeconds, '', billable]]);
};

const fieldContainerByLabelIn = (root: Page | Locator, label: string) =>
  root
    .getByText(label, { exact: true })
    .first()
    .locator(
      'xpath=ancestor::section[1] | ancestor::div[contains(@class, "w-full") or contains(@class, "sm:grid")][1]'
    );

const typeTextbox = async (input: Locator, value: string | number) => {
  await input.click();
  await input.press('Control+A');
  await input.press('Backspace');
  await input.pressSequentially(String(value), { delay: 20 });
  await input.press('Tab');
};

async function selectAsyncOptionByText(
  page: Page,
  container: Locator,
  query: string,
  endpointFragment?: string
) {
  const input = container.getByTestId('combobox-input-field').first();

  await expect(input).toBeVisible({ timeout: 10000 });
  await input.click();
  await input.fill(query);

  if (endpointFragment) {
    await page
      .waitForResponse(
        (response) =>
          response.url().includes(endpointFragment) &&
          response.url().includes('filter=') &&
          response.status() === 200,
        { timeout: 10000 }
      )
      .catch(() => {});
  }

  const option = page
    .getByRole('option', { name: new RegExp(escapeRegExp(query)) })
    .first();

  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
}

test('daily task view can quick-log time from the date view', async ({
  page,
  api,
}) => {
  test.setTimeout(90000);

  const client = await createClient(api, 'daily-task-client');
  const quickLogDescription = uniqueName('daily-quick-log');

  await login(page);
  await page.goto(`/tasks/daily?date=${TASK_DATE}`);
  await page.waitForURL(`**/tasks/daily?date=${TASK_DATE}`);

  await page
    .getByRole('main')
    .getByRole('button', { name: 'Log Time', exact: true })
    .first()
    .click();

  const dialog = page.getByRole('dialog', { name: 'Log Time' });
  await expect(dialog).toBeVisible({ timeout: 10000 });

  await selectAsyncOptionByText(
    page,
    fieldContainerByLabelIn(dialog, 'Client'),
    client.name,
    '/api/v1/clients'
  );
  await typeTextbox(
    fieldContainerByLabelIn(dialog, 'Description').getByRole('textbox').first(),
    quickLogDescription
  );
  await typeTextbox(
    fieldContainerByLabelIn(dialog, 'Duration').getByRole('textbox').first(),
    '1:30'
  );
  await expect(dialog.locator('input[type="date"]')).toHaveValue(TASK_DATE);

  const createTaskResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/tasks') &&
      response.request().method() === 'POST',
    { timeout: 10000 }
  );

  await dialog.getByRole('button', { name: 'Save', exact: true }).click();

  const createdTaskResponse = await createTaskResponse;
  expect(createdTaskResponse.ok()).toBeTruthy();

  const createdTask = (await createdTaskResponse.json()).data;
  api.trackEntity('tasks', createdTask.id);

  expect(createdTask.client_id).toBe(client.id);
  expect(createdTask.is_date_based).toBeTruthy();
  const createdLog = JSON.parse(createdTask.time_log)[0];
  expect(createdLog[1] - createdLog[0]).toBe(5400);

  await expect(
    page.getByText('Successfully created task', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(dialog).not.toBeVisible({ timeout: 10000 });
});

test('weekly task view persists inline duration edits', async ({ page, api }) => {
  test.setTimeout(90000);

  const client = await createClient(api, 'weekly-task-client');
  const description = uniqueName('weekly-task');
  const task = await createTaskFromBlank(api, {
    client_id: client.id,
    description,
    is_date_based: true,
    date: TASK_DATE,
    time_log: timeLog(TASK_DATE, 9, 0, 4500),
  });

  await login(page);
  await page.goto(`/tasks/weekly?date=${TASK_DATE}`);
  await page.waitForURL(`**/tasks/weekly?date=${TASK_DATE}`);

  const row = page.getByRole('row').filter({ hasText: description }).first();
  await expect(row).toBeVisible({ timeout: 10000 });

  const tuesdayCell = row.locator('input[data-weekly-cell]').nth(2);
  await expect(tuesdayCell).toHaveValue('1.25', { timeout: 10000 });

  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/v1/tasks/${task.id}`) &&
      response.request().method() === 'PUT',
    { timeout: 10000 }
  );

  await tuesdayCell.fill('2');
  expect((await updateResponse).ok()).toBeTruthy();

  await expect(
    page.getByText('Successfully updated task', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(tuesdayCell).toHaveValue('2');

  await page.reload();
  await expect(row).toBeVisible({ timeout: 10000 });
  await expect(tuesdayCell).toHaveValue('2', { timeout: 10000 });
});

test('calendar task view links dated tasks back to their edit form', async ({
  page,
  api,
}) => {
  test.setTimeout(90000);

  const client = await createClient(api, 'calendar-task-client');
  const description = uniqueName('calendar-task');
  const task = await createTaskFromBlank(api, {
    client_id: client.id,
    description,
    is_date_based: true,
    date: TASK_DATE,
    time_log: timeLog(TASK_DATE, 10, 0, 1800),
  });

  await login(page);
  await page.goto(`/tasks/calendar?date=${TASK_DATE}`);
  await page.waitForURL(`**/tasks/calendar?date=${TASK_DATE}`);

  const taskLink = page
    .getByRole('button', { name: description, exact: true })
    .first();

  await expect(taskLink).toBeVisible({ timeout: 10000 });
  await taskLink.click();

  await page.waitForURL(`**/tasks/${task.id}/edit`, { timeout: 10000 });
  await expect(page.getByText(description, { exact: true })).toBeVisible({
    timeout: 10000,
  });
});

test('kanban task view moves a card between task statuses', async ({
  page,
  api,
}) => {
  test.setTimeout(120000);

  const client = await createClient(api, 'kanban-task-client');
  const suffix = Date.now().toString(36).slice(-6);
  const todoStatus = await createTaskStatus(api, `todo-${suffix}`, 1);
  const doneStatus = await createTaskStatus(api, `done-${suffix}`, 2);
  const description = `move-${suffix}`;
  const task = await createTaskFromBlank(api, {
    client_id: client.id,
    status_id: todoStatus.id,
    description,
    is_date_based: true,
    date: TASK_DATE,
    time_log: '[]',
  });

  await login(page);
  await page.goto('/tasks/kanban');
  await page.waitForURL('**/tasks/kanban');

  const sourceHeading = page
    .getByRole('main')
    .getByText(todoStatus.name, { exact: true });
  const targetHeading = page
    .getByRole('main')
    .getByText(doneStatus.name, { exact: true });

  await expect(sourceHeading).toBeVisible({ timeout: 10000 });
  await expect(targetHeading).toBeVisible({ timeout: 10000 });

  const card = page
    .getByRole('button', {
      name: new RegExp(`^${escapeRegExp(description)}\\b`),
    })
    .first();
  const targetDropZone = page.locator(
    `[data-rfd-droppable-id="${doneStatus.name}"]`
  );

  await expect(card).toBeVisible({ timeout: 10000 });
  await expect(targetDropZone).toBeVisible({ timeout: 10000 });

  await card.hover();

  const startResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/v1/tasks/${task.id}`) &&
      response.url().includes('start=true') &&
      response.request().method() === 'PUT',
    { timeout: 10000 }
  );

  await card.getByRole('button', { name: 'Start', exact: true }).click();
  expect((await startResponse).ok()).toBeTruthy();
  await expect(
    page.getByText('Successfully started task', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await card.hover();

  const stopResponse = page.waitForResponse(
    (response) =>
      response.url().includes(`/api/v1/tasks/${task.id}`) &&
      response.url().includes('stop=true') &&
      response.request().method() === 'PUT',
    { timeout: 10000 }
  );

  await card.getByRole('button', { name: 'Stop', exact: true }).click();
  expect((await stopResponse).ok()).toBeTruthy();
  await expect(
    page.getByText('Successfully stopped task', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  const sortResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/tasks/sort') &&
      response.request().method() === 'POST',
    { timeout: 15000 }
  );

  await card.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');

  expect((await sortResponse).ok()).toBeTruthy();

  await expect
    .poll(async () => (await fetchTask(api, task.id)).status_id, {
      timeout: 10000,
    })
    .toBe(doneStatus.id);

  await expect(
    page.getByRole('button', {
      name: new RegExp(`^${escapeRegExp(description)}\\b`),
    })
  ).toBeVisible({ timeout: 10000 });
});

async function createClient(api: ApiFixture, prefix: string) {
  const name = uniqueName(prefix);

  const client = await api.createEntity('clients', {
    name,
    contacts: [
      {
        first_name: 'Task',
        last_name: 'Client',
        email: `${name}@example.test`,
      },
    ],
  });

  return { id: client.id as string, name: client.name as string };
}

async function createTaskStatus(
  api: ApiFixture,
  name: string,
  statusOrder: number
) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const response = await context.post('/api/v1/task_statuses', {
      headers: api.context.headers,
      data: {
        name,
        status_order: statusOrder,
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to create task status (${response.status()}): ${(
          await response.text()
        ).slice(0, 300)}`
      );
    }

    const status = (await response.json()).data;
    api.trackEntity(TASK_STATUSES, status.id);

    return { id: status.id as string, name: status.name as string };
  } finally {
    await context.dispose();
  }
}

async function createTaskFromBlank(
  api: ApiFixture,
  overrides: Record<string, unknown>
) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const blankResponse = await context.get('/api/v1/tasks/create', {
      headers: api.context.headers,
    });

    if (!blankResponse.ok()) {
      throw new Error(
        `Failed to fetch blank task (${blankResponse.status()}): ${(
          await blankResponse.text()
        ).slice(0, 300)}`
      );
    }

    const blank = (await blankResponse.json()).data;
    const response = await context.post('/api/v1/tasks', {
      headers: api.context.headers,
      data: {
        ...blank,
        ...overrides,
      },
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to create task (${response.status()}): ${(
          await response.text()
        ).slice(0, 300)}`
      );
    }

    const task = (await response.json()).data;
    api.trackEntity('tasks', task.id);

    return task;
  } finally {
    await context.dispose();
  }
}

async function fetchTask(api: ApiFixture, taskId: string) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const response = await context.get(`/api/v1/tasks/${taskId}`, {
      headers: api.context.headers,
    });

    if (!response.ok()) {
      throw new Error(
        `Failed to fetch task (${response.status()}): ${(
          await response.text()
        ).slice(0, 300)}`
      );
    }

    return (await response.json()).data as Record<string, string>;
  } finally {
    await context.dispose();
  }
}
