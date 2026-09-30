import { login, waitForTableData } from '$tests/e2e/helpers';
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

test.use({ timezoneId: 'UTC' });

const TASK_STATUSES = 'task_statuses' as EntityType;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Calendar date in UTC (matches Playwright timezoneId and activity_dates windows). */
const utcCalendarDate = () => {
  const now = new Date();

  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )
    .toISOString()
    .slice(0, 10);
};

/** Time-log segment entirely in the future but still on `taskDate` (UTC). */
const futureTimeLogOnDate = (taskDate: string) => {
  const now = Math.floor(Date.now() / 1000);
  const [year, month, day] = taskDate.split('-').map(Number);
  const endOfDayUnix = Math.floor(
    Date.UTC(year, month - 1, day, 23, 59, 59) / 1000
  );

  let start = now + 3600;
  let stop = start + 3600;

  if (stop > endOfDayUnix) {
    start = Math.max(now + 300, endOfDayUnix - 7200);
    stop = Math.min(start + 3600, endOfDayUnix);
  }

  if (start <= now || stop <= now) {
    throw new Error(
      `Cannot build future time log on ${taskDate} (now=${now}, end=${endOfDayUnix})`
    );
  }

  return { start, stop };
};

test('hides Start controls for tasks with future time logs', async ({
  page,
  api,
}) => {
  test.setTimeout(120000);

  const client = await createClient(api, 'future-start-client');
  const suffix = Date.now().toString(36).slice(-6);
  const status = await createTaskStatus(api, `future-start-${suffix}`, 1);
  const description = `future-start-${suffix}`;
  const taskDate = utcCalendarDate();
  const { start: futureStart, stop: futureStop } =
    futureTimeLogOnDate(taskDate);
  const task = await createTaskFromBlank(api, {
    client_id: client.id,
    status_id: status.id,
    description,
    is_date_based: true,
    date: taskDate,
    calculated_start_date: taskDate,
    time_log: JSON.stringify([[futureStart, futureStop, '', true]]),
  });

  await login(page);

  await expectTaskRowActionStartHidden(page, description);
  await expectTaskBulkActionStartHidden(page, description);
  await expectTaskSliderActionStartHidden(page, description);
  await expectTaskEditStartHidden(page, task.id);
  await expectDailyStartHidden(page, description, task.date ?? taskDate);
  await expectKanbanStartHidden(page, description);
});

async function expectTaskRowActionStartHidden(
  page: Page,
  description: string
) {
  const row = await openTaskListRow(page, description);

  await row.getByRole('button', { name: 'Actions', exact: true }).click();
  await expectNoStartInVisibleDropdown(page);
}

async function expectTaskBulkActionStartHidden(
  page: Page,
  description: string
) {
  const row = await openTaskListRow(page, description);

  await row.locator('[data-cy="dataTableCheckbox"]').click();
  await page.locator('[data-cy="bulkActionsTrigger"]').click();
  await expectNoStartInDropdown(page, 'bulkActionsDropdown');
}

async function expectTaskSliderActionStartHidden(
  page: Page,
  description: string
) {
  const row = await openTaskListRow(page, description);

  await row.locator('td').nth(1).click({ position: { x: 4, y: 4 } });

  const slider = visibleSliderPanel(page);
  await expect(slider).toBeVisible({ timeout: 10000 });

  await slider.getByRole('button', { name: 'Actions', exact: true }).click();
  await expectNoStartInVisibleDropdown(page);
}

async function expectTaskEditStartHidden(page: Page, taskId: string) {
  await page.goto(`/tasks/${taskId}/edit`);
  await page.waitForURL(`**/tasks/${taskId}/edit`);

  const main = page.getByRole('main');
  await expect(main.getByRole('button', { name: 'Start', exact: true })).not.toBeVisible({
    timeout: 10000,
  });

  await page
    .locator('[data-cy="topNavbar"]')
    .locator('[data-cy="chevronDownButton"]')
    .click();
  await expectNoStartInDropdown(page, 'taskActionDropdown');
}

async function expectDailyStartHidden(
  page: Page,
  description: string,
  date: string
) {
  const tasksLoaded = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/tasks') &&
      response.url().includes('activity_dates') &&
      response.status() === 200,
    { timeout: 15000 }
  );

  await page.goto(`/tasks/daily?date=${date}`);
  await page.waitForURL(`**/tasks/daily?date=${date}`);
  await tasksLoaded;

  const main = page.getByRole('main');
  await expect(main.getByText(description, { exact: true })).toBeVisible({
    timeout: 10000,
  });
  await expect(main.getByRole('button', { name: 'Start', exact: true })).not.toBeVisible();
}

async function expectKanbanStartHidden(page: Page, description: string) {
  await page.goto('/tasks/kanban');
  await page.waitForURL('**/tasks/kanban');

  const card = page
    .getByRole('button', {
      name: new RegExp(`^${escapeRegExp(description)}\\b`),
    })
    .first();

  await expect(card).toBeVisible({ timeout: 10000 });
  await card.hover();
  await expectNoStartButtonIn(card);
}

async function openTaskListRow(page: Page, description: string) {
  await page.goto('/tasks');
  await page.waitForURL('**/tasks');
  await waitForTableData(page);

  const row = taskRow(page, description);
  await expect(row).toBeVisible({ timeout: 10000 });

  return row;
}

function taskRow(page: Page, description: string) {
  return page
    .locator('[data-cy="dataTable"] tbody tr')
    .filter({ hasText: description })
    .first();
}

function visibleSliderPanel(page: Page) {
  return page.locator('[role="dialog"] form').first();
}

async function expectNoStartInVisibleDropdown(page: Page) {
  const dropdown = page.locator('[data-tippy-root]:visible').last();

  await expect(dropdown).toBeVisible({ timeout: 10000 });
  await expectNoStartButtonIn(dropdown);
}

async function expectNoStartInDropdown(page: Page, dataCy: string) {
  const dropdown = page.locator(`[data-cy="${dataCy}"]`);

  await expect(dropdown).toBeVisible({ timeout: 10000 });
  await expectNoStartButtonIn(dropdown);
}

async function expectNoStartButtonIn(locator: Locator) {
  await expect(locator.getByRole('button', { name: 'Start', exact: true })).not.toBeVisible({
    timeout: 10000,
  });
}

async function createClient(api: ApiFixture, prefix: string) {
  const name = uniqueName(prefix);

  const client = await api.createEntity('clients', {
    name,
    contacts: [
      {
        first_name: 'Future',
        last_name: 'Task',
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

    return task as { id: string; number?: string; date?: string };
  } finally {
    await context.dispose();
  }
}
