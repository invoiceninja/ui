import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, type Page, test } from '@playwright/test';
import {
  DATE_FORMATS,
  DATE_RANGE_MATRIX_EXCLUSIONS,
  EXPECTED_RANGE,
  LOCALE_EXPECTATIONS,
} from './fixtures/date-range-picker/matrix';

interface DateResult {
  isDayjs: boolean;
  isValid: boolean;
  isoDate: string;
}

interface RangePickerResult {
  antdPickerLocale: string;
  callbackDates: DateResult[];
  callbackDisplayDates: string[];
  configProviderLocale: string;
  dateStrings: string[];
  dayjsLocale: string;
  localeKeys: string[];
  persistedDates: DateResult[];
  persistedStrings: [string, string];
}

const expectedDates: DateResult[] = [
  { isDayjs: true, isValid: true, isoDate: EXPECTED_RANGE[0] },
  { isDayjs: true, isValid: true, isoDate: EXPECTED_RANGE[1] },
];

const excludedLocales = new Set<string>(DATE_RANGE_MATRIX_EXCLUSIONS);

const locales = readdirSync(resolve(process.cwd(), 'src/resources/lang'), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((locale) => !excludedLocales.has(locale))
  .sort();

async function selectTestRange(page: Page, dateFormat: string) {
  await page.getByLabel('Date format').selectOption(dateFormat);
  await expect(page.getByTestId('date-range-result')).toBeEmpty();

  await page.locator('.ant-picker').first().click();
  await page.getByText('Test range', { exact: true }).click();

  const output = page.getByTestId('date-range-result');
  await expect(output).not.toBeEmpty();

  const result = JSON.parse(
    (await output.textContent()) ?? ''
  ) as RangePickerResult;
  const picker = page.locator('.ant-picker').first();
  const inputs = picker.locator('input');

  await expect(inputs.nth(0)).toHaveValue(result.dateStrings[0]);
  await expect(inputs.nth(1)).toHaveValue(result.dateStrings[1]);

  // Reopen the controlled picker after its canonical string state is parsed
  // back into Dayjs. This reproduces the lifecycle that exposed Invalid Date.
  await picker.click();

  const dropdown = page.locator('.ant-picker-dropdown:visible');
  await expect(dropdown).toBeVisible();
  await expect(dropdown).not.toContainText('Invalid Date');
  await expect(
    dropdown.locator('.ant-picker-header-view').first()
  ).not.toBeEmpty();

  await page.keyboard.press('Escape');

  return result;
}

test.describe('Ant Design date range locale and format matrix', () => {
  test.describe.configure({ mode: 'parallel' });

  test('the expectation matrix covers every shipped application locale', () => {
    expect(Object.keys(LOCALE_EXPECTATIONS).sort()).toEqual(locales);
  });

  test('an unsupported locale falls back to English', async ({ page }) => {
    await page.goto(
      '/tests/e2e/fixtures/date-range-picker/index.html?locale=not-a-locale'
    );
    await expect(page.getByTestId('locale-status')).toHaveText('ready');

    const result = await selectTestRange(page, 'MMMM D, YYYY');

    expect(result.configProviderLocale).toBe('en');
    expect(result.antdPickerLocale).toBe('en_US');
    expect(result.dayjsLocale).toBe('en');
    expect(result.callbackDates).toEqual(expectedDates);
    expect(result.persistedDates).toEqual(expectedDates);
    expect(result.persistedStrings).toEqual(EXPECTED_RANGE);
    expect(result.dateStrings).toEqual(result.callbackDisplayDates);
  });

  test('production serializers handle partial, clear, and reverse ranges', async ({
    page,
  }) => {
    await page.goto(
      '/tests/e2e/fixtures/date-range-picker/index.html?locale=en'
    );
    await expect(page.getByTestId('locale-status')).toHaveText('ready');

    await page.getByTestId('exercise-serializers').click();

    await expect
      .poll(async () => {
        const value = await page.getByTestId('serializer-result').textContent();

        return value ? JSON.parse(value) : null;
      })
      .toEqual({
        cleared: ['', ''],
        ordered: EXPECTED_RANGE,
        partial: [EXPECTED_RANGE[0], ''],
      });
  });

  test('onCalendarChange persists partial, complete, and cleared ranges', async ({
    page,
  }) => {
    await page.goto(
      '/tests/e2e/fixtures/date-range-picker/index.html?locale=en'
    );
    await expect(page.getByTestId('locale-status')).toHaveText('ready');

    const picker = page.locator('.ant-picker').nth(1);
    await picker.click();

    const dropdown = page.locator('.ant-picker-dropdown:visible');
    await dropdown.locator(`td[title="${EXPECTED_RANGE[0]}"]`).first().click();

    await expect
      .poll(async () => {
        const changes = JSON.parse(
          (await page.getByTestId('calendar-change-result').textContent()) ??
            '[]'
        ) as [string, string][];

        return changes.at(-1);
      })
      .toEqual([EXPECTED_RANGE[0], '']);

    await dropdown.locator(`td[title="${EXPECTED_RANGE[1]}"]`).first().click();

    await expect
      .poll(async () => {
        const changes = JSON.parse(
          (await page.getByTestId('calendar-change-result').textContent()) ??
            '[]'
        ) as [string, string][];

        return changes.at(-1);
      })
      .toEqual(EXPECTED_RANGE);

    await picker.hover();
    await picker.locator('.ant-picker-clear').click();

    await expect
      .poll(async () => {
        const changes = JSON.parse(
          (await page.getByTestId('calendar-change-result').textContent()) ??
            '[]'
        ) as [string, string][];

        return changes.at(-1);
      })
      .toEqual(['', '']);
  });

  for (const locale of locales) {
    test(`${locale}: locale wiring and Dayjs values survive every date format`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(90_000);

      const expectation =
        LOCALE_EXPECTATIONS[locale as keyof typeof LOCALE_EXPECTATIONS];

      const pageErrors: string[] = [];
      let localeDiagnostics:
        | Pick<
            RangePickerResult,
            'configProviderLocale' | 'dayjsLocale' | 'localeKeys'
          >
        | undefined;

      page.on('pageerror', (error) => pageErrors.push(error.message));

      await page.goto(
        `/tests/e2e/fixtures/date-range-picker/index.html?locale=${encodeURIComponent(
          locale
        )}`
      );
      await expect(page.getByTestId('locale-status')).toHaveText('ready');

      for (const dateFormat of DATE_FORMATS) {
        await test.step(dateFormat, async () => {
          const result = await selectTestRange(page, dateFormat);

          localeDiagnostics ??= {
            configProviderLocale: result.configProviderLocale,
            dayjsLocale: result.dayjsLocale,
            localeKeys: result.localeKeys,
          };

          expect(
            result.callbackDates,
            `${locale} with ${dateFormat}: Ant callback contract`
          ).toEqual(expectedDates);
          expect(
            result.persistedDates,
            `${locale} with ${dateFormat}: persisted date range`
          ).toEqual(expectedDates);
          expect(
            result.persistedStrings,
            `${locale} with ${dateFormat}: canonical persisted strings`
          ).toEqual(EXPECTED_RANGE);
          expect(
            result.dateStrings,
            `${locale} with ${dateFormat}: configured display format`
          ).toEqual(result.callbackDisplayDates);
          expect(result.configProviderLocale).toBe(expectation.antdLocale);
          expect(result.antdPickerLocale).toBe(expectation.antdPickerLocale);
          expect(result.dayjsLocale).toBe(expectation.dayjsLocale);
        });
      }

      expect(pageErrors).toEqual([]);
      expect(localeDiagnostics?.configProviderLocale).toBe(
        expectation.antdLocale
      );
      expect(localeDiagnostics?.dayjsLocale).toBe(expectation.dayjsLocale);
      expect(localeDiagnostics?.localeKeys).toContain('locale');
      expect(localeDiagnostics?.localeKeys).not.toContain('default');

      await testInfo.attach('date-range-locale-diagnostics', {
        body: JSON.stringify(localeDiagnostics, null, 2),
        contentType: 'application/json',
      });
    });
  }
});
