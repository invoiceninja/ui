import { login } from '$tests/e2e/helpers';
import { resetAccountBeforeAll, test } from '$tests/e2e/fixtures';
import {
  REPORT_CASES,
  applyReportScheduleVariation,
  expectScheduleBaseline,
  expectScheduleFields,
  expectScheduleVariation,
  getReportScheduleVariations,
  saveScheduleAndTrack,
  scheduleCurrentReport,
  selectCustomOption,
} from '$tests/e2e/report-helpers';

resetAccountBeforeAll();

test('all reports create editable email report schedules with baseline and varied parameters', async ({
  page,
  api,
}) => {
  test.setTimeout(600000);

  await login(page);

  for (const report of REPORT_CASES) {
    await test.step(`${report.label} baseline`, async () => {
      await page.goto('/reports');
      await page.waitForURL('**/reports');

      await selectCustomOption(page, 'Report', report.label);
      await selectCustomOption(page, 'Range', 'Last 7 Days');

      await scheduleCurrentReport(page);
      await expectScheduleBaseline(page, report);
      await expectScheduleFields(page, report);

      if (report.scheduleSaveSupported === false) {
        return;
      }

      await saveScheduleAndTrack(page, api, { report });
      await expectScheduleFields(page, report);
    });

    for (const variation of getReportScheduleVariations(report)) {
      await test.step(`${report.label} ${variation.name}`, async () => {
        await page.goto('/reports');
        await page.waitForURL('**/reports');

        await selectCustomOption(page, 'Report', report.label);

        const appliedVariation = await applyReportScheduleVariation(
          page,
          variation
        );

        await scheduleCurrentReport(page);
        await expectScheduleBaseline(page, report, variation.range);
        await expectScheduleFields(page, report);
        await expectScheduleVariation(page, appliedVariation);

        if (report.scheduleSaveSupported === false) {
          return;
        }

        await saveScheduleAndTrack(page, api, {
          report,
          variation: appliedVariation,
        });
        await expectScheduleFields(page, report);
        await expectScheduleVariation(page, appliedVariation);
      });
    }
  }
});
