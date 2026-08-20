import { request as playwrightRequest, Page, expect } from '@playwright/test';
import { login } from '$tests/e2e/helpers';
import type { ApiContext } from '$tests/e2e/api-helpers';

/** Minimal API fixture surface used by invoice design helpers. */
export type InvoiceDesignApi = ApiContext | { context: ApiContext };

function extractIdFromUrl(url: string, entityPath: string): string | null {
  const pathname = url.split('?')[0].split('#')[0];
  const regex = new RegExp(`${entityPath}/([^/]+?)(?:/edit)?/?$`);
  const match = pathname.match(regex);
  return match ? match[1] : null;
}

function resolveApiContext(api: InvoiceDesignApi): ApiContext {
  return 'context' in api ? api.context : api;
}

export type GridWidgetPosition = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DesignApiRecord = {
  id: string;
  name: string;
  design: {
    blocks?: unknown[];
    documentSettings?: Record<string, unknown>;
    customCss?: string;
  };
};

export const BUILDER_TEMPLATES = [
  'modern-professional',
  'minimalist',
  'blank',
] as const;

export type BuilderTemplateId = (typeof BUILDER_TEMPLATES)[number];

export async function navigateToInvoiceDesign(page: Page) {
  await page
    .locator('[data-cy="navigationBar"]')
    .getByRole('link', { name: 'Settings', exact: true })
    .click();
  await page.getByRole('link', { name: 'Invoice Design', exact: true }).click();
}

export async function navigateToCustomDesigns(page: Page) {
  await navigateToInvoiceDesign(page);
  await page.getByRole('link', { name: 'Custom Designs', exact: true }).click();
  await expect(page.getByRole('main')).toBeVisible({ timeout: 10000 });
}

export async function openBuilderWithTemplate(
  page: Page,
  templateId: BuilderTemplateId | string
) {
  await login(page);
  await page.goto(
    `/settings/invoice_design/builder/new?template=${encodeURIComponent(templateId)}&redirect=false`
  );
  await page.waitForURL(`**template=${encodeURIComponent(templateId)}**`, {
    timeout: 15000,
  });
  await expect(page.locator('.invoice-gridstack-page')).toBeVisible({
    timeout: 20000,
  });

  if (templateId === 'blank') {
    await expect(page.locator('.invoice-gridstack-empty-state')).toBeVisible({
      timeout: 10000,
    });
    return;
  }

  await expect(page.locator('.grid-stack-item').first()).toBeVisible({
    timeout: 30000,
  });
}

export async function openTemplateGallery(page: Page) {
  await login(page);
  await page.goto(
    '/settings/invoice_design/builder/templates?redirect=false'
  );
  await expect(
    page.getByRole('heading', { name: 'Select', exact: true })
  ).toBeVisible({ timeout: 15000 });
}

export async function saveNewVisualDesign(
  page: Page,
  designName: string
): Promise<string | null> {
  const saveResponse = await submitNewVisualDesignName(page, designName);

  expect(saveResponse.ok()).toBeTruthy();

  const saveBody = await saveResponse.json();
  const savedDesignId =
    saveBody.data?.data?.id ?? saveBody.data?.id ?? null;

  await page.waitForURL(
    /\/settings\/invoice_design\/builder\/(?!new(?:\/|\?|$))[^/?]+/,
    { timeout: 30000 }
  );
  await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 });

  return savedDesignId ?? extractIdFromUrl(page.url(), 'builder');
}

export async function submitNewVisualDesignName(
  page: Page,
  designName: string
) {
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  const dialog = page.getByRole('dialog');
  const nameInput = dialog.locator('#design-name');
  await expect(nameInput).toBeVisible({ timeout: 10000 });
  await nameInput.fill(designName);

  const saveResponsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/designs') &&
      response.request().method() === 'POST',
    { timeout: 30000 }
  );

  await dialog.getByRole('button', { name: /^save$/i }).click();

  return saveResponsePromise;
}

export function designNameModalError(page: Page) {
  return page.locator('[role="dialog"] .error-message-box');
}

export async function saveExistingVisualDesign(page: Page) {
  const saveResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/designs/') &&
      response.request().method() === 'PUT' &&
      response.ok(),
    { timeout: 30000 }
  );

  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await saveResponse;
}

export function designNameInput(page: Page) {
  return page.locator('input[placeholder="design_name"]').first();
}

export async function reloadBuilderPage(page: Page) {
  const url = new URL(page.url());
  url.searchParams.set('redirect', 'false');
  await page.goto(url.pathname + url.search);
  await expect(page.locator('.invoice-gridstack-page')).toBeVisible({
    timeout: 30000,
  });
}

export async function waitForGridWidgetPositions(page: Page) {
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
}

export async function waitForBuilderLayoutSettled(page: Page) {
  await waitForGridWidgetPositions(page);
  await page.waitForTimeout(800);
}

export async function setGridWidgetHeight(
  page: Page,
  blockId: string,
  height: number
) {
  await waitForGridWidgetPositions(page);

  await page.evaluate(
    ({ blockId, height }) => {
      const gridElement = document.querySelector(
        '.invoice-gridstack-grid.grid-stack'
      ) as
        | (HTMLElement & {
            gridstack?: {
              update: (el: Element, opts: { h: number; minH?: number }) => void;
            };
          })
        | null;
      const item = document.querySelector(
        `[data-block-id="${blockId}"]`
      ) as HTMLElement | null;

      if (!gridElement?.gridstack || !item) {
        throw new Error(`Grid widget not found: ${blockId}`);
      }

      gridElement.gridstack.update(item, { h: height, minH: 1 });
    },
    { blockId, height }
  );

  await page.waitForTimeout(400);
}

export async function waitForGridWidgetHeight(
  page: Page,
  blockId: string,
  height: number,
  timeout = 15000
) {
  await expect
    .poll(async () => {
      const positions = await readGridWidgetPositions(page);
      return positions.find((position) => position.id === blockId)?.h;
    }, { timeout })
    .toBe(height);
}

export function readSavedBlockGridPosition(
  saved: DesignApiRecord | null,
  blockId: string
) {
  const block = (saved?.design.blocks ?? []).find(
    (entry: { id?: string }) => entry.id === blockId
  ) as
    | {
        gridPosition?: { x: number; y: number; w: number; h: number };
      }
    | undefined;

  return block?.gridPosition ?? null;
}

export async function readGridWidgetPositions(
  page: Page
): Promise<GridWidgetPosition[]> {
  const count = await page.locator('.invoice-gridstack-page .grid-stack-item').count();
  if (count === 0) {
    return [];
  }

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
}

export function expectDistinctHorizontalPositions(positions: GridWidgetPosition[]) {
  const xs = [...new Set(positions.map((position) => position.x))];

  expect(xs.length).toBeGreaterThan(1);
  expect(positions.some((position) => position.x > 0)).toBe(true);
}

export async function dragBlockToCanvas(page: Page, blockLabel: string) {
  const library = page.locator('.w-72').first();
  const blockCard = library
    .locator('[draggable="true"]')
    .filter({ hasText: blockLabel })
    .first();
  const canvas = page.locator('.canvas-drop-target');

  await expect(blockCard).toBeVisible({ timeout: 10000 });
  await blockCard.dragTo(canvas, {
    targetPosition: { x: 120, y: 120 },
  });

  await page.waitForFunction(
    (label) => {
      const items = document.querySelectorAll(
        '.invoice-gridstack-page .grid-stack-item'
      );
      return Array.from(items).some((item) =>
        item.textContent?.includes(label)
      );
    },
    blockLabel,
    { timeout: 10000 }
  );
}

export async function selectCanvasBlock(page: Page, blockId: string) {
  const block = page.locator(`[data-block-id="${blockId}"]`);
  await block.click();
  await expect(block).toHaveClass(/selected/);
}

export async function deleteCanvasBlock(page: Page, blockId: string) {
  const block = page.locator(`[data-block-id="${blockId}"]`);
  await block.hover();
  await block.getByRole('button', { name: '×' }).click();
  await expect(block).toHaveCount(0, { timeout: 10000 });
}

export async function duplicateCanvasBlock(page: Page, blockId: string) {
  const beforeCount = await page.locator('.grid-stack-item').count();
  const block = page.locator(`[data-block-id="${blockId}"]`);

  await block.hover();
  await block.locator('button[title="Duplicate block"]').click();

  await expect(page.locator('.grid-stack-item')).toHaveCount(beforeCount + 1, {
    timeout: 10000,
  });
}

export function documentSettingsPanel(page: Page) {
  return page.locator('.w-80').last();
}

export async function openDocumentSettingsPanel(page: Page) {
  await page
    .locator('.mb-4')
    .getByRole('button', { name: 'Settings', exact: true })
    .click();
  const panel = documentSettingsPanel(page);
  await expect(panel.getByText('Page Layout', { exact: true })).toBeVisible({
    timeout: 10000,
  });
}

export async function openCustomCssPanel(page: Page) {
  await page
    .locator('.mb-4')
    .getByRole('button', { name: /^css$/i })
    .click();
  await expect(page.getByText('Custom CSS', { exact: true })).toBeVisible({
    timeout: 10000,
  });
}

export async function setDocumentSelectOption(
  page: Page,
  label: string,
  optionLabel: string
) {
  const panel = documentSettingsPanel(page);
  const select = panel
    .getByText(label, { exact: true })
    .locator('xpath=following-sibling::select[1]');

  await expect(select).toBeVisible({ timeout: 10000 });
  await select.selectOption({ label: optionLabel });
}

export function documentSettingsCheckbox(page: Page, label: string) {
  return documentSettingsPanel(page)
    .locator('div.relative.flex.items-start')
    .filter({ hasText: label })
    .locator('input[type="checkbox"]');
}

export async function readCanvasPageWidth(page: Page) {
  return page.locator('.invoice-gridstack-page').evaluate((element) => {
    return element.style.width;
  });
}

export async function expectCanvasPageWidth(page: Page, expectedWidth: string) {
  await expect(page.locator('.invoice-gridstack-page')).toHaveJSProperty(
    'style.width',
    expectedWidth
  );
}

export async function expectCustomCssInPage(page: Page, snippet: string) {
  const css = await page
    .locator('style[data-invoice-custom-css]')
    .evaluate((element) => element.textContent ?? '');
  expect(css).toContain(snippet);
}

export async function setCustomCss(page: Page, css: string) {
  await openCustomCssPanel(page);
  const editorSurface = page.locator('.monaco-editor .view-lines').first();
  await expect(editorSurface).toBeVisible({ timeout: 15000 });
  await editorSurface.click();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(css);
  await page.waitForTimeout(400);
}

export async function fetchDesignViaApi(
  api: InvoiceDesignApi,
  designId: string
): Promise<DesignApiRecord | null> {
  const apiContext = resolveApiContext(api);
  const context = await playwrightRequest.newContext({
    baseURL: apiContext.baseUrl,
  });

  const response = await context.get(`/api/v1/designs/${designId}`, {
    headers: apiContext.headers,
  });

  if (!response.ok()) {
    await context.dispose();
    return null;
  }

  const body = await response.json();
  await context.dispose();
  return (body.data?.data ?? body.data) as DesignApiRecord;
}

export function trackDesignFromBuilderUrl(
  api: { trackEntity: (type: 'designs', id: string) => void },
  page: Page,
  designId?: string | null
) {
  const resolvedDesignId =
    designId ?? extractIdFromUrl(page.url(), 'builder');

  if (resolvedDesignId && resolvedDesignId !== 'new') {
    api.trackEntity('designs', resolvedDesignId);
  }

  return resolvedDesignId;
}

export async function openVisualDesignFromList(page: Page, designName: string) {
  await page.goto('/settings/invoice_design/custom_designs');
  const row = page.locator('tbody tr').filter({ hasText: designName }).first();
  await expect(row).toBeVisible({ timeout: 15000 });
  await row.getByRole('button', { name: 'Actions' }).click();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
}

export async function createLegacyInvoiceDesign(
  page: Page,
  name: string
) {
  await page.goto(
    '/settings/invoice_design/custom_designs/create?redirect=false'
  );

  await page.waitForURL('**/settings/invoice_design/custom_designs/create**', {
    timeout: 15000,
  });

  await page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/designs/create') && response.ok(),
    { timeout: 30000 }
  );

  await expect(page.getByRole('heading', { name: 'New Design' })).toBeVisible({
    timeout: 15000,
  });

  const nameInput = page
    .getByRole('main')
    .locator('input[type="text"]')
    .first();
  await expect(nameInput).toBeVisible({ timeout: 15000 });

  await nameInput.click();
  await nameInput.fill('');
  await nameInput.pressSequentially(name, { delay: 50 });
  await nameInput.blur();

  const designCombobox = page
    .getByRole('main')
    .getByTestId('combobox-input-field')
    .first();
  await expect(designCombobox).toBeVisible({ timeout: 30000 });
  await designCombobox.click();
  await page.getByRole('option').first().click();

  await page.getByRole('button', { name: 'Save' }).click();

  await page.waitForURL('**/settings/invoice_design/custom_designs/**/edit', {
    timeout: 30000,
  });
}
