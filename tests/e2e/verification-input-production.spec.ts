import { expect, test } from '@playwright/test';

test('production bundle renders the verification input after a successful request', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  const verificationRequests: Array<Record<string, unknown>> = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.route('**/api/v1/verify', async (route) => {
    verificationRequests.push(
      route.request().postDataJSON() as Record<string, unknown>
    );

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Code sent for testing' }),
    });
  });

  await page.goto('/tests/e2e/fixtures/verification-input/index.html');
  await page.getByRole('button', { name: 'Send Code', exact: true }).click();

  await expect(page.getByRole('region', { name: 'SMS Code' })).toBeVisible();
  await expect(page.getByLabel('verification input')).toBeVisible();

  expect(verificationRequests).toEqual([{ phone: '+15555550100' }]);
  expect(pageErrors).toEqual([]);
});
