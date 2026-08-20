import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
} from '$tests/e2e/fixtures';
import {
  designNameInput,
  expectDistinctHorizontalPositions,
  openBuilderWithTemplate,
  readGridWidgetPositions,
  reloadBuilderPage,
  saveNewVisualDesign,
  trackDesignFromBuilderUrl,
} from '$tests/e2e/invoice-design-helpers';

resetAccountBeforeAll();

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

  const designId = await saveNewVisualDesign(page, designName);
  trackDesignFromBuilderUrl(api, page, designId);

  await reloadBuilderPage(page);

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

  const designId = await saveNewVisualDesign(page, designName);
  trackDesignFromBuilderUrl(api, page, designId);

  await expect(designNameInput(page)).toHaveValue(designName, {
    timeout: 10000,
  });

  await reloadBuilderPage(page);
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

  const designId = await saveNewVisualDesign(page, designName);
  trackDesignFromBuilderUrl(api, page, designId);

  await page.getByRole('button', { name: 'Preview', exact: true }).click();

  await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('iframe[title="Preview"]')).toBeVisible({
    timeout: 10000,
  });
});
