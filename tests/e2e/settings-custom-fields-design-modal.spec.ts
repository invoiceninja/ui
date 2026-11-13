import { login } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import { Locator, request as playwrightRequest, Page } from '@playwright/test';

resetAccountBeforeAll();

type CompanyRecord = Record<string, any>;

const INVOICE_TARGET = 'invoice_details';
const PRODUCT_TARGET = 'product_columns';
const TOTALS_TARGET = 'total_columns';
const INVOICE_VARIABLE = '$invoice.custom1';
const PRODUCT_VARIABLE = '$product.product1';
const SURCHARGE_VARIABLE = '$custom_surcharge1';
const INVOICE_CAPTION = 'Invoice Details';
const PRODUCT_CAPTION = /^(Invoice )?Product Columns$/;
const TOTALS_CAPTION = 'Total Fields';

const save = async (page: Page) => {
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
};

const typeTextbox = async (input: Locator, value: string) => {
  await input.click();
  await input.press('Control+A');
  await input.press('Backspace');

  if (value) {
    await input.pressSequentially(value, { delay: 10 });
  }

  await input.press('Tab');
};

async function gotoAppPath(
  page: Page,
  path: string,
  ready: () => Promise<void>
) {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    try {
      await ready();
      return;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function fetchCompany(api: ApiFixture) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  const response = await context.get('/api/v1/companies', {
    headers: api.context.headers,
  });

  if (!response.ok()) {
    throw new Error('Failed to fetch company: ' + response.status());
  }

  const body = await response.json();

  await context.dispose();

  return body.data[0] as CompanyRecord;
}

async function updateCompany(api: ApiFixture, company: CompanyRecord) {
  const context = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  const response = await context.put('/api/v1/companies/' + company.id, {
    headers: api.context.headers,
    data: company,
  });

  if (!response.ok()) {
    const text = await response.text();
    await context.dispose();
    throw new Error(
      'Failed to update company: ' +
        response.status() +
        ' ' +
        text.slice(0, 300)
    );
  }

  await context.dispose();
}

function designVariables(company: CompanyRecord, target: string): string[] {
  return (company.settings?.pdf_variables?.[target] || []) as string[];
}

function withoutVariable(
  company: CompanyRecord,
  target: string,
  variable: string
) {
  return designVariables(company, target).filter(
    (current) => current !== variable
  );
}

async function resetDesignState(api: ApiFixture, company: CompanyRecord) {
  await updateCompany(api, {
    ...company,
    custom_fields: {},
    settings: {
      ...company.settings,
      pdf_variables: {
        ...company.settings?.pdf_variables,
        [INVOICE_TARGET]: withoutVariable(
          company,
          INVOICE_TARGET,
          INVOICE_VARIABLE
        ),
        [PRODUCT_TARGET]: withoutVariable(
          company,
          PRODUCT_TARGET,
          PRODUCT_VARIABLE
        ),
        [TOTALS_TARGET]: withoutVariable(
          company,
          TOTALS_TARGET,
          SURCHARGE_VARIABLE
        ),
      },
    },
  });
}

async function openInvoiceCustomFields(page: Page) {
  await gotoAppPath(page, '/settings/custom_fields/invoices', async () => {
    await expect(page.locator('#invoice1')).toBeVisible({ timeout: 10000 });
  });
}

async function setInvoiceLabel(page: Page, label: string) {
  await typeTextbox(page.locator('#invoice1'), label);
}

async function setSurchargeLabel(page: Page, label: string) {
  await typeTextbox(page.locator('#surcharge1'), label);
}

async function setProductLabelInSameSession(page: Page, label: string) {
  await page
    .locator('a[href="/settings/custom_fields/products"]')
    .first()
    .click();

  await expect(page.locator('#product1')).toBeVisible({ timeout: 10000 });

  await typeTextbox(page.locator('#product1'), label);
}

async function saveCompanySettings(page: Page) {
  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/companies/') &&
      response.request().method() === 'PUT',
    { timeout: 15000 }
  );

  await save(page);

  expect((await updateResponse).ok()).toBeTruthy();
}

async function saveFromDesignModal(page: Page, dialog: Locator) {
  const updateResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/companies/') &&
      response.request().method() === 'PUT',
    { timeout: 15000 }
  );

  await dialog.getByRole('button', { name: 'Save', exact: true }).click();

  expect((await updateResponse).ok()).toBeTruthy();
  await expect(dialog).toBeHidden({ timeout: 15000 });
}

test('design modal keeps the invoice, product and surcharge custom fields added in a single save', async ({
  page,
  api,
}) => {
  test.setTimeout(180000);

  const suffix = Date.now().toString(36).slice(-6);
  const invoiceLabel = 'CFD Invoice ' + suffix;
  const surchargeLabel = 'CFD Surcharge ' + suffix;
  const productLabel = 'CFD Product ' + suffix;

  const originalCompany = await fetchCompany(api);

  try {
    await resetDesignState(api, originalCompany);
    await login(page);

    await openInvoiceCustomFields(page);
    await setInvoiceLabel(page, invoiceLabel);
    await setSurchargeLabel(page, surchargeLabel);
    await setProductLabelInSameSession(page, productLabel);
    await saveCompanySettings(page);

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 15000 });
    await expect(dialog.getByRole('switch')).toHaveCount(3);
    await expect(dialog.getByText(invoiceLabel, { exact: true })).toBeVisible();
    await expect(dialog.getByText(productLabel, { exact: true })).toBeVisible();
    await expect(
      dialog.getByText(surchargeLabel, { exact: true })
    ).toBeVisible();

    await dialog.getByRole('button', { name: 'Yes', exact: true }).click();

    await expect(
      dialog.getByText(INVOICE_CAPTION, { exact: true })
    ).toBeVisible({ timeout: 10000 });
    await expect(dialog.getByText(PRODUCT_CAPTION)).toBeVisible();
    await expect(
      dialog.getByText(TOTALS_CAPTION, { exact: true })
    ).toBeVisible();
    await expect(dialog.getByText(invoiceLabel, { exact: true })).toBeVisible();
    await expect(dialog.getByText(productLabel, { exact: true })).toBeVisible();
    await expect(
      dialog.getByText(surchargeLabel, { exact: true })
    ).toBeVisible();

    await saveFromDesignModal(page, dialog);

    const company = await fetchCompany(api);

    expect(String(company.custom_fields?.invoice1 || '')).toContain(
      invoiceLabel
    );
    expect(String(company.custom_fields?.product1 || '')).toContain(
      productLabel
    );
    expect(String(company.custom_fields?.surcharge1 || '')).toContain(
      surchargeLabel
    );
    expect(designVariables(company, INVOICE_TARGET)).toContain(
      INVOICE_VARIABLE
    );
    expect(designVariables(company, PRODUCT_TARGET)).toContain(
      PRODUCT_VARIABLE
    );
    expect(designVariables(company, TOTALS_TARGET)).toContain(
      SURCHARGE_VARIABLE
    );
  } finally {
    await updateCompany(api, originalCompany);
  }
});

test('design modal offers the totals design when only a surcharge custom field is added', async ({
  page,
  api,
}) => {
  test.setTimeout(180000);

  const suffix = Date.now().toString(36).slice(-6);
  const surchargeLabel = 'CFD Only Surcharge ' + suffix;

  const originalCompany = await fetchCompany(api);

  try {
    await resetDesignState(api, originalCompany);
    await login(page);

    await openInvoiceCustomFields(page);
    await setSurchargeLabel(page, surchargeLabel);
    await saveCompanySettings(page);

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 15000 });
    await expect(dialog.getByRole('switch')).toHaveCount(1);
    await expect(
      dialog.getByText(TOTALS_CAPTION, { exact: true })
    ).toBeVisible();
    await expect(
      dialog.getByText(INVOICE_CAPTION, { exact: true })
    ).toBeHidden();
    await expect(
      dialog.getByText(surchargeLabel, { exact: true })
    ).toBeVisible();

    await dialog.getByRole('button', { name: 'Yes', exact: true }).click();

    await expect(dialog.getByText(TOTALS_CAPTION, { exact: true })).toBeVisible(
      {
        timeout: 10000,
      }
    );
    await expect(
      dialog.getByText(surchargeLabel, { exact: true })
    ).toBeVisible();

    await saveFromDesignModal(page, dialog);

    const company = await fetchCompany(api);

    expect(String(company.custom_fields?.surcharge1 || '')).toContain(
      surchargeLabel
    );
    expect(designVariables(company, TOTALS_TARGET)).toContain(
      SURCHARGE_VARIABLE
    );
  } finally {
    await updateCompany(api, originalCompany);
  }
});

test('design modal leaves the design untouched when the user declines', async ({
  page,
  api,
}) => {
  test.setTimeout(180000);

  const suffix = Date.now().toString(36).slice(-6);
  const invoiceLabel = 'CFD Declined Invoice ' + suffix;
  const surchargeLabel = 'CFD Declined Surcharge ' + suffix;
  const productLabel = 'CFD Declined Product ' + suffix;

  const originalCompany = await fetchCompany(api);

  try {
    await resetDesignState(api, originalCompany);

    const baseline = await fetchCompany(api);
    const invoiceBaseline = designVariables(baseline, INVOICE_TARGET);
    const productBaseline = designVariables(baseline, PRODUCT_TARGET);
    const totalsBaseline = designVariables(baseline, TOTALS_TARGET);

    await login(page);

    await openInvoiceCustomFields(page);
    await setInvoiceLabel(page, invoiceLabel);
    await setSurchargeLabel(page, surchargeLabel);
    await setProductLabelInSameSession(page, productLabel);
    await saveCompanySettings(page);

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 15000 });

    await dialog.getByRole('button', { name: 'No', exact: true }).click();

    await expect(dialog).toBeHidden({ timeout: 15000 });

    const company = await fetchCompany(api);

    expect(designVariables(company, INVOICE_TARGET)).toEqual(invoiceBaseline);
    expect(designVariables(company, PRODUCT_TARGET)).toEqual(productBaseline);
    expect(designVariables(company, TOTALS_TARGET)).toEqual(totalsBaseline);
    expect(designVariables(company, INVOICE_TARGET)).not.toContain(
      INVOICE_VARIABLE
    );
    expect(designVariables(company, PRODUCT_TARGET)).not.toContain(
      PRODUCT_VARIABLE
    );
    expect(designVariables(company, TOTALS_TARGET)).not.toContain(
      SURCHARGE_VARIABLE
    );
  } finally {
    await updateCompany(api, originalCompany);
  }
});

test('design modal only saves the groups left toggled on', async ({
  page,
  api,
}) => {
  test.setTimeout(180000);

  const suffix = Date.now().toString(36).slice(-6);
  const invoiceLabel = 'CFD Partial Invoice ' + suffix;
  const surchargeLabel = 'CFD Partial Surcharge ' + suffix;
  const productLabel = 'CFD Partial Product ' + suffix;

  const originalCompany = await fetchCompany(api);

  try {
    await resetDesignState(api, originalCompany);
    await login(page);

    await openInvoiceCustomFields(page);
    await setInvoiceLabel(page, invoiceLabel);
    await setSurchargeLabel(page, surchargeLabel);
    await setProductLabelInSameSession(page, productLabel);
    await saveCompanySettings(page);

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 15000 });

    const confirm = dialog.getByRole('button', { name: 'Yes', exact: true });
    const toggles = dialog.getByRole('switch');

    await expect(toggles).toHaveCount(3);
    await expect(confirm).toBeEnabled();

    await toggles.nth(0).click();
    await toggles.nth(1).click();
    await toggles.nth(2).click();

    await expect(confirm).toBeDisabled();

    await toggles.nth(0).click();

    await expect(confirm).toBeEnabled();
    await confirm.click();

    await expect(
      dialog.getByText(INVOICE_CAPTION, { exact: true })
    ).toBeVisible({ timeout: 10000 });
    await expect(dialog.getByText(PRODUCT_CAPTION)).toBeHidden();
    await expect(
      dialog.getByText(TOTALS_CAPTION, { exact: true })
    ).toBeHidden();
    await expect(dialog.getByText(invoiceLabel, { exact: true })).toBeVisible();

    await saveFromDesignModal(page, dialog);

    const company = await fetchCompany(api);

    expect(designVariables(company, INVOICE_TARGET)).toContain(
      INVOICE_VARIABLE
    );
    expect(designVariables(company, PRODUCT_TARGET)).not.toContain(
      PRODUCT_VARIABLE
    );
    expect(designVariables(company, TOTALS_TARGET)).not.toContain(
      SURCHARGE_VARIABLE
    );
  } finally {
    await updateCompany(api, originalCompany);
  }
});

test('custom field labels survive switching between the custom field tabs', async ({
  page,
  api,
}) => {
  test.setTimeout(180000);

  const suffix = Date.now().toString(36).slice(-6);
  const productLabel = 'CFD Kept Product ' + suffix;
  const invoiceLabel = 'CFD Kept Invoice ' + suffix;
  const surchargeLabel = 'CFD Kept Surcharge ' + suffix;

  const originalCompany = await fetchCompany(api);

  try {
    await resetDesignState(api, originalCompany);
    await login(page);

    await gotoAppPath(page, '/settings/custom_fields/products', async () => {
      await expect(page.locator('#product1')).toBeVisible({ timeout: 10000 });
    });

    await typeTextbox(page.locator('#product1'), productLabel);

    await page
      .locator('a[href="/settings/custom_fields/invoices"]')
      .first()
      .click();

    await expect(page.locator('#invoice1')).toBeVisible({ timeout: 10000 });

    await typeTextbox(page.locator('#invoice1'), invoiceLabel);
    await typeTextbox(page.locator('#surcharge1'), surchargeLabel);

    await page
      .locator('a[href="/settings/custom_fields/products"]')
      .first()
      .click();

    await expect(page.locator('#product1')).toHaveValue(productLabel, {
      timeout: 10000,
    });

    await saveCompanySettings(page);

    const dialog = page.getByRole('dialog');

    await expect(dialog).toBeVisible({ timeout: 15000 });
    await dialog.getByRole('button', { name: 'No', exact: true }).click();
    await expect(dialog).toBeHidden({ timeout: 15000 });

    const company = await fetchCompany(api);

    expect(String(company.custom_fields?.product1 || '')).toContain(
      productLabel
    );
    expect(String(company.custom_fields?.invoice1 || '')).toContain(
      invoiceLabel
    );
    expect(String(company.custom_fields?.surcharge1 || '')).toContain(
      surchargeLabel
    );
  } finally {
    await updateCompany(api, originalCompany);
  }
});
