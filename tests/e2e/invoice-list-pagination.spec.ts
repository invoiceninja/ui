import { login, waitForTableData } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
} from '$tests/e2e/fixtures';
import type { Page } from '@playwright/test';

resetAccountBeforeAll();

const INVOICE_COUNT = 15;

test('preserves invoice list page after navigating back from an invoice', async ({
  page,
  api,
}) => {
  test.setTimeout(60_000);

  const client = await api.createEntity('clients', {
    name: uniqueName('pagination-client'),
    contacts: [
      {
        first_name: 'Pagination',
        last_name: 'Client',
        email: uniqueName('pagination-client') + '@example.test',
      },
    ],
  });

  for (let index = 1; index <= INVOICE_COUNT; index++) {
    await api.createEntity('invoices', {
      client_id: client.id,
      number: uniqueName(`pagination-invoice-${index}`),
      status_id: '1',
      date: '2026-06-14',
      line_items: [lineItem(index)],
    });
  }

  await login(page);
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page.waitForURL('**/invoices');
  await waitForTableData(page);

  const pageInput = getPageInput(page);
  await expect(pageInput).toHaveValue('1');
  await expect(
    page.locator('[data-cy="dataTable"]').getByText('/ 2')
  ).toBeVisible();

  await goToPage(page, 2);
  await expect(pageInput).toHaveValue('2');
  await expectStoredInvoicePage(page, 2);

  await page
    .locator('[data-cy="dataTable"] tbody a[href*="/invoices/"][href$="/edit"]')
    .first()
    .click();

  await page.waitForURL('**/invoices/**/edit');
  await expect(
    page.getByRole('heading', { name: 'Edit Invoice', exact: true }).first()
  ).toBeVisible({ timeout: 10000 });

  await page.goBack();

  await page.waitForURL('**/invoices');
  await waitForTableData(page);
  await expect(getPageInput(page)).toHaveValue('2');
});

test('navigates the invoice list with the pagination controls', async ({
  page,
  api,
}) => {
  test.setTimeout(60_000);

  const client = await api.createEntity('clients', {
    name: uniqueName('pagination-controls-client'),
    contacts: [
      {
        first_name: 'Pagination',
        last_name: 'Controls',
        email: uniqueName('pagination-controls-client') + '@example.test',
      },
    ],
  });

  for (let index = 1; index <= INVOICE_COUNT; index++) {
    await api.createEntity('invoices', {
      client_id: client.id,
      number: uniqueName(`pagination-controls-invoice-${index}`),
      status_id: '1',
      date: '2026-06-14',
      line_items: [lineItem(index)],
    });
  }

  await login(page);
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Invoices', exact: true })
    .click();

  await page.waitForURL('**/invoices');
  await waitForTableData(page);

  const pageInput = getPageInput(page);

  await expect(pageInput).toHaveValue('1');
  await expect(
    page.locator('[data-cy="dataTable"]').getByText('/ 2')
  ).toBeVisible();

  await expectControlDisabled(page, 'paginationFirstPage', true);
  await expectControlDisabled(page, 'paginationPreviousPage', true);
  await expectControlDisabled(page, 'paginationNextPage', false);
  await expectControlDisabled(page, 'paginationLastPage', false);

  const nextResponse = waitForInvoicesPage(page, 2);
  await paginationControl(page, 'paginationNextPage').click();
  await nextResponse;
  await expect(pageInput).toHaveValue('2');

  await expectControlDisabled(page, 'paginationNextPage', true);
  await expectControlDisabled(page, 'paginationLastPage', true);
  await expectControlDisabled(page, 'paginationPreviousPage', false);
  await expectControlDisabled(page, 'paginationFirstPage', false);

  await paginationControl(page, 'paginationPreviousPage').click();
  await expect(pageInput).toHaveValue('1');

  await paginationControl(page, 'paginationLastPage').click();
  await expect(pageInput).toHaveValue('2');

  await paginationControl(page, 'paginationFirstPage').click();
  await expect(pageInput).toHaveValue('1');
});

function getPageInput(page: Page) {
  return page
    .locator('[data-cy="dataTable"]')
    .locator(
      'xpath=.//span[normalize-space()="/ 2"]/preceding-sibling::input[1]'
    );
}

function waitForInvoicesPage(page: Page, pageNumber: number) {
  return page.waitForResponse(
    (currentResponse) =>
      currentResponse.request().method() === 'GET' &&
      currentResponse.url().includes('/api/v1/invoices?') &&
      currentResponse.url().includes(`page=${pageNumber}`) &&
      currentResponse.ok()
  );
}

async function goToPage(page: Page, pageNumber: number) {
  const response = waitForInvoicesPage(page, pageNumber);

  await getPageInput(page).fill(pageNumber.toString());
  await getPageInput(page).press('Enter');
  await response;
}

function paginationControl(page: Page, dataCy: string) {
  return page.locator(`[data-cy="dataTable"] [data-cy="${dataCy}"]`);
}

async function expectControlDisabled(
  page: Page,
  dataCy: string,
  disabled: boolean
) {
  const control = paginationControl(page, dataCy);

  if (disabled) {
    await expect(control).toBeDisabled();
  } else {
    await expect(control).toBeEnabled();
  }
}

async function expectStoredInvoicePage(page: Page, pageNumber: number) {
  await page.waitForFunction(
    (expectedPage) => {
      const storedFilters = JSON.parse(
        sessionStorage.getItem('dataTableFilters') || '{}'
      );

      return storedFilters.invoices?.currentPage === expectedPage;
    },
    pageNumber,
    { timeout: 5000 }
  );
}

function lineItem(index: number) {
  return {
    quantity: 1,
    cost: index,
    net_cost: index,
    product_key: `pagination-item-${index}`,
    notes: `Pagination invoice ${index}`,
    discount: 0,
    is_amount_discount: true,
    tax_name1: '',
    tax_rate1: 0,
    tax_name2: '',
    tax_rate2: 0,
    tax_name3: '',
    tax_rate3: 0,
    sort_id: 0,
    line_total: index,
    gross_line_total: index,
    custom_value1: '',
    custom_value2: '',
    custom_value3: '',
    custom_value4: '',
    type_id: '1',
    product_cost: 0,
    date: '',
    tax_id: '1',
  };
}
