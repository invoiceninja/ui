/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * Custom Playwright fixtures that provide automatic API cleanup after each test.
 *
 * Usage in test files:
 *   import { test, expect, uniqueName } from '$tests/e2e/fixtures';
 *
 *   test('my test', async ({ page, api }) => {
 *     const name = uniqueName('my-entity');
 *     // Use api.createEntity() / api.trackEntity() for automatic cleanup
 *   });
 */

import { test as base } from '@playwright/test';
import { config } from 'dotenv';
import {
  createApiContext,
  bulkAction,
  fetchEntityByName,
  getCompanySettings,
  putCompanySettings,
  type ApiContext,
  type EntityType,
} from './api-helpers';

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
   * Track an entity for automatic cleanup after the test.
   */
  trackEntity: (type: EntityType, id: string) => void;
  /**
   * Look up an entity by name via API and track it for cleanup.
   */
  trackEntityByName: (type: EntityType, name: string) => Promise<void>;
  /**
   * Create an entity via API and automatically track it for cleanup.
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
}>({
  api: async ({}, use) => {
    const apiUrl = process.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('VITE_API_URL must be set for API fixture');
    }

    const context = await createApiContext(apiUrl);
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

    // Cleanup: delete all tracked entities in reverse dependency order
    const byType = new Map<EntityType, string[]>();
    for (const { type, id } of tracked) {
      if (!byType.has(type)) {
        byType.set(type, []);
      }
      byType.get(type)!.push(id);
    }

    const deleteOrder: EntityType[] = [
      'payments',
      'invoices',
      'recurring_invoices',
      'quotes',
      'credits',
      'purchase_orders',
      'expenses',
      'recurring_expenses',
      'tasks',
      'projects',
      'bank_transactions',
      'task_schedulers',
      'group_settings',
      'designs',
      'expense_categories',
      'products',
      'vendors',
      'clients',
    ];

    for (const type of deleteOrder) {
      const ids = byType.get(type);
      if (ids && ids.length > 0) {
        try {
          await bulkAction(context, type, ids, 'archive');
          await bulkAction(context, type, ids, 'delete');
        } catch {
          // Best effort cleanup
        }
      }
    }
  },

  settingsGuard: async ({}, use) => {
    const apiUrl = process.env.VITE_API_URL;
    if (!apiUrl) {
      throw new Error('VITE_API_URL must be set for settings fixture');
    }

    let savedCompanyId: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let savedSettings: Record<string, any> | undefined;

    const fixture: SettingsFixture = {
      async snapshot() {
        const api = await createApiContext(apiUrl);
        const { companyId, settings } = await getCompanySettings(api);
        savedCompanyId = companyId;
        savedSettings = { ...settings };
      },
    };

    await use(fixture);

    // Restore settings on teardown if a snapshot was taken
    if (savedCompanyId && savedSettings) {
      try {
        const api = await createApiContext(apiUrl);
        await putCompanySettings(api, savedCompanyId, savedSettings);
      } catch {
        // Best effort
      }
    }
  },
});

export { expect } from '@playwright/test';
