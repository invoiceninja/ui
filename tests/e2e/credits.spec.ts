import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';

const createCredit = async (page: Page) => {
  await page
    .getByRole('main')
    .getByRole('link', { name: 'Enter Credit' })
    .click();

  await page.waitForTimeout(1200);

  await page.getByRole('option').first().click();

  await page.getByRole('button', { name: 'Save' }).click();
};

test("can't view credits without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Credits'
  );
});

test('can view credit', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('view_credit', 'view_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  await page.getByRole('link', { name: 'Credits', exact: true }).click();

  await page.waitForURL('**/credits');

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

    await page.getByRole('link', { name: 'Edit', exact: true }).click();

    await expect(
      page.getByRole('heading', {
        name: 'Edit Credit',
        exact: true,
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

test('can create a credit', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  await page.getByRole('link', { name: 'Credits', exact: true }).click();
  await page.getByText('Enter Credit').click();

  await expect(
    page.getByRole('heading', {
      name: "Sorry, you don't have the needed permissions.",
    })
  ).not.toBeVisible();
});

// test('can view assigned credit with create_credit', async ({ page }) => {
//   const { clear, save, set } = permissions(page);

//   await login(page);
//   await clear('credits@example.com');
//   await set('create_credit', 'view_client');
//   await save();
//   await logout(page);

//   await login(page, 'credits@example.com', 'password');

//   await page.getByRole('link', { name: 'Credits' }).click();

//   await createCredit(page);

//   await expect(
//     page.getByRole('heading', { name: 'Edit Credit' })
//   ).toBeVisible();
// });

test('deleting credit', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'view_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Credits', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/credits');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createCredit(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Delete').click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();
  }

  await expect(page.getByText('Successfully deleted credit')).toBeVisible();
});

test('archiving credit', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'view_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Credits', exact: true }).click();

  await page.waitForURL('**/credits');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createCredit(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') })
      .first();

    await moreActionsButton.click();

    await page.getByText('Archive').click();
  }

  await expect(page.getByText('Successfully archived credit')).toBeVisible();
});

test('cloning credit', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'view_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Credits', exact: true }).click();

  await page.waitForURL('**/credits');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createCredit(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();
  }

  await page.getByText('Clone').first().click();

  await page.waitForURL('**/credits/create?action=clone');

  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByText('Successfully created credit')).toBeVisible();

  await page.waitForURL('**/credits/**/edit');

  await expect(
    page.getByRole('heading', { name: 'Edit Credit' }).first()
  ).toBeVisible();
});

test('credit documents preview', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'view_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Credits', exact: true }).click();

  await page.waitForURL('**/credits');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createCredit(page);

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

  await page.getByRole('link', { name: 'Edit', exact: true }).click();

  await page.waitForURL('**/credits/**/edit');

  await page
    .getByRole('button', {
      name: 'Documents',
      exact: true,
    })
    .click();

  await expect(page.getByText('Drop files or click to upload')).toBeVisible();
});

test('credit documents uploading', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('credits@example.com');
  await set('create_credit', 'view_client');
  await save();
  await logout(page);

  await login(page, 'credits@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Credits', exact: true }).click();

  await page.waitForURL('**/credits');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createCredit(page);

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

  await page.getByRole('link', { name: 'Edit', exact: true }).click();

  await page.waitForURL('**/credits/**/edit');

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
