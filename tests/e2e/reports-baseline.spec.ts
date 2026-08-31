import { login } from '$tests/e2e/helpers';
import { resetAccountBeforeAll, test } from '$tests/e2e/fixtures';
import {
  REPORT_CASES,
  expectReportActions,
  expectReportFields,
  expectReportPageBaseline,
  selectCustomOption,
} from '$tests/e2e/report-helpers';

resetAccountBeforeAll();

test('all reports expose baseline controls, fields, and actions', async ({
  page,
}) => {
  test.setTimeout(180000);

  await login(page);
  await page.goto('/reports');
  await page.waitForURL('**/reports');

  for (const report of REPORT_CASES) {
    await test.step(report.label, async () => {
      await selectCustomOption(page, 'Report', report.label);
      await expectReportPageBaseline(page, report);
      await expectReportFields(page, report);
      await expectReportActions(page, report);
    });
  }
});
