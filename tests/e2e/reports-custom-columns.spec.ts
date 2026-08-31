import { login } from '$tests/e2e/helpers';
import { resetAccountBeforeAll, test } from '$tests/e2e/fixtures';
import {
  CUSTOM_COLUMN_REPORT_CASES,
  exportCurrentReportAndExpectReportKeys,
  populateAndReorderCustomColumns,
  selectCustomOption,
} from '$tests/e2e/report-helpers';

resetAccountBeforeAll();

test('custom report columns can be populated, reordered, and exported for every supported report', async ({
  page,
}) => {
  test.setTimeout(300000);

  await login(page);

  for (const report of CUSTOM_COLUMN_REPORT_CASES) {
    await test.step(report.label, async () => {
      await page.goto('/reports');
      await page.waitForURL('**/reports');

      await selectCustomOption(page, 'Report', report.label);

      const reportKeys = await populateAndReorderCustomColumns(page, report);

      await exportCurrentReportAndExpectReportKeys(page, reportKeys);
    });
  }
});
