/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * Custom Playwright fixtures that assign worker account lanes and provide API helpers.
 *
 * Usage in test files:
 *   import { test, expect, uniqueName } from '$tests/e2e/fixtures';
 *
 *   test('my test', async ({ page, api }) => {
 *     const name = uniqueName('my-entity');
 *     // Use api.createEntity() for API setup in the current worker account
 *   });
 */

import { test as base } from '@playwright/test';
import { config } from 'dotenv';
import {
  createApiContext,
  fetchEntityByName,
  getCompanySettings,
  putCompanySettings,
  type ApiContext,
  type EntityType,
} from './api-helpers';
import {
  accountForParallelIndex,
  clearCurrentTestAccount,
  setCurrentTestAccount,
  type TestAccount,
} from './accounts';
import { resetTestAccount } from './account-reset';

config({ path: '.env.testing', override: true });
config();

/**
 * Generate a unique name with a prefix to avoid collisions between test runs.
 */
export function uniqueName(prefix: string): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix}-${ts}-${rand}`;
}

/**
 * Extract an entity ID from a Playwright page URL.
 * Matches patterns like /invoices/ABC123/edit or /settings/schedules/ABC123/edit
 */
export function extractIdFromUrl(url: string, entityPath: string): string | null {
  const regex = new RegExp(`${entityPath}/([^/]+?)(/edit)?$`);
  const match = url.match(regex);
  return match ? match[1] : null;
}

interface TrackedEntity {
  type: EntityType;
  id: string;
}

export interface ApiFixture {
  context: ApiContext;
  /**
   * Track an entity created by the test. Full cleanup happens in each spec via resetAccountBeforeAll().
   */
  trackEntity: (type: EntityType, id: string) => void;
  /**
   * Look up an entity by name via API and track it for compatibility.
   */
  trackEntityByName: (type: EntityType, name: string) => Promise<void>;
  /**
   * Create an entity via API in the current worker account.
   */
  createEntity: (
    type: EntityType,
    data: Record<string, unknown>
  ) => Promise<Record<string, unknown>>;
}

export interface SettingsFixture {
  /**
   * Snapshot current company settings. Call before modifying settings.
   * On teardown, settings will be restored to this snapshot automatically.
   */
  snapshot: () => Promise<void>;
}

export const test = base.extend<{
  api: ApiFixture;
  settingsGuard: SettingsFixture;
}, {
  account: TestAccount;
}>({
  account: [
    async ({}, use, workerInfo) => {
      const account = accountForParallelIndex(workerInfo.parallelIndex);
      setCurrentTestAccount(account);
      await use(account);

      clearCurrentTestAccount();
    },
    { auto: true, scope: 'worker' },
  ],

  api: async ({ account }, use) => {
    const context = await createApiContext(
      account.apiUrl,
      account.ownerEmail,
      account.password
    );
    const tracked: TrackedEntity[] = [];

    const fixture: ApiFixture = {
      context,

      trackEntity(type, id) {
        tracked.push({ type, id });
      },

      async trackEntityByName(type, name) {
        const entity = await fetchEntityByName(context, type, name);
        if (entity) {
          tracked.push({ type, id: entity.id });
        }
      },

      async createEntity(type, data) {
        const { request } = await import('@playwright/test');
        const reqContext = await request.newContext({
          baseURL: context.baseUrl,
        });

        const response = await reqContext.post(`/api/v1/${type}`, {
          headers: context.headers,
          data,
        });

        const body = await response.json();
        const entity = body.data;

        if (entity?.id) {
          tracked.push({ type, id: entity.id });
        }

        await reqContext.dispose();
        return entity;
      },
    };

    await use(fixture);
  },

  settingsGuard: async ({ account }, use) => {
    let savedCompanyId: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let savedSettings: Record<string, any> | undefined;

    const fixture: SettingsFixture = {
      async snapshot() {
        const api = await createApiContext(
          account.apiUrl,
          account.ownerEmail,
          account.password
        );
        const { companyId, settings } = await getCompanySettings(api);
        savedCompanyId = companyId;
        savedSettings = { ...settings };
      },
    };

    await use(fixture);

    // Restore settings on teardown if a snapshot was taken
    if (savedCompanyId && savedSettings) {
      try {
        const api = await createApiContext(
          account.apiUrl,
          account.ownerEmail,
          account.password
        );
        await putCompanySettings(api, savedCompanyId, savedSettings);
      } catch {
        // Best effort
      }
    }
  },
});

export const RESET_ACCOUNT_TIMEOUT = 180_000;

export function resetAccountBeforeAll(timeout = RESET_ACCOUNT_TIMEOUT) {
  test.beforeAll(async ({ account }, testInfo) => {
    test.setTimeout(timeout);
    await resetTestAccount(account, 'before ' + testInfo.file);
  });
}

export { expect } from '@playwright/test';
