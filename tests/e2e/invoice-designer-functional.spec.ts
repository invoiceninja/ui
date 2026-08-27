import { login } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  uniqueName,
} from '$tests/e2e/fixtures';
import {
  BUILDER_TEMPLATES,
  createLegacyInvoiceDesign,
  deleteCanvasBlock,
  designNameInput,
  dragBlockToCanvas,
  duplicateCanvasBlock,
  documentSettingsCheckbox,
  expectCustomCssInPage,
  expectCanvasPageWidth,
  expectDistinctHorizontalPositions,
  fetchDesignViaApi,
  openBuilderWithTemplate,
  openCustomCssPanel,
  openDocumentSettingsPanel,
  openTemplateGallery,
  openVisualDesignFromList,
  readCanvasPageWidth,
  readGridWidgetPositions,
  readSavedBlockGridPosition,
  reloadBuilderPage,
  saveExistingVisualDesign,
  saveNewVisualDesign,
  selectCanvasBlock,
  setCustomCss,
  setDocumentSelectOption,
  setGridWidgetHeight,
  submitNewVisualDesignName,
  designNameModalError,
  trackDesignFromBuilderUrl,
  waitForBuilderLayoutSettled,
  waitForGridWidgetHeight,
} from '$tests/e2e/invoice-design-helpers';

resetAccountBeforeAll();

test.describe('Invoice designer templates', () => {
  for (const templateId of BUILDER_TEMPLATES) {
    test(`visual builder loads ${templateId} template without page errors`, async ({
      page,
    }) => {
      test.setTimeout(90_000);

      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await openBuilderWithTemplate(page, templateId);

      expect(pageErrors).toEqual([]);

      if (templateId === 'blank') {
        await expect(page.locator('.grid-stack-item')).toHaveCount(0);
        await expect(page.locator('.invoice-gridstack-empty-state')).toBeVisible();
      } else {
        const positions = await readGridWidgetPositions(page);
        expect(positions.length).toBeGreaterThan(0);
      }
    });
  }

  test('template gallery navigates to builder with selected template', async ({
    page,
  }) => {
    test.setTimeout(90_000);

    await openTemplateGallery(page);

    await page.getByText('Modern Professional', { exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await page.waitForURL('**/builder/new?template=modern-professional**', {
      timeout: 15000,
    });
    await expect(page.locator('.invoice-gridstack-page')).toBeVisible({
      timeout: 20000,
    });

    const positions = await readGridWidgetPositions(page);
    expectDistinctHorizontalPositions(positions);
  });
});

test.describe('Invoice designer block editing', () => {
  test('dragging a text block onto blank canvas adds a widget', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await openBuilderWithTemplate(page, 'blank');
    await dragBlockToCanvas(page, 'Text');

    const positions = await readGridWidgetPositions(page);
    expect(positions).toHaveLength(1);
    expect(positions[0].w).toBeGreaterThan(0);
  });

  test('deleting a block persists after save and reload', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('delete-block');
    await openBuilderWithTemplate(page, 'modern-professional');

    const beforeDelete = await readGridWidgetPositions(page);
    const blockToDelete = beforeDelete.find((position) => position.id === 'footer-text');
    expect(blockToDelete).toBeTruthy();

    await deleteCanvasBlock(page, blockToDelete!.id);

    const afterDelete = await readGridWidgetPositions(page);
    expect(afterDelete).toHaveLength(beforeDelete.length - 1);

    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    await reloadBuilderPage(page);

    const reloaded = await readGridWidgetPositions(page);
    expect(reloaded).toHaveLength(afterDelete.length);
    expect(reloaded.some((position) => position.id === blockToDelete!.id)).toBe(
      false
    );
  });

  test('duplicating a block increases widget count and persists', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('duplicate-block');
    await openBuilderWithTemplate(page, 'modern-professional');

    const initial = await readGridWidgetPositions(page);
    await duplicateCanvasBlock(page, 'invoice-title');

    const duplicated = await readGridWidgetPositions(page);
    expect(duplicated.length).toBe(initial.length + 1);

    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    await reloadBuilderPage(page);

    const reloaded = await readGridWidgetPositions(page);
    expect(reloaded.length).toBe(duplicated.length);
  });

  test('text block content edits persist after save and reload', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('text-content');
    const customContent = `E2E Title ${Date.now()}`;

    await openBuilderWithTemplate(page, 'modern-professional');
    await selectCanvasBlock(page, 'invoice-title');

    const contentField = page.locator('textarea').first();
    await contentField.click();
    await contentField.fill(customContent);
    await contentField.blur();
    await page.waitForTimeout(400);

    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    expect(designId).toBeTruthy();
    const saved = await fetchDesignViaApi(api, designId!);
    const titleBlock = (saved?.design.blocks ?? []).find(
      (block: { id?: string }) => block.id === 'invoice-title'
    ) as { properties?: { content?: string } } | undefined;
    expect(titleBlock?.properties?.content).toBe(customContent);

    await reloadBuilderPage(page);
    await selectCanvasBlock(page, 'invoice-title');
    await expect(page.locator('textarea').first()).toHaveValue(customContent);
  });
});

test.describe('Invoice designer document settings', () => {
  test('landscape layout persists after save and reload', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('landscape-layout');
    await openBuilderWithTemplate(page, 'modern-professional');

    const portraitWidth = await readCanvasPageWidth(page);

    await openDocumentSettingsPanel(page);
    await setDocumentSelectOption(page, 'Page Layout', 'Landscape');

    const landscapeWidth = await readCanvasPageWidth(page);
    expect(landscapeWidth).not.toBe(portraitWidth);
    expect(landscapeWidth).toBe('297mm');

    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    expect(designId).toBeTruthy();
    const saved = await fetchDesignViaApi(api, designId!);
    expect(saved?.design.documentSettings?.pageLayout).toBe('landscape');

    await reloadBuilderPage(page);
    await expectCanvasPageWidth(page, '297mm');
  });

  test('page size change updates canvas width and persists', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('page-size');
    await openBuilderWithTemplate(page, 'modern-professional');

    await openDocumentSettingsPanel(page);
    await setDocumentSelectOption(page, 'Page Size', 'Letter');

    await expectCanvasPageWidth(page, '215.9mm');

    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    expect(designId).toBeTruthy();
    const saved = await fetchDesignViaApi(api, designId!);
    expect(saved?.design.documentSettings?.pageSize).toBe('letter');

    await reloadBuilderPage(page);
    await expectCanvasPageWidth(page, '215.9mm');
  });

  test('document option toggles persist after save and reload', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('doc-options');
    await openBuilderWithTemplate(page, 'modern-professional');

    await openDocumentSettingsPanel(page);
    await documentSettingsCheckbox(page, 'Show Paid Stamp').check();
    await documentSettingsCheckbox(page, 'Page Numbering').check();

    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    expect(designId).toBeTruthy();
    const saved = await fetchDesignViaApi(api, designId!);
    expect(saved?.design.documentSettings?.showPaidStamp).toBe(true);
    expect(saved?.design.documentSettings?.pageNumbering).toBe(true);

    await reloadBuilderPage(page);
    await openDocumentSettingsPanel(page);
    await expect(documentSettingsCheckbox(page, 'Show Paid Stamp')).toBeChecked();
    await expect(documentSettingsCheckbox(page, 'Page Numbering')).toBeChecked();
  });
});

test.describe('Invoice designer custom CSS', () => {
  test('custom CSS persists after save and reload', async ({ page, api }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('custom-css');
    const cssRule = '.invoice-widget-text { letter-spacing: 2px; }';

    await openBuilderWithTemplate(page, 'modern-professional');
    await setCustomCss(page, cssRule);

    await expectCustomCssInPage(page, 'letter-spacing: 2px');

    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    expect(designId).toBeTruthy();
    const saved = await fetchDesignViaApi(api, designId!);
    expect(saved?.design.customCss).toContain('letter-spacing: 2px');

    await reloadBuilderPage(page);
    await openCustomCssPanel(page);
    await expect(page.locator('.monaco-editor')).toContainText(
      'letter-spacing: 2px'
    );
    await expectCustomCssInPage(page, 'letter-spacing: 2px');
  });
});

test.describe('Invoice designer save and rehydrate', () => {
  test('edit mode saves updates without name modal', async ({ page, api }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('edit-save');
    const renamed = `${designName}-updated`;

    await openBuilderWithTemplate(page, 'minimalist');
    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    await designNameInput(page).click();
    await designNameInput(page).fill(renamed);
    await designNameInput(page).blur();

    await saveExistingVisualDesign(page);
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(designNameInput(page)).toHaveValue(renamed);

    await reloadBuilderPage(page);
    await expect(designNameInput(page)).toHaveValue(renamed);
  });

  test('custom designs list shows Visual badge and opens builder on edit', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('visual-list');
    await openBuilderWithTemplate(page, 'modern-professional');
    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    await page.goto('/settings/invoice_design/custom_designs');
    const row = page.locator('tbody tr').filter({ hasText: designName }).first();
    await expect(row.getByText('Visual', { exact: true })).toBeVisible();

    await openVisualDesignFromList(page, designName);
    await page.waitForURL(`**/settings/invoice_design/builder/**`, {
      timeout: 15000,
    });
    await expect(page.locator('.invoice-gridstack-page')).toBeVisible({
      timeout: 20000,
    });
    await expect(designNameInput(page)).toHaveValue(designName);
  });

  test('minimalist template block layout rehydrates accurately', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('minimalist-layout');
    await openBuilderWithTemplate(page, 'minimalist');

    const positionsBeforeSave = await readGridWidgetPositions(page);
    expect(positionsBeforeSave.some((position) => position.id === 'company-name')).toBe(
      true
    );

    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    await reloadBuilderPage(page);

    const positionsAfterReload = await readGridWidgetPositions(page);
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
});

test.describe('Invoice designer grid height persistence', () => {
  test('saved design grid positions survive reload without auto-expansion', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('grid-reopen');
    await openBuilderWithTemplate(page, 'modern-professional');

    const positionsBeforeSave = await readGridWidgetPositions(page);
    expect(positionsBeforeSave.length).toBeGreaterThan(0);

    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    await reloadBuilderPage(page);
    await waitForBuilderLayoutSettled(page);

    const positionsAfterReload = await readGridWidgetPositions(page);
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

    await page.waitForTimeout(1500);
    const positionsAfterSettle = await readGridWidgetPositions(page);
    expect(positionsAfterSettle).toEqual(positionsAfterReload);
  });

  test('resized company-info and table heights persist through save and reload', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('widget-heights');

    await openBuilderWithTemplate(page, 'modern-professional');
    await waitForBuilderLayoutSettled(page);

    const initial = await readGridWidgetPositions(page);
    const companyInitial = initial.find((position) => position.id === 'company-info');
    const tableInitial = initial.find((position) => position.id === 'line-items');

    expect(companyInitial).toBeTruthy();
    expect(tableInitial).toBeTruthy();

    await setGridWidgetHeight(
      page,
      'company-info',
      Math.max(1, companyInitial!.h - 2)
    );
    await setGridWidgetHeight(
      page,
      'line-items',
      Math.max(1, tableInitial!.h - 3)
    );
    await page.waitForTimeout(500);

    const beforeSave = await readGridWidgetPositions(page);
    const companyBefore = beforeSave.find(
      (position) => position.id === 'company-info'
    );
    const tableBefore = beforeSave.find((position) => position.id === 'line-items');

    expect(companyBefore).toBeTruthy();
    expect(tableBefore).toBeTruthy();

    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    const saved = await fetchDesignViaApi(api, designId!);
    expect(readSavedBlockGridPosition(saved, 'company-info')?.h).toBe(
      companyBefore!.h
    );
    expect(readSavedBlockGridPosition(saved, 'line-items')?.h).toBe(
      tableBefore!.h
    );

    await reloadBuilderPage(page);
    await waitForBuilderLayoutSettled(page);

    const reloaded = await readGridWidgetPositions(page);
    expect(reloaded.find((position) => position.id === 'company-info')?.h).toBe(
      companyBefore!.h
    );
    expect(reloaded.find((position) => position.id === 'line-items')?.h).toBe(
      tableBefore!.h
    );

    await page.waitForTimeout(1500);
    await waitForGridWidgetHeight(page, 'company-info', companyBefore!.h);
    await waitForGridWidgetHeight(page, 'line-items', tableBefore!.h);
  });
});

test.describe('Invoice designer save validation', () => {
  test('duplicate design name shows validation error in save modal', async ({
    page,
    api,
  }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('duplicate-design-name');

    await openBuilderWithTemplate(page, 'minimalist');
    const designId = await saveNewVisualDesign(page, designName);
    trackDesignFromBuilderUrl(api, page, designId);

    await page.goto(
      '/settings/invoice_design/builder/new?template=minimalist&redirect=false'
    );
    await expect(page.locator('.grid-stack-item').first()).toBeVisible({
      timeout: 30000,
    });

    const saveResponse = await submitNewVisualDesignName(page, designName);

    expect(saveResponse.status()).toBe(422);

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(designNameModalError(page)).toBeVisible();
    await expect(designNameModalError(page)).not.toBeEmpty();
    await expect(page).toHaveURL(/\/builder\/new\?template=minimalist/);
  });
});

test.describe('Invoice designer legacy custom designs', () => {
  test('legacy design create flow opens edit tabs', async ({ page, api }) => {
    test.setTimeout(120_000);

    const designName = uniqueName('legacy-design');
    await login(page);
    await createLegacyInvoiceDesign(page, designName);

    const designId = page.url().match(/custom_designs\/([^/]+)/)?.[1];
    if (designId) {
      api.trackEntity('designs', designId);
    }

    await expect(page.getByRole('main').getByRole('textbox').first()).toHaveValue(
      designName
    );

    await page.getByRole('link', { name: 'Body', exact: true }).click();
    await page.waitForURL('**/custom_designs/**/edit/body');
    await expect(page.getByRole('main')).toBeVisible();

    await page.getByRole('link', { name: 'Header', exact: true }).click();
    await page.waitForURL('**/custom_designs/**/edit/header');

    await page.getByRole('link', { name: 'Footer', exact: true }).click();
    await page.waitForURL('**/custom_designs/**/edit/footer');

    await page.getByRole('link', { name: 'Includes', exact: true }).click();
    await page.waitForURL('**/custom_designs/**/edit/includes');

    await page.getByRole('link', { name: 'Variables', exact: true }).click();
    await page.waitForURL('**/custom_designs/**/edit/variables');
  });
});

test.describe('Invoice designer general settings', () => {
  test('general settings page exposes layout controls and live preview', async ({
    page,
    settingsGuard,
  }) => {
    test.setTimeout(90_000);

    settingsGuard.snapshot();
    await login(page);
    await page.goto('/settings/invoice_design?redirect=false');

    await expect(page.getByText('Page Layout', { exact: true }).first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText('Page Size', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Font Size', { exact: true }).first()).toBeVisible();

    const primaryNavigation = page.locator(
      '[data-cy="invoice-design-primary-navigation"]'
    );
    const settingsNavigation = page.locator(
      '[data-cy="invoice-design-settings-navigation"]'
    );

    await expect(
      primaryNavigation.getByRole('link', {
        name: 'General Settings',
        exact: true,
      })
    ).toBeVisible();
    await expect(
      primaryNavigation.getByRole('link', { name: 'Designs', exact: true })
    ).toBeVisible();
    await expect(
      settingsNavigation.getByRole('link', { name: 'Defaults', exact: true })
    ).toBeVisible();
    await expect(
      settingsNavigation.getByRole('link', { name: 'Client', exact: true })
    ).toBeVisible();
    await expect(
      primaryNavigation.getByRole('link', { name: 'Designer', exact: true })
    ).toHaveCount(0);

    await primaryNavigation
      .getByRole('link', { name: 'Designs', exact: true })
      .click();

    await expect(settingsNavigation).toHaveCount(0);
    const newDesignButton = page.getByRole('link', {
      name: 'New Design',
      exact: true,
    });

    await expect(newDesignButton).toBeVisible();
    await expect(page.getByRole('button', { name: 'Templates' })).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Legacy Design' })
    ).toHaveCount(0);

    await newDesignButton.click();
    await page.waitForURL('**/settings/invoice_design/custom_designs/new');

    const legacyOption = page.getByRole('radio', { name: /Legacy/ });
    const twigOption = page.getByRole('radio', { name: /Twig Template/ });
    const guiOption = page.getByRole('radio', { name: /GUI Designer/ });

    await expect(legacyOption).toBeVisible();
    await expect(twigOption).toBeVisible();
    await expect(guiOption).toBeVisible();
    await expect(guiOption).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByText('Recommended', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForURL('**/settings/invoice_design/builder/templates');
  });

  test('Twig selection forces template mode without showing the type control', async ({
    page,
  }) => {
    test.setTimeout(90_000);

    await login(page);
    await page.goto(
      '/settings/invoice_design/custom_designs/new?redirect=false'
    );

    await page.getByRole('radio', { name: /Twig Template/ }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.waitForURL(
      /\/settings\/invoice_design\/custom_designs\/create\?type=template$/
    );

    await expect(
      page.getByRole('heading', { name: 'New Twig Template', exact: true })
    ).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByRole('main').getByText('Type', { exact: true })
    ).toHaveCount(0);
    await expect(
      page.getByRole('main').getByText('Resource', { exact: true })
    ).toBeVisible();
    await expect(page.locator('.monaco-editor')).toBeVisible({
      timeout: 30000,
    });
    await expect(page.getByRole('main').locator('iframe')).toBeVisible({
      timeout: 30000,
    });
  });
});
