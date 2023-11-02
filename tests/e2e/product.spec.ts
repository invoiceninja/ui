import { login, logout, permissions } from '$tests/e2e/helpers';
import test, { expect, Page } from '@playwright/test';

const createProduct = async (page: Page) => {
  await page
    .getByRole('main')
    .getByRole('link', { name: 'New Product' })
    .click();

  await page.locator('[type="text"]').nth(0).fill('Product Name');
  await page.locator('[type="text"]').nth(1).fill('Product Notes');
  await page.locator('[type="text"]').nth(2).fill('120');
  await page.locator('[type="text"]').nth(3).fill('10');

  await page.getByRole('button', { name: 'Save' }).click();
};

test("can't view products without permission", async ({ page }) => {
  const { clear, save } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await expect(page.locator('.flex-grow > .flex-1').first()).not.toContainText(
    'Products'
  );
});

test('can view product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('view_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await page.waitForURL('**/products');

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
        name: 'Edit Product',
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

// test("can't create a product", async ({ page }) => {
//   const { clear, save, set } = permissions(page);

//   await login(page);
//   await clear('products@example.com');
//   await set('view_product');
//   await save();
//   await logout(page);

//   await login(page, 'products@example.com', 'password');

//   await page.getByRole('link', { name: 'Products', exact: true }).click();
//   await page.getByText('New Product').click();

//   await expect(
//     page.getByRole('heading', {
//       name: "Sorry, you don't have the needed permissions.",
//     })
//   ).toBeVisible();
// });

test('can create a product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await createProduct(page);

  await expect(
    page.getByRole('heading', { name: 'Edit Product' }).first()
  ).toBeVisible();
});

test('can view assigned product with create_product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  await page.getByRole('link', { name: 'Products' }).click();

  await createProduct(page);

  await expect(
    page.getByRole('heading', { name: 'Edit Product' }).first()
  ).toBeVisible();
});

test('deleting product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForURL('**/products');

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProduct(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted product')).toBeVisible();

    await expect(page.getByText('Restore')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Delete').click();

    await expect(page.getByText('Successfully deleted product')).toBeVisible();
  }
});

test('archiving product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await page.waitForURL('**/products');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProduct(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived product')).toBeVisible();

    await expect(page.getByText('Restore')).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Archive').click();

    await expect(page.getByText('Successfully archived product')).toBeVisible();
  }
});

test('cloning product', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await page.waitForURL('**/products');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProduct(page);

    const moreActionsButton = page
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Clone').click();

    await page.waitForURL('**/products/create?action=clone');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully created product')).toBeVisible();

    await page.waitForURL('**/products/**/edit');

    await expect(
      page.getByRole('heading', { name: 'Edit Product' }).first()
    ).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    await page.getByText('Clone').click();

    await page.waitForURL('**/products/create?action=clone');

    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Successfully created product')).toBeVisible();

    await page.waitForURL('**/products/**/edit');

    await expect(
      page.getByRole('heading', { name: 'Edit Product' }).first()
    ).toBeVisible();
  }
});

test('documents preview', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await page.waitForURL('**/products');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProduct(page);

    await page.waitForURL('**/products/**/edit');

    await page
      .getByRole('link', {
        name: 'Documents',
        exact: true,
      })
      .click();

    await page.waitForURL('**/products/**/documents');

    await expect(page.getByRole('heading', { name: 'Upload' })).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    // await page.getByText('Edit').click();
    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

    await page.waitForURL('**/products/**/edit');

    await page
      .getByRole('link', {
        name: 'Documents',
        exact: true,
      })
      .click();

    await page.waitForURL('**/products/**/documents');

    await expect(page.getByRole('heading', { name: 'Upload' })).toBeVisible();
  }
});

test('documents upload', async ({ page }) => {
  const { clear, save, set } = permissions(page);

  await login(page);
  await clear('products@example.com');
  await set('create_product');
  await save();
  await logout(page);

  await login(page, 'products@example.com', 'password');

  const tableBody = page.locator('tbody').first();

  await page.getByRole('link', { name: 'Products', exact: true }).click();

  await page.waitForURL('**/products');

  const tableRow = tableBody.getByRole('row').first();

  await page.waitForTimeout(200);

  const doRecordsExist = await page.getByText('No records found').isHidden();

  if (!doRecordsExist) {
    await createProduct(page);

    await page.waitForURL('**/products/**/edit');

    await page
      .getByRole('link', {
        name: 'Documents',
        exact: true,
      })
      .click();

    await page.waitForURL('**/products/**/documents');

    await page
      .locator('input[type="file"]')
      .setInputFiles('./tests/assets/images/test-image.png');

    await expect(
      page.getByText('Successfully uploaded document')
    ).toBeVisible();

    await expect(
      tableBody.getByText('test-image.png', { exact: true }).first()
    ).toBeVisible();
  } else {
    const moreActionsButton = tableRow
      .getByRole('button')
      .filter({ has: page.getByText('More Actions') });

    await moreActionsButton.click();

    // await page.getByText('Edit').click();
    await page.getByRole('link', { name: 'Edit', exact: true }).first().click();

    await page.waitForURL('**/products/**/edit');

    await page
      .getByRole('link', {
        name: 'Documents',
        exact: true,
      })
      .click();

    await page.waitForURL('**/products/**/documents');

    await page
      .locator('input[type="file"]')
      .setInputFiles('./tests/assets/images/test-image.png');

    await expect(
      page.getByText('Successfully uploaded document')
    ).toBeVisible();

    await expect(
      tableBody.getByText('test-image.png', { exact: true }).first()
    ).toBeVisible();
  }
});
