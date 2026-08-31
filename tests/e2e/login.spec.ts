import { Page } from '@playwright/test';
import { test, expect } from '$tests/e2e/fixtures';

/**
 * Login step-2 regression coverage for frozen email display.
 *
 * Native Chrome Password Manager autofill cannot be invoked reliably in Playwright:
 * - Chrome requires trusted user gestures (`isTrusted`) before filling saved credentials.
 * - Automated/headless profiles typically have no saved credentials anyway.
 * - CDP `Autofill.trigger` only supports address/credit-card heuristics, not passwords.
 *
 * We simulate the autofill side effect (hidden username field overwritten + events fired)
 * to assert the UI and login payload stay tied to the email confirmed on step 1.
 */

async function mockLoginPrecheck(page: Page) {
  await page.route('**/api/v1/login/precheck', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        methods: ['password'],
        secret_required: false,
      }),
    });
  });
}

async function continueToCredentialsStep(page: Page, email: string) {
  await page.goto('/login');
  await page.locator('input[type="email"][name="email"]').fill(email);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('input[name="password"]')).toBeVisible({
    timeout: 10000,
  });
}

async function simulateHiddenEmailAutofill(page: Page, email: string) {
  await page.evaluate((autofillEmail) => {
    const input = document.querySelector<HTMLInputElement>(
      'input[type="hidden"][name="email"]'
    );

    if (!input) {
      throw new Error('Hidden email input not found on credentials step');
    }

    input.value = autofillEmail;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, email);
}

test('credentials step shows frozen email text and a hidden submit field', async ({
  page,
}) => {
  await mockLoginPrecheck(page);
  await continueToCredentialsStep(page, 'alice@example.test');

  await expect(page.getByText('alice@example.test', { exact: true })).toBeVisible();
  await expect(page.locator('input[type="email"][name="email"]')).toHaveCount(0);
  await expect(page.locator('input[type="hidden"][name="email"]')).toHaveValue(
    'alice@example.test'
  );
  await expect(page.locator('input[type="hidden"][name="email"]')).toBeHidden();
});

test('credentials step keeps displayed email when hidden email field is overwritten', async ({
  page,
}) => {
  await mockLoginPrecheck(page);
  await continueToCredentialsStep(page, 'alice@example.test');

  await simulateHiddenEmailAutofill(page, 'bob@gmail.com');

  await expect(page.getByText('alice@example.test', { exact: true })).toBeVisible();
  await expect(page.getByText('bob@gmail.com', { exact: true })).not.toBeVisible();
});

test('change link returns to the editable email step', async ({ page }) => {
  await mockLoginPrecheck(page);
  await continueToCredentialsStep(page, 'alice@example.test');

  await page.getByText('Change', { exact: true }).click();

  const emailInput = page.locator('input[type="email"][name="email"]');
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await expect(emailInput).toHaveValue('alice@example.test');
  await expect(page.locator('input[type="hidden"][name="email"]')).toHaveCount(0);
  await expect(page.locator('input[name="password"]')).not.toBeVisible();
});

test('login submits the confirmed email after hidden email field overwrite', async ({
  page,
}) => {
  const loginRequests: Array<Record<string, unknown>> = [];

  await mockLoginPrecheck(page);

  await page.route('**/api/v1/login', async (route) => {
    loginRequests.push(route.request().postDataJSON() as Record<string, unknown>);

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

  await continueToCredentialsStep(page, 'alice@example.test');
  await simulateHiddenEmailAutofill(page, 'bob@gmail.com');

  await page.locator('input[name="password"]').fill('wrong-password');
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  await expect(page.getByRole('status')).toContainText(
    'These credentials do not match our records.',
    { timeout: 10000 }
  );
  expect(loginRequests[0]).toMatchObject({
    email: 'alice@example.test',
    password: 'wrong-password',
  });
});
