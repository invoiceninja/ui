import { login, waitForTableData } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  extractIdFromUrl,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { request as playwrightRequest, type Locator, type Page } from '@playwright/test';

resetAccountBeforeAll();

interface BankAccountRecord {
  id: string;
  bank_account_name: string;
}

interface TransactionRuleRecord {
  id: string;
  name: string;
}

interface CleanupTargets {
  bankAccountIds: string[];
  transactionRuleIds: string[];
}

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

const mainTextbox = (page: Page, index = 0) =>
  page.getByRole('main').getByRole('textbox').nth(index);

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const fieldContainerByLabel = (page: Page, label: string) =>
  page
    .getByRole('main')
    .getByText(label, { exact: true })
    .first()
    .locator(
      'xpath=ancestor::div[contains(@class, "w-full") or contains(@class, "sm:grid")][1]'
    );

test('bank accounts can be created, edited, and inspected from settings', async ({
  page,
  api,
}) => {
  const cleanup: CleanupTargets = {
    bankAccountIds: [],
    transactionRuleIds: [],
  };

  try {
    const accountName = uniqueName('bank-account');
    const updatedName = uniqueName('bank-account-updated');

    await login(page);
    await page.goto('/settings/bank_accounts/create');
    await page.waitForURL('**/settings/bank_accounts/create');
    await page.waitForLoadState('networkidle');

    await typeTextbox(mainTextbox(page), accountName);

    const createResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/bank_integrations') &&
        response.request().method() === 'POST',
      { timeout: 10000 }
    );

    await save(page);

    const createdAccount = await parseEntity<BankAccountRecord>(
      await createResponse
    );
    cleanup.bankAccountIds.push(createdAccount.id);

    await expect(
      page.getByText('Successfully created bank account', { exact: true })
    ).toBeVisible({ timeout: 10000 });
    await page.waitForURL('**/settings/bank_accounts');
    await expect(page.getByRole('main')).toContainText(accountName, {
      timeout: 10000,
    });

    await page.getByRole('link', { name: accountName, exact: true }).click();
    await page.waitForURL('**/settings/bank_accounts/**/details');
    await expect(
      page.getByRole('heading', { name: 'Bank Account', exact: true })
    ).toBeVisible({ timeout: 10000 });
    await expect(
      page.getByRole('button', { name: 'Edit', exact: true })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.waitForURL('**/settings/bank_accounts/**/edit');
    await expect(mainTextbox(page)).toHaveValue(accountName, {
      timeout: 10000,
    });

    await typeTextbox(mainTextbox(page), updatedName);
    await mainTextbox(page, 1).fill('2026-06-01');

    const updateResponse = page.waitForResponse(
      (response) =>
        response.url().includes(
          `/api/v1/bank_integrations/${createdAccount.id}`
        ) && response.request().method() === 'PUT',
      { timeout: 10000 }
    );

    await save(page);
    expect((await updateResponse).ok()).toBeTruthy();

    await expect(
      page.getByText('Successfully updated bank account', { exact: true })
    ).toBeVisible({ timeout: 10000 });
    await page.waitForURL('**/settings/bank_accounts');
    await expect(page.getByRole('main')).toContainText(updatedName, {
      timeout: 10000,
    });
  } finally {
    await cleanupBankingRecords(api, cleanup);
  }
});

test('transaction rules can be edited and prefill matched debit conversion', async ({
  page,
  api,
}) => {
  test.setTimeout(120000);

  const cleanup: CleanupTargets = {
    bankAccountIds: [],
    transactionRuleIds: [],
  };

  try {
    const marker = uniqueName('bank-rule-marker');
    const ruleName = uniqueName('bank-rule');
    const updatedRuleName = uniqueName('bank-rule-updated');
    const bankAccount = await createBankAccountViaApi(
      api,
      uniqueName('bank-rule-account')
    );
    cleanup.bankAccountIds.push(bankAccount.id);

    const vendor = await api.createEntity('vendors', {
      name: uniqueName('bank-rule-vendor'),
      contacts: [
        {
          first_name: 'Bank',
          last_name: 'Vendor',
          email: uniqueName('bank-vendor') + '@example.test',
        },
      ],
    });
    const category = await api.createEntity('expense_categories', {
      name: uniqueName('bank-rule-category'),
    });

    await login(page);
    await page.goto('/settings/bank_accounts/transaction_rules/create');
    await page.waitForURL('**/settings/bank_accounts/transaction_rules/create');
    await page.waitForLoadState('networkidle');

    await typeTextbox(mainTextbox(page), ruleName);
    await selectAsyncOptionByText(
      page,
      fieldContainerByLabel(page, 'Vendor'),
      String(vendor.name),
      '/api/v1/vendors'
    );
    await selectAsyncOptionByText(
      page,
      fieldContainerByLabel(page, 'Expense Category'),
      String(category.name),
      '/api/v1/expense_categories'
    );

    await page.getByText('Add Rule', { exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('heading', { name: 'Add Rule', exact: true })
    ).toBeVisible({ timeout: 10000 });
    await typeTextbox(dialog.getByRole('textbox').first(), marker);
    await dialog.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('main')).toContainText(marker, {
      timeout: 10000,
    });

    const createRuleResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/api/v1/bank_transaction_rules') &&
        response.request().method() === 'POST',
      { timeout: 10000 }
    );

    await save(page);

    const createdRule = await parseEntity<TransactionRuleRecord>(
      await createRuleResponse
    );
    cleanup.transactionRuleIds.push(createdRule.id);

    await page.waitForURL('**/settings/bank_accounts/transaction_rules/**/edit');

    await typeTextbox(mainTextbox(page), updatedRuleName);

    const updateRuleResponse = page.waitForResponse(
      (response) =>
        response.url().includes(
          `/api/v1/bank_transaction_rules/${createdRule.id}`
        ) && response.request().method() === 'PUT',
      { timeout: 10000 }
    );

    await save(page);
    expect((await updateRuleResponse).ok()).toBeTruthy();

    await page.waitForURL('**/settings/bank_accounts/transaction_rules');
    await expect(page.getByRole('main')).toContainText(updatedRuleName, {
      timeout: 10000,
    });

    const transaction = await createBankTransactionViaApi(api, {
      amount: 84.32,
      bankAccountId: bankAccount.id,
      description: marker,
      ruleId: createdRule.id,
    });
    api.trackEntity('bank_transactions', transaction.id);

    await page.goto('/transactions');
    await page.waitForURL('**/transactions');
    await waitForTableData(page);

    const row = page
      .locator('[data-cy="dataTable"]')
      .locator('tbody tr')
      .filter({ hasText: marker })
      .first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.locator('td').nth(3).click();

    const details = page.getByRole('dialog');
    await expect(
      details.getByText('Withdrawal', { exact: true }).first()
    ).toBeVisible({ timeout: 20000 });
    await expect(details).toContainText(String(vendor.name), {
      timeout: 15000,
    });
    await expect(details).toContainText(String(category.name), {
      timeout: 15000,
    });
    await expect(
      details.getByRole('button', { name: 'Create Expense', exact: true }).last()
    ).toBeEnabled();
  } finally {
    await cleanupBankingRecords(api, cleanup);
  }
});

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

async function createBankAccountViaApi(
  api: ApiFixture,
  name: string
): Promise<BankAccountRecord> {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const response = await context.post('/api/v1/bank_integrations', {
      headers: api.context.headers,
      data: {
        bank_account_name: name,
        provider_name: 'Playwright Provider',
        bank_account_number: String(Date.now()),
        bank_account_type: 'checking',
      },
    });

    if (!response.ok()) {
      throw new Error(
        'Failed to create bank account: ' + (await response.text())
      );
    }

    return parseEntity<BankAccountRecord>(response);
  } finally {
    await context.dispose();
  }
}

async function createBankTransactionViaApi(
  api: ApiFixture,
  params: {
    amount: number;
    bankAccountId: string;
    description: string;
    ruleId: string;
  }
): Promise<{ id: string }> {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    const blankResponse = await context.get('/api/v1/bank_transactions/create', {
      headers: api.context.headers,
    });

    if (!blankResponse.ok()) {
      throw new Error(
        'Failed to fetch blank bank transaction: ' +
          (await blankResponse.text())
      );
    }

    const blank = await parseEntity<Record<string, unknown>>(blankResponse);
    const response = await context.post('/api/v1/bank_transactions', {
      headers: api.context.headers,
      data: {
        ...blank,
        amount: params.amount,
        bank_integration_id: params.bankAccountId,
        bank_transaction_rule_id: params.ruleId,
        base_type: 'DEBIT',
        currency_id: blank.currency_id || '1',
        date: '2026-06-09',
        description: params.description,
        status_id: '2',
      },
    });

    if (!response.ok()) {
      throw new Error(
        'Failed to create bank transaction: ' + (await response.text())
      );
    }

    return parseEntity<{ id: string }>(response);
  } finally {
    await context.dispose();
  }
}

async function cleanupBankingRecords(
  api: ApiFixture,
  targets: CleanupTargets
) {
  await cleanupEndpoint(
    api,
    '/api/v1/bank_transaction_rules/bulk',
    targets.transactionRuleIds
  );
  await cleanupEndpoint(
    api,
    '/api/v1/bank_integrations/bulk',
    targets.bankAccountIds
  );
}

async function cleanupEndpoint(
  api: ApiFixture,
  endpoint: string,
  ids: string[]
) {
  if (!ids.length) return;

  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  try {
    for (const action of ['archive', 'delete']) {
      await context.post(endpoint, {
        headers: api.context.headers,
        data: { action, ids },
      });
    }
  } finally {
    await context.dispose();
  }
}

async function parseEntity<T>(response: { json: () => Promise<unknown> }) {
  const body = (await response.json()) as {
    data?: { data?: T } | T;
  };

  if (body.data && 'data' in body.data) {
    return body.data.data as T;
  }

  return body.data as T;
}
