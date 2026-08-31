import { type Locator, type Page } from '@playwright/test';
import { expect, resetAccountBeforeAll, test } from '$tests/e2e/fixtures';
import { login } from '$tests/e2e/helpers';

resetAccountBeforeAll();

const reportColumn = 11;
const locationField = 'location.city';

const reportCases = [
  { label: 'Invoice', sourceColumn: 1 },
  { label: 'Quote', sourceColumn: 3 },
] as const;

test.beforeEach(async ({ page }) => {
  await login(page);
  await page.goto('/reports');
  await page.waitForURL('**/reports');
});

for (const reportCase of reportCases) {
  test(`removing a location field returns it to the ${reportCase.label} column`, async ({
    page,
  }) => {
    await selectReport(page, reportCase.label);
    await page.locator('[data-cy="customizeReportColumns"]').click();
    await page
      .locator(`[data-cy="report-column-reset-${reportColumn}"]`)
      .click();

    const source = column(page, reportCase.sourceColumn);
    const selected = column(page, reportColumn);
    const sourceLocation = item(source, locationField);
    const selectedLocation = item(selected, locationField);

    await expect(sourceLocation).toBeVisible();
    await expect(selectedLocation).toHaveCount(0);

    await page
      .locator(`[data-cy="report-column-add-all-${reportCase.sourceColumn}"]`)
      .click();

    await expect(sourceLocation).toHaveCount(0);
    await expect(selectedLocation).toBeVisible();

    await selectedLocation.locator('[data-cy="report-column-remove"]').click();

    await expect(selectedLocation).toHaveCount(0);
    await expect(sourceLocation).toBeVisible();
  });
}

async function selectReport(page: Page, label: string) {
  const reportSelect = page
    .locator('dt')
    .filter({ hasText: /^Report$/ })
    .locator('..')
    .locator('dd');

  await reportSelect.locator('svg').last().click();
  await page.getByRole('option', { name: label, exact: true }).click();
}

function column(page: Page, index: number) {
  return page.locator(`[data-cy="report-column-${index}"]`);
}

function item(column: Locator, value: string) {
  return column.locator(
    `[data-cy="report-column-item"][data-report-column-value="${value}"]`
  );
}
