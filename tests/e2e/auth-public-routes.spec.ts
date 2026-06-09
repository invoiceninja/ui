import { login } from '$tests/e2e/helpers';
import { resetAccountBeforeAll, test, expect } from '$tests/e2e/fixtures';

resetAccountBeforeAll();

test('unauthenticated visitors are redirected from private routes to login', async ({
  page,
}) => {
  await page.goto('/dashboard');
  await page.waitForURL('**/login');

  await expect(
    page.getByRole('heading', { name: 'Login', exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();

  await page.locator('a[href="/recover_password"]').click();
  await page.waitForURL('**/recover_password');

  await expect(
    page.getByRole('heading', { name: /recover.*password/i })
  ).toBeVisible({ timeout: 10000 });
  await expect(page.getByLabel('Email Address')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Send Email', exact: true })
  ).toBeVisible();
});

test('login form displays API validation failures', async ({ page }) => {
  const requests: Array<Record<string, unknown>> = [];

  await page.route('**/api/v1/login', async (route) => {
    requests.push(route.request().postDataJSON() as Record<string, unknown>);

    await route.fulfill({
      status: 422,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'These credentials do not match our records.',
        errors: {
          email: ['These credentials do not match our records.'],
        },
      }),
    });
  });

  await page.goto('/login');
  await page.locator('input[name="email"]').fill('bad-auth@example.test');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  await expect(page.getByRole('status')).toContainText(
    'These credentials do not match our records.',
    { timeout: 10000 }
  );
  expect(requests[0]).toMatchObject({
    email: 'bad-auth@example.test',
    password: 'wrong-password',
  });
});

test('recover password submits the email address and shows API feedback', async ({
  page,
}) => {
  const requests: Array<Record<string, unknown>> = [];

  await page.route('**/api/v1/reset_password', async (route) => {
    requests.push(route.request().postDataJSON() as Record<string, unknown>);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Reset link queued for testing.',
        status: true,
      }),
    });
  });

  await page.goto('/recover_password');
  await page.getByLabel('Email Address').fill('reset-public@example.test');
  await page.getByRole('button', { name: 'Send Email', exact: true }).click();

  await expect(
    page.getByText('Reset link queued for testing.', { exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(page.locator('form button[disabled]').first()).toBeVisible();
  expect(requests[0]).toMatchObject({ email: 'reset-public@example.test' });
});

test('self-hosted registration route falls back to the login page', async ({
  page,
}) => {
  await page.goto('/register');
  await page.waitForURL('**/login');

  await expect(
    page.getByRole('heading', { name: 'Login', exact: true })
  ).toBeVisible({ timeout: 10000 });
});

test('authenticated users are bounced away from public auth routes', async ({
  page,
}) => {
  await login(page);

  await page.goto('/login');
  await page.waitForURL('**/dashboard');
  await expect(page.locator('[data-cy="navigationBar"]')).toBeVisible({
    timeout: 10000,
  });

  await page.goto('/recover_password');
  await page.waitForURL('**/dashboard');
});
