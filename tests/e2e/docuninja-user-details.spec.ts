import { expect, resetAccountBeforeAll, test } from '$tests/e2e/fixtures';
import { login } from '$tests/e2e/helpers';

resetAccountBeforeAll();

const timestamp = '2026-08-16T00:00:00.000Z';
const transparentPixel =
  'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

const companyUser = {
  id: 'company-user-playwright',
  is_owner: true,
  is_admin: true,
  account_id: 'account-playwright',
  company_id: 'company-playwright',
  user_id: 'playwright-user',
  permissions: [],
  role: 'owner',
  created_at: timestamp,
  updated_at: timestamp,
  archived_at: null,
  notifications: [],
};

const docuNinjaSession = {
  id: 'playwright-owner',
  account: {
    id: 'account-playwright',
    plan: null,
    plan_term: null,
    plan_expires: null,
    plan_paid: null,
    trial_ends_at: null,
    num_users: 2,
    is_active: true,
    pending_downgrade: false,
    created_at: timestamp,
    updated_at: timestamp,
  },
  companies: [],
  company_user: companyUser,
};

const docuNinjaUser = {
  id: 'playwright-user',
  account_id: 'account-playwright',
  first_name: 'Playwright',
  last_name: 'User',
  phone_number: null,
  email: 'playwright-user@example.test',
  phone_number_verified: true,
  is_deleted: 0,
  referral_code: null,
  oauth_user_id: null,
  oauth_user_token: null,
  oauth_provider_id: null,
  google_2fa_secret: null,
  accepted_terms_version: null,
  avatar: '',
  e_signature: transparentPixel,
  e_initials: transparentPixel,
  created_at: timestamp,
  updated_at: timestamp,
  archived_at: null,
  email_verified_at: timestamp,
  account: null,
  permissions: [],
  company_user: companyUser,
};

test('DocuNinja user details renders and updates signature state without errors', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.route('**/api/docuninja/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: docuNinjaSession }),
    });
  });

  await page.route(/\/api\/users\/playwright-user(?:\?.*)?$/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: docuNinjaUser }),
    });
  });

  await login(page);
  await page.goto('/docuninja/users/playwright-user/edit');

  const userDetails = page.locator('main');

  await expect(userDetails.locator('input').nth(0)).toHaveValue('Playwright', {
    timeout: 15000,
  });
  await expect(userDetails.locator('input').nth(1)).toHaveValue('User');
  await expect(userDetails.locator('input').nth(2)).toHaveValue(
    'playwright-user@example.test'
  );

  const signature = page.getByRole('img', { name: 'Signature', exact: true });
  await expect(signature).toBeVisible();

  await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
  await expect(
    page.getByRole('button', { name: 'Done', exact: true }).first()
  ).toBeVisible();

  await page.getByRole('button', { name: 'Done', exact: true }).first().click();
  await expect(signature).toBeVisible();

  expect(pageErrors).toEqual([]);
});
