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

type GridWidgetPosition = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

const waitForGridWidgetPositions = async (page: Page) => {
  await page.waitForFunction(() => {
    const items = document.querySelectorAll(
      '.invoice-gridstack-page .grid-stack-item'
    );

    return (
      items.length > 0 &&
      Array.from(items).every((item) => {
        const node = (
          item as HTMLElement & {
            gridstackNode?: { x?: number; y?: number };
          }
        ).gridstackNode;

        return node?.x !== undefined && node?.y !== undefined;
      })
    );
  });
};

const readGridWidgetPositions = async (
  page: Page
): Promise<GridWidgetPosition[]> => {
  await waitForGridWidgetPositions(page);

  return page.locator('.invoice-gridstack-page .grid-stack-item').evaluateAll(
    (items) =>
      items.map((item) => {
        const node = (
          item as HTMLElement & {
            gridstackNode?: {
              x?: number;
              y?: number;
              w?: number;
              h?: number;
            };
          }
        ).gridstackNode;
        const id =
          item.getAttribute('data-block-id') ||
          item.getAttribute('gs-id') ||
          '';

        return {
          id,
          x: node?.x ?? Number(item.getAttribute('gs-x') ?? 0),
          y: node?.y ?? Number(item.getAttribute('gs-y') ?? 0),
          w: node?.w ?? Number(item.getAttribute('gs-w') ?? 1),
          h: node?.h ?? Number(item.getAttribute('gs-h') ?? 1),
        };
      })
  );
};

const expectDistinctHorizontalPositions = (positions: GridWidgetPosition[]) => {
  const xs = [...new Set(positions.map((position) => position.x))];

  expect(xs.length).toBeGreaterThan(1);
  expect(positions.some((position) => position.x > 0)).toBe(true);
};

test('visual builder loads a template without page errors', async ({ page }) => {
  test.setTimeout(90_000);

  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await openBuilderWithTemplate(page, 'modern-professional');
  const positions = await readGridWidgetPositions(page);

  expect(pageErrors).toEqual([]);
  expectDistinctHorizontalPositions(positions);
  expect(positions.find((position) => position.id === 'company-info')?.x).toBe(
    8
  );
});

test('visual builder restores saved widget positions after reload', async ({
  page,
  api,
}) => {
  test.setTimeout(120_000);

  const designName = uniqueName('visual-positions');
  await openBuilderWithTemplate(page, 'modern-professional');

  const positionsBeforeSave = await readGridWidgetPositions(page);
  expectDistinctHorizontalPositions(positionsBeforeSave);

  await saveNewVisualDesign(page, designName);

  const designId = extractIdFromUrl(page.url(), 'builder');
  if (designId) {
    api.trackEntity('designs', designId);
  }

  await reloadBuilderPage(page);
  await expect(page.locator('.invoice-gridstack-page')).toBeVisible({
    timeout: 30000,
  });

  const positionsAfterReload = await readGridWidgetPositions(page);

  expect(positionsAfterReload).toHaveLength(positionsBeforeSave.length);
  expect(positionsAfterReload).toEqual(
    expect.arrayContaining(
      positionsBeforeSave.map((position) =>
        expect.objectContaining({
          id: position.id,
          x: position.x,
          y: position.y,
          w: position.w,
          h: position.h,
        })
      )
    )
  );
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
