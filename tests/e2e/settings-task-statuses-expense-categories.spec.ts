import { login } from '$tests/e2e/helpers';
import { createClient } from './client-helpers';
import {
  extractIdFromUrl,
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { type EntityType } from '$tests/e2e/api-helpers';
import { Locator, Page } from '@playwright/test';

resetAccountBeforeAll();

const TASK_STATUSES = 'task_statuses' as EntityType;
const EXPENSE_CATEGORIES = 'expense_categories' as EntityType;

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const mainInput = (page: Page, index = 0) =>
  page.getByRole('main').getByRole('textbox').nth(index);

const save = async (page: Page) => {
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
};

const typeTextbox = async (input: Locator, value: string | number) => {
  await input.click();
  await input.press('Control+A');
  await input.press('Backspace');
  await input.pressSequentially(String(value), { delay: 20 });
  await input.press('Tab');
};

const inputFieldByLabelIn = (root: Page | Locator, label: string) =>
  root
    .getByText(label, { exact: true })
    .first()
    .locator('xpath=ancestor::section[1]')
    .getByRole('textbox')
    .first();

const inputFieldByLabel = (page: Page, label: string) =>
  inputFieldByLabelIn(page.getByRole('main'), label);

const fieldContainerByLabelIn = (root: Page | Locator, label: string) =>
  root
    .getByText(label, { exact: true })
    .first()
    .locator(
      'xpath=ancestor::div[contains(@class, "w-full") or contains(@class, "sm:grid")][1]'
    );

const fieldContainerByLabel = (page: Page, label: string) =>
  fieldContainerByLabelIn(page.getByRole('main'), label);

const trackSettingsEntityFromUrl = (
  api: ApiFixture,
  type: EntityType,
  entityPath: string,
  url: string
) => {
  const id = extractIdFromUrl(url, entityPath);

  if (!id) {
    throw new Error('Could not extract ' + entityPath + ' id from ' + url);
  }

  api.trackEntity(type, id);

  return id;
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
  await expect(input).toHaveValue(query, { timeout: 10000 });
}

async function createTaskStatus(
  page: Page,
  api: ApiFixture,
  name: string
) {
  await page.goto('/settings/task_statuses/create');
  await page.waitForURL('**/settings/task_statuses/create');
  await page.waitForLoadState('networkidle');

  await typeTextbox(mainInput(page), name);
  await save(page);

  await expect(
    page.getByText('Successfully created task status', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/settings/task_statuses/**/edit');

  const id = trackSettingsEntityFromUrl(
    api,
    TASK_STATUSES,
    'task_statuses',
    page.url()
  );

  await expect(mainInput(page)).toHaveValue(name);

  return id;
}

async function updateTaskStatus(page: Page, name: string) {
  await typeTextbox(mainInput(page), name);

  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/task_statuses/') &&
      response.request().method() === 'PUT',
    { timeout: 10000 }
  );

  await save(page);

  expect((await updateResponse).ok()).toBeTruthy();
  await expect(mainInput(page)).toHaveValue(name);

  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(mainInput(page)).toHaveValue(name);
}

async function createExpenseCategory(
  page: Page,
  api: ApiFixture,
  name: string
) {
  await page.goto('/settings/expense_categories/create');
  await page.waitForURL('**/settings/expense_categories/create');

  const nameField = page.locator('[data-cy="expenseCategoryNameField"]');

  await expect(nameField).toBeVisible({ timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await typeTextbox(nameField, name);
  await save(page);

  await expect(
    page.getByText('Successfully created expense category', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/settings/expense_categories/**/edit');

  const id = trackSettingsEntityFromUrl(
    api,
    EXPENSE_CATEGORIES,
    'expense_categories',
    page.url()
  );

  await expect(mainInput(page)).toHaveValue(name);

  return id;
}

async function updateExpenseCategory(page: Page, name: string) {
  await typeTextbox(mainInput(page), name);
  await save(page);

  await expect(
    page.getByText('Successfully updated expense category', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(mainInput(page)).toHaveValue(name);
}

test('task statuses can be created, edited, and used on the kanban board', async ({
  page,
  api,
}) => {
  test.setTimeout(90000);

  await login(page);

  const suffix = Date.now().toString(36).slice(-6);
  const initialStatusName = 'ts-' + suffix;
  const updatedStatusName = 'ts-up-' + suffix;
  const clientName = uniqueName('task-status-client');
  const taskDescription = uniqueName('kanban-task');

  await createTaskStatus(page, api, initialStatusName);
  await updateTaskStatus(page, updatedStatusName);

  await createClient({
    page,
    name: clientName,
    contactEmail: clientName + '@example.test',
  });
  await api.trackEntityByName('clients', clientName);

  await page.goto('/tasks/kanban');
  await page.waitForURL('**/tasks/kanban');

  const statusHeading = page
    .getByRole('main')
    .getByText(updatedStatusName, { exact: true });

  await expect(statusHeading).toBeVisible({ timeout: 10000 });

  const statusColumn = statusHeading.locator(
    'xpath=ancestor::div[contains(@class, "rounded") and contains(@class, "border")][2]'
  );

  await statusColumn.locator('.cursor-pointer').first().click();

  const dialog = page.getByRole('dialog');

  await expect(
    dialog.getByRole('heading', { name: 'New Task', exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(
    fieldContainerByLabelIn(dialog, 'Status')
      .getByTestId('combobox-input-field')
      .first()
  ).toHaveValue(updatedStatusName, { timeout: 10000 });
  await selectAsyncOptionByText(
    page,
    fieldContainerByLabelIn(dialog, 'Client'),
    clientName,
    '/api/v1/clients'
  );
  await typeTextbox(inputFieldByLabelIn(dialog, 'Description'), taskDescription);

  const createTaskResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/tasks') &&
      response.request().method() === 'POST',
    { timeout: 10000 }
  );

  await dialog.getByRole('button', { name: 'Save', exact: true }).click();

  const taskResponse = await createTaskResponse;
  expect(taskResponse.ok()).toBeTruthy();

  const createdTask = await taskResponse.json();

  if (createdTask.data?.id) {
    api.trackEntity('tasks', createdTask.data.id);
  }

  await expect(
    page.getByText('Successfully created task', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(dialog).not.toBeVisible({ timeout: 10000 });
  await expect(
    statusColumn.getByText(taskDescription, { exact: true })
  ).toBeVisible({ timeout: 10000 });
});

test('expense categories can be created, edited, and used by expense forms', async ({
  page,
  api,
}) => {
  test.setTimeout(90000);

  await login(page);

  const initialCategoryName = uniqueName('expense-category');
  const updatedCategoryName = uniqueName('expense-category-updated');
  const expenseNote = uniqueName('expense-category-note');
  const recurringExpenseNote = uniqueName('recurring-expense-category-note');

  await createExpenseCategory(page, api, initialCategoryName);
  await updateExpenseCategory(page, updatedCategoryName);

  await page.goto('/expenses/create');
  await page.waitForURL('**/expenses/create');
  await page.waitForLoadState('networkidle');

  await selectAsyncOptionByText(
    page,
    fieldContainerByLabel(page, 'Category'),
    updatedCategoryName,
    '/api/v1/expense_categories'
  );
  await typeTextbox(inputFieldByLabel(page, 'Public Notes'), expenseNote);
  await save(page);

  await expect(
    page.getByText('Successfully created expense', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/expenses/**/edit');

  trackSettingsEntityFromUrl(api, 'expenses', 'expenses', page.url());

  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(inputFieldByLabel(page, 'Public Notes')).toHaveValue(
    expenseNote
  );
  await expect(
    fieldContainerByLabel(page, 'Category')
      .getByTestId('combobox-input-field')
      .first()
  ).toHaveValue(updatedCategoryName, { timeout: 10000 });

  await page.goto('/recurring_expenses/create');
  await page.waitForURL('**/recurring_expenses/create');
  await page.waitForLoadState('networkidle');

  await selectAsyncOptionByText(
    page,
    fieldContainerByLabel(page, 'Category'),
    updatedCategoryName,
    '/api/v1/expense_categories'
  );
  await typeTextbox(
    inputFieldByLabel(page, 'Public Notes'),
    recurringExpenseNote
  );
  await save(page);

  await expect(
    page.getByText('Successfully created recurring expense', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await page.waitForURL('**/recurring_expenses/**/edit');

  trackSettingsEntityFromUrl(
    api,
    'recurring_expenses',
    'recurring_expenses',
    page.url()
  );

  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(inputFieldByLabel(page, 'Public Notes')).toHaveValue(
    recurringExpenseNote
  );
  await expect(
    fieldContainerByLabel(page, 'Category')
      .getByTestId('combobox-input-field')
      .first()
  ).toHaveValue(updatedCategoryName, { timeout: 10000 });
});
