import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
  extractIdFromUrl,
} from '$tests/e2e/fixtures';
import { login } from '$tests/e2e/helpers';
import { Page } from '@playwright/test';

resetAccountBeforeAll();

const openBuilderWithTemplate = async (page: Page, templateId: string) => {
  await login(page);
  // Tabs backup navigation redirects unknown paths (e.g. /builder/new) to
  // General Settings unless redirect=false is set.
  await page.goto(
    `/settings/invoice_design/builder/new?template=${encodeURIComponent(templateId)}&redirect=false`
  );
  await page.waitForURL(`**template=${encodeURIComponent(templateId)}**`, {
    timeout: 15000,
  });
  await expect(page.locator('.invoice-gridstack-page')).toBeVisible({
    timeout: 20000,
  });
  await expect(page.locator('.grid-stack-item').first()).toBeVisible({
    timeout: 30000,
  });
};

const saveNewVisualDesign = async (page: Page, designName: string) => {
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  const nameInput = page.locator('#design-name');
  await expect(nameInput).toBeVisible({ timeout: 10000 });
  await nameInput.fill(designName);

  await page
    .locator('[role="dialog"]')
    .getByRole('button', { name: /^save$/i })
    .click();

  await page.waitForURL(
    /\/settings\/invoice_design\/builder\/(?!new(?:\/|\?|$))[^/?]+/,
    { timeout: 30000 }
  );
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });
};

const designNameInput = (page: Page) =>
  page.locator('input[placeholder="design_name"]').first();

const reloadBuilderPage = async (page: Page) => {
  const url = new URL(page.url());
  url.searchParams.set('redirect', 'false');
  await page.goto(url.pathname + url.search);
};

test('visual builder loads a template without page errors', async ({ page }) => {
  test.setTimeout(90_000);

  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await openBuilderWithTemplate(page, 'modern-professional');

  expect(pageErrors).toEqual([]);
});

test('visual builder saves and reloads a template design', async ({
  page,
  api,
}) => {
  test.setTimeout(120_000);

  const designName = uniqueName('visual-design');
  await openBuilderWithTemplate(page, 'modern-professional');

  const initialBlockCount = await page.locator('.grid-stack-item').count();
  expect(initialBlockCount).toBeGreaterThan(0);

  await saveNewVisualDesign(page, designName);

  const designId = extractIdFromUrl(page.url(), 'builder');
  if (designId) {
    api.trackEntity('designs', designId);
  }

  await expect(designNameInput(page)).toHaveValue(designName, {
    timeout: 10000,
  });

  await reloadBuilderPage(page);
  await expect(page.locator('.invoice-gridstack-page')).toBeVisible({
    timeout: 30000,
  });
  await page.waitForFunction(
    (expected) =>
      document.querySelectorAll('.invoice-gridstack-page .grid-stack-item')
        .length === expected,
    initialBlockCount,
    { timeout: 30000 }
  );
});

test('visual builder preview modal opens for a saved design', async ({
  page,
  api,
}) => {
  test.setTimeout(120_000);

  const designName = uniqueName('visual-preview');
  await openBuilderWithTemplate(page, 'modern-professional');

  await saveNewVisualDesign(page, designName);

  const designId = extractIdFromUrl(page.url(), 'builder');
  if (designId) {
    api.trackEntity('designs', designId);
  }

  await page.getByRole('button', { name: 'Preview', exact: true }).click();

  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('iframe[title="Preview"]')).toBeVisible({
    timeout: 10000,
  });
});
