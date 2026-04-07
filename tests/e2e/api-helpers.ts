/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * Direct API helpers for Playwright tests.
 * Used for setup/teardown to ensure clean state between test runs.
 */

import { request as playwrightRequest } from '@playwright/test';

const ENTITY_ENDPOINTS = [
  'invoices',
  'recurring_invoices',
  'quotes',
  'credits',
  'purchase_orders',
  'expenses',
  'recurring_expenses',
  'payments',
  'tasks',
  'projects',
  'vendors',
  'clients',
  'products',
  'bank_transactions',
  'task_schedulers',
  'group_settings',
  'expense_categories',
  'designs',
] as const;

export type EntityType = (typeof ENTITY_ENDPOINTS)[number];

export interface ApiContext {
  baseUrl: string;
  token: string;
  headers: Record<string, string>;
}

async function apiRequest(api: ApiContext) {
  return playwrightRequest.newContext({ baseURL: api.baseUrl });
}

export async function createApiContext(
  apiUrl: string,
  email = 'user@example.com',
  password = 'password'
): Promise<ApiContext> {
  const context = await playwrightRequest.newContext({ baseURL: apiUrl });

  const response = await context.post('/api/v1/login', {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    data: { email, password },
  });

  if (!response.ok()) {
    throw new Error(
      `API login failed (${response.status()}): ${await response.text()}`
    );
  }

  const body = await response.json();
  const token =
    body.data?.[0]?.token?.token || body.data?.token?.token || body.token;

  if (!token) {
    throw new Error(
      `Could not extract token from login response: ${JSON.stringify(body).slice(0, 200)}`
    );
  }

  await context.dispose();

  return {
    baseUrl: apiUrl,
    token,
    headers: {
      'X-Api-Token': token,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
    },
  };
}

// ---------------------------------------------------------------------------
// Generic CRUD
// ---------------------------------------------------------------------------

export async function fetchEntityIds(
  api: ApiContext,
  entityType: EntityType
): Promise<string[]> {
  const context = await apiRequest(api);

  const response = await context.get(
    `/api/v1/${entityType}?per_page=100&status=active`,
    { headers: api.headers }
  );

  if (!response.ok()) {
    await context.dispose();
    return [];
  }

  const body = await response.json();
  const ids = (body.data || []).map((e: { id: string }) => e.id);

  await context.dispose();
  return ids;
}

export async function fetchEntityByName(
  api: ApiContext,
  entityType: EntityType,
  name: string
): Promise<{ id: string } | null> {
  const context = await apiRequest(api);

  const response = await context.get(
    `/api/v1/${entityType}?filter=${encodeURIComponent(name)}&per_page=5`,
    { headers: api.headers }
  );

  if (!response.ok()) {
    await context.dispose();
    return null;
  }

  const body = await response.json();
  const match = (body.data || [])[0];

  await context.dispose();
  return match ? { id: match.id } : null;
}

export async function bulkAction(
  api: ApiContext,
  entityType: EntityType,
  ids: string[],
  action: 'archive' | 'restore' | 'delete'
): Promise<void> {
  if (ids.length === 0) return;

  const context = await apiRequest(api);

  const response = await context.post(`/api/v1/${entityType}/bulk`, {
    headers: api.headers,
    data: { action, ids },
  });

  if (!response.ok()) {
    console.warn(
      `Bulk ${action} on ${entityType} failed (${response.status()})`
    );
  }

  await context.dispose();
}

export async function createEntityViaApi(
  api: ApiContext,
  entityType: EntityType,
  data: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const context = await apiRequest(api);

  const response = await context.post(`/api/v1/${entityType}`, {
    headers: api.headers,
    data,
  });

  if (!response.ok()) {
    const text = await response.text();
    await context.dispose();
    throw new Error(
      `Failed to create ${entityType} (${response.status()}): ${text.slice(0, 300)}`
    );
  }

  const body = await response.json();
  await context.dispose();
  return body.data;
}

// ---------------------------------------------------------------------------
// Typed creation helpers
// ---------------------------------------------------------------------------

export async function createClientViaApi(
  api: ApiContext,
  opts: { name: string; email?: string }
): Promise<{ id: string; name: string }> {
  const entity = await createEntityViaApi(api, 'clients', {
    name: opts.name,
    contacts: [
      {
        first_name: 'Test',
        last_name: 'Contact',
        email: opts.email || `test-${Date.now()}@example.com`,
      },
    ],
  });
  return { id: entity.id as string, name: entity.name as string };
}

export async function createProductViaApi(
  api: ApiContext,
  opts: { product_key: string; notes?: string; cost?: number; price?: number }
): Promise<{ id: string; product_key: string }> {
  const entity = await createEntityViaApi(api, 'products', {
    product_key: opts.product_key,
    notes: opts.notes || '',
    cost: opts.cost || 0,
    price: opts.price || 0,
  });
  return {
    id: entity.id as string,
    product_key: entity.product_key as string,
  };
}

export async function createVendorViaApi(
  api: ApiContext,
  opts: { name: string }
): Promise<{ id: string; name: string }> {
  const entity = await createEntityViaApi(api, 'vendors', {
    name: opts.name,
    contacts: [
      {
        first_name: 'Test',
        last_name: 'Vendor',
        email: `vendor-${Date.now()}@example.com`,
      },
    ],
  });
  return { id: entity.id as string, name: entity.name as string };
}

export async function createProjectViaApi(
  api: ApiContext,
  opts: { name: string; client_id?: string }
): Promise<{ id: string; name: string }> {
  const entity = await createEntityViaApi(api, 'projects', {
    name: opts.name,
    ...(opts.client_id && { client_id: opts.client_id }),
  });
  return { id: entity.id as string, name: entity.name as string };
}

export async function createExpenseCategoryViaApi(
  api: ApiContext,
  opts: { name: string }
): Promise<{ id: string; name: string }> {
  const entity = await createEntityViaApi(api, 'expense_categories' as EntityType, {
    name: opts.name,
  });
  return { id: entity.id as string, name: entity.name as string };
}

export async function createTaxRateViaApi(
  api: ApiContext,
  opts: { name: string; rate: number }
): Promise<{ id: string; name: string }> {
  const entity = await createEntityViaApi(api, 'tax_rates' as EntityType, {
    name: opts.name,
    rate: opts.rate,
  });
  return { id: entity.id as string, name: entity.name as string };
}

// ---------------------------------------------------------------------------
// Purge helpers
// ---------------------------------------------------------------------------

/**
 * Purge all test-created entities across all entity types.
 * Deletes in dependency order (invoices/payments first, then clients/vendors).
 */
export async function purgeAllEntities(api: ApiContext): Promise<void> {
  for (const entityType of ENTITY_ENDPOINTS) {
    try {
      const ids = await fetchEntityIds(api, entityType);
      if (ids.length > 0) {
        await bulkAction(api, entityType, ids, 'archive');
        await bulkAction(api, entityType, ids, 'delete');
        console.log(`  Purged ${ids.length} ${entityType}`);
      }
    } catch (e) {
      console.warn(`  Failed to purge ${entityType}: ${e}`);
    }
  }
}

export async function purgeSchedules(api: ApiContext): Promise<void> {
  try {
    const ids = await fetchEntityIds(api, 'task_schedulers');
    if (ids.length > 0) {
      await bulkAction(api, 'task_schedulers', ids, 'archive');
      await bulkAction(api, 'task_schedulers', ids, 'delete');
      console.log(`  Purged ${ids.length} task_schedulers`);
    }
  } catch {
    // task_schedulers may not support bulk — try individual delete
  }
}

export async function purgeGroupSettings(api: ApiContext): Promise<void> {
  try {
    const ids = await fetchEntityIds(api, 'group_settings');
    if (ids.length > 0) {
      await bulkAction(api, 'group_settings', ids, 'archive');
      await bulkAction(api, 'group_settings', ids, 'delete');
      console.log(`  Purged ${ids.length} group_settings`);
    }
  } catch {
    // best effort
  }
}

// ---------------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------------

interface ApiUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_deleted: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

async function fetchAllUsers(api: ApiContext): Promise<ApiUser[]> {
  const context = await apiRequest(api);
  const response = await context.get(
    '/api/v1/users?per_page=100&include_deleted=true',
    { headers: api.headers }
  );

  if (!response.ok()) {
    await context.dispose();
    return [];
  }

  const body = await response.json();
  await context.dispose();
  return body.data || [];
}

/**
 * Reset permission user back to no permissions.
 */
export async function resetPermissionUser(
  api: ApiContext,
  email: string
): Promise<void> {
  const users = await fetchAllUsers(api);
  const user = users.find((u) => u.email === email);

  if (!user) return;

  const context = await apiRequest(api);
  const response = await context.put(`/api/v1/users/${user.id}`, {
    headers: api.headers,
    data: { ...user, permissions: '' },
  });

  if (response.ok()) {
    console.log(`  Reset permissions for ${email}`);
  } else {
    console.warn(
      `  Failed to reset permissions for ${email}: ${response.status()}`
    );
  }

  await context.dispose();
}

/**
 * Restore any deleted/archived seed users that tests may have removed.
 */
export async function restoreDeletedUsers(api: ApiContext): Promise<void> {
  const seedUserNames = [
    'Quotes Example',
    'Products Example',
    'Credits Example',
  ];

  const users = await fetchAllUsers(api);
  const deletedIds = users
    .filter(
      (u) =>
        seedUserNames.some(
          (name) =>
            `${u.first_name} ${u.last_name}`.trim() === name
        ) && u.is_deleted
    )
    .map((u) => u.id);

  if (deletedIds.length > 0) {
    await bulkAction(api, 'users' as EntityType, deletedIds, 'restore');
    console.log(`  Restored ${deletedIds.length} deleted seed users`);
  }
}

/**
 * Ensure a permission user exists by email. If missing, create them.
 * If deleted/archived, restore them.
 * Returns the user ID.
 */
export async function ensurePermissionUserExists(
  api: ApiContext,
  email: string,
  firstName?: string,
  lastName?: string
): Promise<string> {
  const users = await fetchAllUsers(api);
  const existing = users.find((u) => u.email === email);

  if (existing) {
    if (existing.is_deleted) {
      await bulkAction(api, 'users' as EntityType, [existing.id], 'restore');
      console.log(`  Restored deleted user ${email}`);
    }
    return existing.id;
  }

  // User doesn't exist — derive name from email if not provided
  const localPart = email.split('@')[0];
  const derivedFirst =
    firstName || localPart.charAt(0).toUpperCase() + localPart.slice(1);
  const derivedLast = lastName || 'Example';

  const context = await apiRequest(api);
  const response = await context.post('/api/v1/users', {
    headers: api.headers,
    data: {
      first_name: derivedFirst,
      last_name: derivedLast,
      email,
    },
  });

  const body = await response.json();
  await context.dispose();

  const userId = body.data?.id;
  if (!userId) {
    throw new Error(
      `Failed to create user ${email}: ${JSON.stringify(body).slice(0, 200)}`
    );
  }

  console.log(`  Created missing user ${email} (${derivedFirst} ${derivedLast})`);
  return userId;
}

// ---------------------------------------------------------------------------
// Company settings
// ---------------------------------------------------------------------------

export interface CompanySettings {
  companyId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>;
}

export async function getCompanySettings(
  api: ApiContext
): Promise<CompanySettings> {
  const context = await apiRequest(api);
  const response = await context.get('/api/v1/companies', {
    headers: api.headers,
  });

  if (!response.ok()) {
    await context.dispose();
    throw new Error(`Failed to fetch companies: ${response.status()}`);
  }

  const body = await response.json();
  await context.dispose();

  const company = (body.data || [])[0];
  if (!company) {
    throw new Error('No company found');
  }

  return {
    companyId: company.id,
    settings: company.settings || {},
  };
}

export async function putCompanySettings(
  api: ApiContext,
  companyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>
): Promise<void> {
  const context = await apiRequest(api);

  const response = await context.put(`/api/v1/companies/${companyId}`, {
    headers: api.headers,
    data: { settings },
  });

  if (!response.ok()) {
    console.warn(`Failed to update company settings: ${response.status()}`);
  }

  await context.dispose();
}

/**
 * Reset company settings that tests commonly modify.
 */
export async function resetCompanySettings(api: ApiContext): Promise<void> {
  try {
    const { companyId, settings } = await getCompanySettings(api);

    const resetSettings = {
      ...settings,
      enabled_expense_tax_rates: 0,
      should_be_invoiced: false,
      mark_expenses_paid: false,
      convert_expense_currency: false,
      add_documents_to_invoice: false,
      military_time: false,
    };

    await putCompanySettings(api, companyId, resetSettings);
    console.log('  Reset company settings');
  } catch (e) {
    console.warn(`  Failed to reset company settings: ${e}`);
  }
}
