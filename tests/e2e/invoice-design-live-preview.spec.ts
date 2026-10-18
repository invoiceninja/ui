import { request as playwrightRequest } from '@playwright/test';
import { login } from '$tests/e2e/helpers';
import {
  resetAccountBeforeAll,
  test,
  expect,
  type ApiFixture,
} from '$tests/e2e/fixtures';
import type { Page, Response } from '@playwright/test';

resetAccountBeforeAll();

const PREVIEW_SETTLE_MS = 800;

type LiveDesignRequest = {
  entity_type: string;
  settings?: Record<string, unknown>;
};

type OptionalDesignCase = {
  label: RegExp;
  entityType: string;
  templateEntity: string;
};

const OPTIONAL_DESIGN_CASES: OptionalDesignCase[] = [
  {
    label: /^Statement Design$/i,
    entityType: 'statement',
    templateEntity: 'statement',
  },
  {
    label: /^Delivery Note Design$/i,
    entityType: 'delivery_note',
    templateEntity: 'invoice',
  },
  {
    label: /^Payment Receipt Design$/i,
    entityType: 'payment_receipt',
    templateEntity: 'payment',
  },
  {
    label: /^Payment Refund Design$/i,
    entityType: 'payment_refund',
    templateEntity: 'payment',
  },
];

const fulfillLiveDesign = async (
  route: Parameters<Parameters<Page['route']>[1]>[0]
) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/pdf',
    body: Buffer.from('%PDF-1.4'),
  });
};

type LiveDesignTracker = {
  requests: LiveDesignRequest[];
  completedResponses: Response[];
  failedRequests: string[];
};

const trackLiveDesignRequests = async (page: Page): Promise<LiveDesignTracker> => {
  const tracker: LiveDesignTracker = {
    requests: [],
    completedResponses: [],
    failedRequests: [],
  };

  page.on('requestfailed', (request) => {
    if (request.url().includes('/api/v1/live_design')) {
      tracker.failedRequests.push(`${request.method()} ${request.url()}`);
    }
  });

  await page.route('**/api/v1/live_design', async (route) => {
    if (route.request().method() === 'POST') {
      tracker.requests.push(route.request().postDataJSON() as LiveDesignRequest);
    }

    await fulfillLiveDesign(route);

    const response = await route.request().response();

    if (response) {
      tracker.completedResponses.push(response);
    }
  });

  return tracker;
};

const getTemplateDesigns = async (api: ApiFixture, entity: string) => {
  const requestContext = await playwrightRequest.newContext({
    baseURL: api.context.baseUrl,
  });

  const response = await requestContext.get(
    `/api/v1/designs?template=true&status=active&sort=name|asc&entities=${entity}`,
    { headers: api.context.headers }
  );

  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  await requestContext.dispose();

  return (body.data ?? []) as Array<{ id: string; name: string }>;
};

const waitForInitialLiveDesign = async (page: Page, tracker: LiveDesignTracker) => {
  await expect
    .poll(() => tracker.requests.length, { timeout: 15000 })
    .toBeGreaterThanOrEqual(1);

  await expect
    .poll(() => completedLiveDesignCount(tracker), { timeout: 15000 })
    .toBeGreaterThanOrEqual(1);

  await page.waitForTimeout(PREVIEW_SETTLE_MS);
};

const gotoInvoiceDesignSettings = async (
  page: Page,
  tracker: LiveDesignTracker
) => {
  await login(page);
  await page.goto('/settings/invoice_design');
  await page.waitForLoadState('networkidle');
  await waitForInitialLiveDesign(page, tracker);
};

const waitForPreviewIframe = async (page: Page) => {
  const iframe = page.locator('iframe').last();
  await expect(iframe).toBeVisible({ timeout: 15000 });
  await expect
    .poll(async () => iframe.getAttribute('src'), { timeout: 15000 })
    .not.toBe('');
  return iframe;
};

const designCombobox = (page: Page, label: RegExp) =>
  page.locator('dt').filter({ hasText: label }).locator('+ dd').getByRole('combobox');

const openDesignSelect = async (page: Page, label: RegExp) => {
  const combobox = designCombobox(page, label);
  await combobox.click();
  await page.getByRole('listbox').waitFor({ state: 'visible' });
};

const selectFirstNamedDesignOption = async (page: Page, label: RegExp) => {
  await openDesignSelect(page, label);

  const options = page.getByRole('listbox').getByRole('option');
  const optionCount = await options.count();

  expect(optionCount).toBeGreaterThan(0);

  for (let index = 0; index < optionCount; index += 1) {
    const text = (await options.nth(index).textContent())?.trim() ?? '';

    if (text) {
      await options.nth(index).click();
      return;
    }
  }

  throw new Error(`No named design options available for ${label}`);
};

const chooseDifferentDesignOption = async (page: Page, label: RegExp) => {
  await openDesignSelect(page, label);

  const options = page.getByRole('listbox').getByRole('option');
  const optionCount = await options.count();

  expect(optionCount).toBeGreaterThan(0);

  if (optionCount > 1) {
    await options.nth(1).click();
    return;
  }

  await options.first().click();
};

const clearOptionalDesignSelect = async (page: Page, label: RegExp) => {
  const row = page.locator('dt').filter({ hasText: label }).locator('..');
  const clearButton = row.locator('[class*="clear-indicator"]');

  if (await clearButton.count()) {
    await clearButton.first().click();
    return;
  }

  await openDesignSelect(page, label);

  const options = page.getByRole('listbox').getByRole('option');
  const optionCount = await options.count();

  for (let index = 0; index < optionCount; index += 1) {
    const text = (await options.nth(index).textContent())?.trim() ?? '';

    if (!text) {
      await options.nth(index).click();
      return;
    }
  }

  throw new Error(`Unable to clear design selection for ${label}`);
};

const waitForNextLiveDesignRequest = async (
  page: Page,
  tracker: LiveDesignTracker,
  previousCount: number
) => {
  await expect
    .poll(() => tracker.requests.length, { timeout: 15000 })
    .toBeGreaterThan(previousCount);

  await expect
    .poll(() => completedLiveDesignCount(tracker), { timeout: 15000 })
    .toBeGreaterThan(previousCount);

  await page.waitForTimeout(PREVIEW_SETTLE_MS);
};

const completedLiveDesignCount = (tracker: LiveDesignTracker) =>
  tracker.completedResponses.filter((response) => response.ok()).length;

test.describe('invoice design live preview', () => {
  test('initial page load completes one live_design request and renders the preview', async ({
    page,
  }) => {
    const tracker = await trackLiveDesignRequests(page);

    await gotoInvoiceDesignSettings(page, tracker);

    expect(completedLiveDesignCount(tracker)).toBe(1);
    expect(tracker.failedRequests).toHaveLength(0);
    expect(tracker.requests[0]?.entity_type).toBe('invoice');

    const iframe = await waitForPreviewIframe(page);
    expect(await iframe.getAttribute('src')).toContain('blob:');
  });

  test('initial page load does not leave live_design requests cancelled', async ({
    page,
  }) => {
    const tracker = await trackLiveDesignRequests(page);

    await gotoInvoiceDesignSettings(page, tracker);

    expect(tracker.failedRequests).toEqual([]);
    expect(completedLiveDesignCount(tracker)).toBeGreaterThanOrEqual(1);
  });

  test('selecting quote design sends a single live_design request with quote entity_type', async ({
    page,
  }) => {
    const tracker = await trackLiveDesignRequests(page);

    await gotoInvoiceDesignSettings(page, tracker);

    const initialCompletedCount = completedLiveDesignCount(tracker);

    await chooseDifferentDesignOption(page, /^Quote Design$/i);
    await waitForNextLiveDesignRequest(page, tracker, initialCompletedCount);

    const newRequests = tracker.requests.slice(initialCompletedCount);

    expect(newRequests).toHaveLength(1);
    expect(newRequests[0]?.entity_type).toBe('quote');
    expect(tracker.failedRequests).toHaveLength(0);
    await waitForPreviewIframe(page);
  });

  test('selecting invoice design sends a single live_design request with invoice entity_type', async ({
    page,
  }) => {
    const tracker = await trackLiveDesignRequests(page);

    await gotoInvoiceDesignSettings(page, tracker);

    const initialCompletedCount = completedLiveDesignCount(tracker);

    await chooseDifferentDesignOption(page, /^Invoice Design$/i);
    await waitForNextLiveDesignRequest(page, tracker, initialCompletedCount);

    const newRequests = tracker.requests.slice(initialCompletedCount);

    expect(newRequests).toHaveLength(1);
    expect(newRequests[0]?.entity_type).toBe('invoice');
    expect(tracker.failedRequests).toHaveLength(0);
  });

  test('quote details tab uses quote entity_type for live preview', async ({
    page,
  }) => {
    const tracker = await trackLiveDesignRequests(page);

    await login(page);
    await page.goto('/settings/invoice_design');
    await page.waitForLoadState('networkidle');
    await waitForInitialLiveDesign(page, tracker);

    const initialCompletedCount = completedLiveDesignCount(tracker);

    await page.goto('/settings/invoice_design/quote_details');
    await page.waitForLoadState('networkidle');
    await waitForNextLiveDesignRequest(page, tracker, initialCompletedCount);

    const newRequests = tracker.requests.slice(initialCompletedCount);

    expect(newRequests).toHaveLength(1);
    expect(newRequests[0]?.entity_type).toBe('quote');
    expect(tracker.failedRequests).toHaveLength(0);
  });

  for (const { label, entityType, templateEntity } of OPTIONAL_DESIGN_CASES) {
    test(`selecting ${entityType} design sends one live_design request`, async ({
      page,
      api,
    }) => {
      const designs = await getTemplateDesigns(api, templateEntity);
      test.skip(
        designs.length === 0,
        `no template designs available for ${entityType}`
      );

      const tracker = await trackLiveDesignRequests(page);

      await gotoInvoiceDesignSettings(page, tracker);

      const initialCompletedCount = completedLiveDesignCount(tracker);

      await selectFirstNamedDesignOption(page, label);
      await waitForNextLiveDesignRequest(page, tracker, initialCompletedCount);

      const newRequests = tracker.requests.slice(initialCompletedCount);

      expect(newRequests).toHaveLength(1);
      expect(newRequests[0]?.entity_type).toBe(entityType);
      expect(tracker.failedRequests).toHaveLength(0);
      await waitForPreviewIframe(page);
    });

    test(`clearing ${entityType} design does not trigger live_design`, async ({
      page,
      api,
    }) => {
      const designs = await getTemplateDesigns(api, templateEntity);
      test.skip(
        designs.length === 0,
        `no template designs available for ${entityType}`
      );

      const tracker = await trackLiveDesignRequests(page);

      await gotoInvoiceDesignSettings(page, tracker);

      const initialCompletedCount = completedLiveDesignCount(tracker);

      await selectFirstNamedDesignOption(page, label);
      await waitForNextLiveDesignRequest(page, tracker, initialCompletedCount);

      const countBeforeClear = tracker.requests.length;

      await clearOptionalDesignSelect(page, label);
      await page.waitForTimeout(PREVIEW_SETTLE_MS);

      expect(tracker.requests.length).toBe(countBeforeClear);
      expect(tracker.failedRequests).toHaveLength(0);
    });
  }
});
