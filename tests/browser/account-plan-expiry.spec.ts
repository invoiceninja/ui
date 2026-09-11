import { expect, test, type Page } from '@playwright/test';

const timezones = [
  'UTC',
  'America/Los_Angeles',
  'Australia/Sydney',
  'Asia/Kathmandu',
  'Pacific/Kiritimati',
  'Pacific/Pago_Pago',
];
const fixture = '/tests/browser/fixtures/account-plan/index.html';

async function renderBanner(
  page: Page,
  now: number,
  params: Record<string, string>
) {
  // An epoch value represents the same instant in every browser timezone.
  // Fixed Date preserves real timers, including React/Playwright scheduling.
  await page.clock.setFixedTime(now);
  await page.goto(`${fixture}?${new URLSearchParams(params)}`);
  await expect(page.getByTestId('ready')).toBeAttached();
  expect(await page.evaluate(() => Date.now())).toBe(now);
}

for (const timezoneId of timezones) {
  test.describe(timezoneId, () => {
    test.use({ timezoneId });

    // Exercise opposite DST seasons in both hemispheres.
    for (const [date, activeUntil] of [
      ['2026-01-15', '2026-01-16T00:00:00.000Z'],
      ['2026-07-15', '2026-07-16T00:00:00.000Z'],
    ]) {
      // This PR grants the entire UTC expiry date. Use explicit expected
      // instants rather than reproducing its Day.js add(1, 'day') calculation.
      const expiry = Date.parse(activeUntil);
      const formats = {
        'API date only': date,
        'UTC datetime without offset': `${date} 00:00:00`,
        'ISO datetime without offset': `${date}T00:00:00`,
        'explicit UTC': `${date}T00:00:00.000Z`,
        'explicit offset': `${date}T05:45:00+05:45`,
      };

      for (const [format, expires] of Object.entries(formats)) {
        test(`${date}: ${format} expires at the same UTC instant`, async ({
          page,
        }) => {
          for (const delta of [-86_400_000, -43_200_000, -1, 0, 1]) {
            await test.step(`${delta}ms relative to expiry`, async () => {
              await renderBanner(page, expiry + delta, { expires });
              expect(
                await page.evaluate(
                  (zone) =>
                    Intl.DateTimeFormat().resolvedOptions().timeZone ===
                    Intl.DateTimeFormat('en', {
                      timeZone: zone,
                    }).resolvedOptions().timeZone,
                  timezoneId
                )
              ).toBe(true);
              // Existing contract is strictly before now: equality is active.
              await expect(
                page.getByText('Your account plan has expired', { exact: true })
              ).toHaveCount(delta > 0 ? 1 : 0);
              await expect(
                page.getByRole('button', { name: 'Pay now', exact: true })
              ).toHaveCount(delta > 0 ? 1 : 0);
            });
          }
        });
      }
    }

    test('an incorrect device clock can still change the result', async ({
      page,
    }) => {
      const expires = '2026-07-15T00:00:00Z';
      const expiry = Date.parse('2026-07-16T00:00:00Z');
      for (const hours of [-24, 24]) {
        await renderBanner(page, expiry + hours * 3_600_000, {
          expires,
        });
        await expect(page.getByRole('button', { name: 'Pay now' })).toHaveCount(
          hours > 0 ? 1 : 0
        );
      }
    });

    test('missing or invalid expiry, free plans and non-owners stay hidden', async ({
      page,
    }) => {
      const now = Date.parse('2026-07-17T00:00:00Z');
      const cases: Record<string, string>[] = [
        {},
        { expires: '' },
        { expires: 'invalid' },
        { expires: '2026-07-15', plan: '' },
        { expires: '2026-07-15', owner: 'false' },
      ];
      for (const params of cases) {
        await renderBanner(page, now, params);
        await expect(page.getByRole('button', { name: 'Pay now' })).toHaveCount(
          0
        );
      }
    });
  });
}
