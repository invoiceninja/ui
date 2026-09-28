import {
  Permission,
  checkDropdownActions,
  login,
  useHasPermission,
  waitForTableData,
} from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { Page } from '@playwright/test';
import { Action } from './clients.spec';

resetAccountBeforeAll();

interface Params {
  permissions: Permission[];
}
function useExpenseInvoiceBulkActions({ permissions }: Params) {
  const hasPermission = useHasPermission({ permissions });

  const actions: Action[] = [
    {
      label: 'Invoice Expense',
      visible: hasPermission('create_invoice'),
    },
    {
      label: 'Add To Invoice',
      visible: true,
    },
  ];

  return actions;
}

const createClient = async (api: ApiFixture) => {
  const name = uniqueName('inv-exp-client');

  const client = await api.createEntity('clients', {
    name,
    contacts: [
      {
        first_name: 'Invoice',
        last_name: 'Expense',
        email: `${name}@example.test`,
      },
    ],
  });

  return { id: client.id as string, name };
};

interface ExpenseParams {
  clientId: string;
  notes: string;
  projectId?: string;
  shouldBeInvoiced?: boolean;
}
const createExpense = async (api: ApiFixture, params: ExpenseParams) => {
  const { clientId, notes, projectId, shouldBeInvoiced = true } = params;

  return api.createEntity('expenses', {
    client_id: clientId,
    ...(projectId && { project_id: projectId }),
    amount: 25,
    date: '2026-09-01',
    public_notes: notes,
    should_be_invoiced: shouldBeInvoiced,
  });
};

const openExpenses = async (page: Page, filter: string) => {
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Expenses', exact: true })
    .click();

  await page.waitForURL('**/expenses');
  await waitForTableData(page);

  await page.locator('#filter').fill(filter);
  await page.waitForTimeout(600);
};

const openProjectExpenses = async (page: Page) => {
  await page
    .locator('[data-cy="tabs"]')
    .getByRole('button', { name: 'Expenses', exact: true })
    .click();

  await waitForTableData(page);
};

const expenseRow = (page: Page, notes: string) => {
  return page
    .locator('[data-cy="dataTable"] tbody tr')
    .filter({ hasText: notes });
};

const expectExpenseStatus = async (
  page: Page,
  notes: string,
  status: string
) => {
  await expect(
    expenseRow(page, notes).getByText(status, { exact: true })
  ).toBeVisible({ timeout: 10000 });
};

const selectExpenses = async (page: Page, notes: string[]) => {
  for (const value of notes) {
    const row = expenseRow(page, value);

    await expect(row).toBeVisible({ timeout: 10000 });
    await row.locator('[data-cy="dataTableCheckbox"]').click();
  }

  await expect(page.locator('[data-cy="bulkActionsTrigger"]')).toBeVisible({
    timeout: 10000,
  });
};

const clickBulkAction = async (page: Page, label: string) => {
  await page.locator('[data-cy="bulkActionsTrigger"]').click();

  const dropdown = page.locator('[data-cy="bulkActionsDropdown"]');

  await dropdown.waitFor({ state: 'visible', timeout: 5000 });
  await dropdown.getByRole('button', { name: label, exact: true }).click();
};

const expectLineItemNotes = async (page: Page, notes: string[]) => {
  const lineItemNotes = page.locator('[id="notes"]');

  await expect(lineItemNotes).toHaveCount(notes.length, { timeout: 10000 });

  await expect
    .poll(() =>
      lineItemNotes.evaluateAll((elements) =>
        elements.map((element) => (element as HTMLTextAreaElement).value).sort()
      )
    )
    .toEqual([...notes].sort());
};

const saveNewInvoice = async (page: Page, api: ApiFixture) => {
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created invoice')).toBeVisible({
    timeout: 10000,
  });

  await page.waitForURL(/\/invoices\/[^/]+\/edit/);

  const invoiceId = page.url().match(/invoices\/([^/]+)/)?.[1];
  if (invoiceId) api.trackEntity('invoices', invoiceId);
};

test('Invoice Expense and Add To Invoice bulk actions displayed for pending expenses with admin permission', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);

  const actions = useExpenseInvoiceBulkActions({ permissions: ['admin'] });

  await api.setPermissions('expenses@example.com', ['admin']);

  const client = await createClient(api);
  const prefix = uniqueName('inv-exp');
  const notes = [`${prefix} first`, `${prefix} second`];

  for (const value of notes) {
    await createExpense(api, { clientId: client.id, notes: value });
  }

  await login(page, 'expenses@example.com', 'password');

  await openExpenses(page, prefix);

  for (const value of notes) {
    await expectExpenseStatus(page, value, 'Pending');
  }

  await selectExpenses(page, notes);

  await checkDropdownActions(page, actions, 'bulkActionsDropdown', 'dataTable');
});

test('Invoice Expense bulk action hidden without create_invoice permission', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);

  const actions = useExpenseInvoiceBulkActions({
    permissions: ['view_expense', 'edit_expense'],
  });

  await api.setPermissions('expenses@example.com', [
    'view_expense',
    'edit_expense',
  ]);

  const client = await createClient(api);
  const notes = uniqueName('inv-exp');

  await createExpense(api, { clientId: client.id, notes });

  await login(page, 'expenses@example.com', 'password');

  await openExpenses(page, notes);
  await selectExpenses(page, [notes]);

  await checkDropdownActions(page, actions, 'bulkActionsDropdown', 'dataTable');
});

test('Invoice Expense and Add To Invoice bulk actions hidden when a selected expense is not pending', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);

  const actions: Action[] = [
    { label: 'Invoice Expense', visible: false },
    { label: 'Add To Invoice', visible: false },
  ];

  const client = await createClient(api);
  const prefix = uniqueName('inv-exp');
  const pendingNotes = `${prefix} pending`;
  const loggedNotes = `${prefix} logged`;

  await createExpense(api, { clientId: client.id, notes: pendingNotes });
  await createExpense(api, {
    clientId: client.id,
    notes: loggedNotes,
    shouldBeInvoiced: false,
  });

  await login(page);

  await openExpenses(page, prefix);

  await expectExpenseStatus(page, pendingNotes, 'Pending');
  await expectExpenseStatus(page, loggedNotes, 'Logged');

  await selectExpenses(page, [pendingNotes, loggedNotes]);

  await checkDropdownActions(page, actions, 'bulkActionsDropdown', 'dataTable');
});

test('Invoice Expense bulk action rejects expenses of different clients', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);

  const firstClient = await createClient(api);
  const secondClient = await createClient(api);
  const prefix = uniqueName('inv-exp');
  const notes = [`${prefix} first`, `${prefix} second`];

  await createExpense(api, { clientId: firstClient.id, notes: notes[0] });
  await createExpense(api, { clientId: secondClient.id, notes: notes[1] });

  await login(page);

  await openExpenses(page, prefix);
  await selectExpenses(page, notes);

  await clickBulkAction(page, 'Invoice Expense');

  await expect(
    page.getByText('Error: records belong to more than one client')
  ).toBeVisible({ timeout: 10000 });

  await expect(page).toHaveURL(/\/expenses$/);
});

test('Invoice Expense bulk action creates an invoice and refreshes the expenses list', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);

  const client = await createClient(api);
  const prefix = uniqueName('inv-exp');
  const notes = [`${prefix} first`, `${prefix} second`];

  for (const value of notes) {
    await createExpense(api, { clientId: client.id, notes: value });
  }

  await login(page);

  await openExpenses(page, prefix);

  for (const value of notes) {
    await expectExpenseStatus(page, value, 'Pending');
  }

  await selectExpenses(page, notes);

  await clickBulkAction(page, 'Invoice Expense');

  await page.waitForURL(
    '**/invoices/create?table=products&action=invoice_expense'
  );

  await expectLineItemNotes(page, notes);

  await saveNewInvoice(page, api);

  await openExpenses(page, prefix);

  for (const value of notes) {
    await expectExpenseStatus(page, value, 'Invoiced');
  }
});

test('Add To Invoice bulk action updates the invoice and refreshes the expenses list', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);

  const client = await createClient(api);
  const notes = uniqueName('inv-exp');
  const invoiceNumber = uniqueName('inv-exp-target');
  const invoiceNotes = 'Existing line item';

  await createExpense(api, { clientId: client.id, notes });

  const invoice = await api.createEntity('invoices', {
    client_id: client.id,
    number: invoiceNumber,
    status_id: '1',
    date: '2026-09-01',
    line_items: [
      {
        quantity: 1,
        cost: 10,
        product_key: 'Retainer',
        notes: invoiceNotes,
        type_id: '1',
      },
    ],
  });

  await login(page);

  await openExpenses(page, notes);
  await expectExpenseStatus(page, notes, 'Pending');

  await selectExpenses(page, [notes]);

  await clickBulkAction(page, 'Add To Invoice');

  const dialog = page.getByRole('dialog');

  await expect(dialog.getByText('Add To Invoice', { exact: true })).toBeVisible(
    { timeout: 10000 }
  );

  await dialog.getByText(invoiceNumber, { exact: true }).click();

  await page.waitForURL(
    `**/invoices/${invoice.id}/edit?action=invoice_expense`
  );

  await expectLineItemNotes(page, [invoiceNotes, notes]);

  await page
    .locator('[data-cy="topNavbar"]')
    .getByRole('button', { name: 'Save', exact: true })
    .click();

  await expect(
    page.getByText('Successfully updated invoice', { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await openExpenses(page, notes);
  await expectExpenseStatus(page, notes, 'Invoiced');
});

test('Invoice Expense bulk action from the project expenses tab refreshes the project expenses', async ({
  page,
  api,
}) => {
  test.setTimeout(60000);

  const actions = useExpenseInvoiceBulkActions({ permissions: ['admin'] });

  const client = await createClient(api);
  const projectName = uniqueName('inv-exp-project');

  const project = await api.createEntity('projects', {
    name: projectName,
    client_id: client.id,
  });

  const notes = uniqueName('inv-exp');

  await createExpense(api, {
    clientId: client.id,
    projectId: project.id as string,
    notes,
  });

  await login(page);

  await page.goto(`/projects/${project.id}`);

  await openProjectExpenses(page);
  await expectExpenseStatus(page, notes, 'Pending');

  await selectExpenses(page, [notes]);

  await checkDropdownActions(page, actions, 'bulkActionsDropdown', 'dataTable');

  await page
    .locator('[data-cy="bulkActionsDropdown"]')
    .getByRole('button', { name: 'Invoice Expense', exact: true })
    .click();

  await page.waitForURL(
    '**/invoices/create?table=products&action=invoice_expense'
  );

  await expectLineItemNotes(page, [notes]);

  await saveNewInvoice(page, api);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Projects', exact: true })
    .click();

  await page.waitForURL('**/projects');
  await waitForTableData(page);

  await page.locator('#filter').fill(projectName);
  await page.waitForTimeout(600);

  await page
    .locator('[data-cy="dataTable"]')
    .getByRole('link', { name: projectName, exact: true })
    .click();

  await page.waitForURL(`**/projects/${project.id}`);

  await openProjectExpenses(page);
  await expectExpenseStatus(page, notes, 'Invoiced');
});
