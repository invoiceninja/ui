import { expect, type Page } from '@playwright/test';

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function dataTableColumnHeader(page: Page, columnLabel: string) {
  return page.locator('[data-cy="dataTable"] thead th').filter({
    has: page.locator('span', {
      hasText: new RegExp(`^${escapeRegExp(columnLabel)}$`),
    }),
  });
}

function columnFilterPopover(page: Page) {
  return page.locator('.ant-popover:visible').filter({
    has: page.getByRole('button', { name: 'Apply', exact: true }),
  });
}

export async function openColumnFilter(page: Page, columnLabel: string) {
  const header = dataTableColumnHeader(page, columnLabel);
  await expect(header).toBeVisible({ timeout: 10000 });
  await header.scrollIntoViewIfNeeded();
  await header
    .getByText(columnLabel, { exact: true })
    .locator('xpath=preceding-sibling::div[1]')
    .click();
  await expect(columnFilterPopover(page)).toBeVisible();
}

// Labels toggle options, so callers may also add to an existing selection.
export async function applyColumnFilter(
  page: Page,
  columnLabel: string,
  optionLabels: string[]
) {
  await openColumnFilter(page, columnLabel);
  const popover = columnFilterPopover(page);
  for (const label of optionLabels) {
    await popover.getByText(label, { exact: true }).click();
  }
  await popover.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(columnFilterPopover(page)).toHaveCount(0);
}

export async function clearColumnFilter(page: Page, columnLabel: string) {
  await openColumnFilter(page, columnLabel);
  await columnFilterPopover(page)
    .getByRole('button', { name: 'Clear', exact: true })
    .click();
  await expect(columnFilterPopover(page)).toHaveCount(0);
}

// Match the entire selected set and both filters, including cleared values.
export function waitForEntityListRequest(
  page: Page,
  endpoint: string,
  filters: { user_ids: string[]; assigned_user_ids: string[] }
) {
  return page.waitForResponse(
    (response) => {
      const url = new URL(response.url());
      return (
        url.pathname === endpoint &&
        response.request().method() === 'GET' &&
        response.status() === 200 &&
        Object.entries(filters).every(([key, values]) => {
          const actual = (url.searchParams.get(key) || '')
            .split(',')
            .filter(Boolean)
            .sort();
          return JSON.stringify(actual) === JSON.stringify([...values].sort());
        })
      );
    },
    { timeout: 15000 }
  );
}

export async function expectTableListsOnly(
  page: Page,
  visibleTexts: string[],
  hiddenTexts: string[]
) {
  const table = page.locator('[data-cy="dataTable"] tbody');
  for (const text of visibleTexts) {
    await expect(table.getByText(text, { exact: true })).toBeVisible({
      timeout: 10000,
    });
  }
  for (const text of hiddenTexts) {
    await expect(table.getByText(text, { exact: true })).toHaveCount(0);
  }
  if (!visibleTexts.length) {
    await expect(
      page.getByText('No records found', { exact: true })
    ).toBeVisible();
  }
}
