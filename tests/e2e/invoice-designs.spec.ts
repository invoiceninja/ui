import { login } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  extractIdFromUrl,
} from '$tests/e2e/fixtures';
import { createLegacyInvoiceDesign } from '$tests/e2e/invoice-design-helpers';

resetAccountBeforeAll();

test('deleting invoice design with admin owner account', async ({ page, api }) => {
  await login(page);

  const designName = uniqueName('del-design');

  await createLegacyInvoiceDesign(page, designName);

  const designId = extractIdFromUrl(page.url(), 'custom_designs');
  if (designId) api.trackEntity('designs', designId);

  await page.locator('[data-cy="chevronDownButton"]').first().click();
  await page.getByText('Delete').click();
  await expect(
    page.getByRole('button', { name: 'Restore', exact: true })
  ).toBeVisible({ timeout: 10000 });
  await expect(
    page.getByRole('button', { name: 'Archive', exact: true })
  ).not.toBeVisible({ timeout: 10000 });
});

test('archiving invoice design with admin owner account', async ({ page, api }) => {
  await login(page);

  const designName = uniqueName('arch-design');

  await createLegacyInvoiceDesign(page, designName);

  const designId = extractIdFromUrl(page.url(), 'custom_designs');
  if (designId) api.trackEntity('designs', designId);

  await page.locator('[data-cy="chevronDownButton"]').first().click();

  await page.getByText('Archive').click();

  await expect(
    page.getByRole('button', { name: 'Restore', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('button', { name: 'Delete', exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByRole('button', { name: 'Archive', exact: true })
  ).not.toBeVisible({ timeout: 10000 });
});
