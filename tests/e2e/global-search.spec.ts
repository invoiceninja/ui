import { login } from '$tests/e2e/helpers';
import { resetAccountBeforeAll, test, expect } from '$tests/e2e/fixtures';

resetAccountBeforeAll();

const searchResponse = {
  client_contacts: [],
  clients: [
    {
      id: 'client-search-result',
      name: 'Searchable Client Result',
      type: '/client',
      path: '/clients',
      heading: 'Clients',
      keywords: 'customer account',
    },
  ],
  invoices: [],
  projects: [],
  settings: [
    {
      id: 'settings-company-details',
      name: 'Searchable Settings Result',
      type: '/settings',
      path: '/settings/company_details',
      heading: 'Settings',
      keywords: 'company profile localization',
    },
  ],
  tasks: [],
  products: [],
  expenses: [],
  payments: [],
  quotes: [],
  credits: [],
  recurrings: [],
  vendors: [],
  vendor_contacts: [],
};

test('global search filters results and navigates with keyboard selection', async ({
  page,
}) => {
  await page.route('**/api/v1/search**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(searchResponse),
    });
  });

  await login(page);

  await page.getByText('Find invoices, clients, and more').click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible({ timeout: 10000 });

  await expect(dialog.getByText('Searchable Client Result')).toBeVisible({
    timeout: 10000,
  });
  await expect(dialog.getByText('Searchable Settings Result')).toBeVisible({
    timeout: 10000,
  });

  await dialog.getByRole('textbox').first().fill('company profile');

  await expect(dialog.getByText('Searchable Settings Result')).toBeVisible({
    timeout: 10000,
  });
  await expect(dialog.getByText('Searchable Client Result')).not.toBeVisible({
    timeout: 10000,
  });

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.waitForURL('**/settings/company_details', { timeout: 10000 });
  await expect(
    page.getByRole('heading', { name: 'Company Details' }).first()
  ).toBeVisible({ timeout: 10000 });
});
