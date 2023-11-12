import {
  checkTableEditability,
  login,
  logout,
  permissions,
} from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';

const createClient = async (page: Page, clientName?: string) => {
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Client' })
    .click();

  await page.locator('#name').fill(clientName || 'Company Name');
  await page.locator('#first_name_0').fill('First Name');
  await page.locator('#last_name_0').fill('Last Name');
  await page.locator('#email_0').fill('first@example.com');

  await page.getByRole('button', { name: 'Save' }).click();
};

test.skip("can't view clients without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).not.toContainText(
    'Clients'
  );

  await logout(page);
});

test.skip('can view clients with admin permission', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('admin');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await expect(page.locator('[data-cy="navigationBar"]')).toContainText(
    'Clients'
  );

  await logout(page);
});

test.skip('can view client', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('view_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  await page.waitForURL('**/clients');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (doRecordsExist) {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.waitForTimeout(200);

    await page
      .getByRole('link')
      .filter({ has: page.getByText('Edit') })
      .first()
      .click();

    await expect(
      page.getByRole('heading', {
        name: 'Additional Info',
      })
    ).toBeVisible();

    await expect(
      page.getByRole('heading', {
        name: 'Details',
      })
    ).toBeVisible();
  } else {
    await expect(
      page.getByRole('heading', {
        name: "Sorry, you don't have the needed permissions.",
      })
    ).not.toBeVisible();

    await expect(page.getByText('No records found')).toBeVisible();
  }
  await logout(page);
});

test('can create a client', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  await createClient(page, 'test create client');

  await page.waitForTimeout(200);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await page.waitForURL('**/clients');

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: 'test create client', exact: true })
    .first()
    .click();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Details' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Address' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Contacts' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Standing' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('link', {
        name: 'Edit Client',
        exact: true,
      })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('button', {
        name: 'More Actions',
        exact: true,
      })
      .first()
  ).toBeVisible();

  await logout(page);
});

test.skip('can view assigned client with create_client', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  await createClient(page, 'test create client');

  await page.waitForTimeout(200);

  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Clients', exact: true })
    .click();

  await page.waitForURL('**/clients');

  await checkTableEditability(page, false);

  await page
    .getByRole('link', { name: 'test create client', exact: true })
    .first()
    .click();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Details' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Address' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Contacts' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('definition', { exact: true })
      .filter({ hasText: 'Standing' })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('link', {
        name: 'Edit Client',
        exact: true,
      })
      .first()
  ).toBeVisible();

  await expect(
    page
      .getByRole('button', {
        name: 'More Actions',
        exact: true,
      })
      .first()
  ).toBeVisible();

  await logout(page);
});

test.skip('deleting client', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/clients');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createClient(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Restore')).toBeVisible();

    await expect(page.getByText('Purge')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();
  }

  await expect(page.getByText('Successfully deleted client')).toBeVisible();
});

test.skip('archiving client', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  await page.waitForURL('**/clients');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createClient(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Restore')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();
  }

  await expect(page.getByText('Successfully archived client')).toBeVisible();
});

test.skip('client documents preview', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  await page.waitForURL('**/clients');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createClient(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }

  await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

  await page.waitForURL('**/clients/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await expect(
    page.getByRole('heading', { name: 'Additional Info' })
  ).toBeVisible();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test.skip('client documents uploading', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('clients@example.com');
  await set('create_client');
  await save();
  await logout(page);

  await login(page, 'clients@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Clients', exact: true }).click();

  await page.waitForURL('**/clients');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createClient(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();
  }
  await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

  await page.waitForURL('**/clients/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await page
    .locator('input[type="file"]')
    .setInputFiles('./tests/assets/images/test-image.png');

  await expect(page.getByText('Successfully uploaded document')).toBeVisible();

  await expect(
    page.getByText('test-image.png', { exact: true }).first()
  ).toBeVisible();
});
