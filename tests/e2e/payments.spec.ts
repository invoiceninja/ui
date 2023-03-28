import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';

const createPayment = async (page: Page) => {
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Payment' })
    .click();

  await page.waitForTimeout(200);

  await page.locator('#headlessui-combobox-input-\\:rg\\:').click();

  await page.getByRole('option').first().click();

  await page.getByRole('button', { name: 'Save' }).click();
};

test("can't view payments without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear();
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Payments'
  );
});

test('can view payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Payments', exact: true }).click();

  await page.waitForURL('**/payments');

  const tableBody = page.locator('tbody').first();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (doRecordsExist) {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page
      .getByRole('link')
      .filter({ has: page.getByText('Edit') })
      .click();

    await expect(
      page.getByRole('heading', {
        name: 'Edit Payment',
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
});

test("can't create a payment", async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('view_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Payments', exact: true }).click();
  await page.getByText('Enter Payment').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).toBeVisible();
});

test('can create a payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Payments', exact: true }).click();
  await page.getByText('Enter Payment').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

test('can view assigned payment with create_payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  await page.getByRole('link', { name: 'Payments' }).click();

  await createPayment(page);

  await expect(page.getByText('Successfully created payment')).toBeVisible();

  await expect(
    page.getByRole('heading', { name: 'Edit Payment' }).first()
  ).toBeVisible();
});

test('deleting payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Payments', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/payments');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPayment(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Restore', { exact: true })).toBeVisible();

    await expect(page.getByText('Delete', { exact: true })).not.toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();
  }

  await expect(page.getByText('Successfully deleted payment')).toBeVisible();
});

test('archiving payment', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Payments', exact: true }).click();

  await page.waitForURL('**/payments');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPayment(page);

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

  await expect(page.getByText('Successfully archived payment')).toBeVisible();
});

test('payment documents preview', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Payments', exact: true }).click();

  await page.waitForURL('**/payments');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPayment(page);

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

  await page.getByText('Edit').first().click();

  await page.waitForURL('**/payments/**/edit');

  await page
    .getByRole('link', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('payment documents uploading', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear();
  await set('create_payment');
  await save();
  await logout(page);

  await login(page, 'permissions@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Payments', exact: true }).click();

  await page.waitForURL('**/payments');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createPayment(page);

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

  await page.getByText('Edit').first().click();

  await page.waitForURL('**/payments/**/edit');

  await page
    .getByRole('link', {
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
