/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * Direct API helpers for Playwright tests.
 * Used for setup/teardown to ensure clean state between test runs.
 */

import { request as playwrightRequest } from '@playwright/test';
import type { Permissions as AppPermission } from '$app/common/hooks/permissions/useHasPermission';

import {
  baseEmailForAccount,
  emailForCurrentAccount,
  passwordForCurrentAccount,
  permissionBaseEmails,
  type TestAccount,
} from './accounts';
import { e2eLog } from './log';

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
  'tags',
] as const;

export type EntityType = (typeof ENTITY_ENDPOINTS)[number];
export type Permission = AppPermission | 'admin';

const RESET_PURGE_ENDPOINTS: EntityType[] = [
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
];

export interface ApiContext {
  baseUrl: string;
  token: string;
  headers: Record<string, string>;
  /** Hashed user id from the login payload; required for /company_users/:id/preferences. */
  userId?: string;
}

async function apiRequest(api: ApiContext) {
  return playwrightRequest.newContext({ baseURL: api.baseUrl });
}

export async function createApiContext(
  apiUrl: string,
  email = 'user@example.com',
  password = 'password'
): Promise<ApiContext> {
  const resolvedEmail = emailForCurrentAccount(email);
  const resolvedPassword = passwordForCurrentAccount(password);
  const context = await playwrightRequest.newContext({ baseURL: apiUrl });

  const response = await context.post('/api/v1/login', {
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    data: { email: resolvedEmail, password: resolvedPassword },
  });

  if (!response.ok()) {
    throw new Error(
      `API login failed (${response.status()}): ${await response.text()}`
    );
  }

  const body = await response.json();
  const token =
    body.data?.[0]?.token?.token || body.data?.token?.token || body.token;
  const userId = body.data?.[0]?.user?.id || body.data?.user?.id;

  if (!token) {
    throw new Error(
      `Could not extract token from login response: ${JSON.stringify(
        body
      ).slice(0, 200)}`
    );
  }

  await context.dispose();

  return {
    baseUrl: apiUrl,
    token,
    userId,
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
      `Failed to create ${entityType} (${response.status()}): ${text.slice(
        0,
        300
      )}`
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
  const entity = await createEntityViaApi(
    api,
    'expense_categories' as EntityType,
    {
      name: opts.name,
    }
  );
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
  for (const entityType of RESET_PURGE_ENDPOINTS) {
    try {
      const ids = await fetchEntityIds(api, entityType);
      if (ids.length > 0) {
        await bulkAction(api, entityType, ids, 'archive');
        await bulkAction(api, entityType, ids, 'delete');
        e2eLog(`  Purged ${ids.length} ${entityType}`);
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
      e2eLog(`  Purged ${ids.length} task_schedulers`);
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
      e2eLog(`  Purged ${ids.length} group_settings`);
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
 * Assign permissions to a permission user through the API.
 * The `admin` test permission maps to company_user.is_admin, matching the UI.
 */
export async function setPermissions(
  api: ApiContext,
  email: string,
  permissions: Permission[]
): Promise<void> {
  const resolvedEmail = emailForCurrentAccount(email);
  const users = await fetchAllUsers(api);
  const user = users.find((candidate) => candidate.email === resolvedEmail);

  if (!user) {
    throw new Error(`Could not find permission user ${resolvedEmail}`);
  }

  const isAdmin = permissions.includes('admin');
  const assignedPermissions = permissions.filter(
    (permission) => permission !== 'admin'
  );

  if (isAdmin && assignedPermissions.length > 0) {
    throw new Error(
      `Administrator permission cannot be combined with granular permissions for ${resolvedEmail}`
    );
  }

  const context = await apiRequest(api);

  try {
    const detailResponse = await context.get(
      `/api/v1/users/${user.id}?include=company_user`,
      { headers: api.headers }
    );

    if (!detailResponse.ok()) {
      throw new Error(
        `Failed to load user ${resolvedEmail} for permission assignment (${detailResponse.status()}): ${await detailResponse.text()}`
      );
    }

    const fullUser = (await detailResponse.json()).data;
    const response = await context.put(
      `/api/v1/users/${user.id}?include=company_user`,
      {
        headers: api.headers,
        data: {
          ...fullUser,
          company_user: {
            ...fullUser.company_user,
            permissions: isAdmin ? '' : assignedPermissions.join(','),
            is_admin: isAdmin,
          },
        },
      }
    );

    if (!response.ok()) {
      throw new Error(
        `Failed to assign permissions to ${resolvedEmail} (${response.status()}): ${await response.text()}`
      );
    }
  } finally {
    await context.dispose();
  }
}

/**
 * Reset permission user back to no permissions.
 * Permissions live on company_user (not the top-level user payload).
 */
export async function resetPermissionUser(
  api: ApiContext,
  email: string
): Promise<void> {
  await setPermissions(api, email, []);
}

/**
 * Default react_settings written by the preferences endpoint after a reset.
 * table_filters / column prefs are the cross-test leak; other keys match app defaults.
 */
const CLEAN_USER_REACT_SETTINGS = {
  show_pdf_preview: true,
  react_notification_link: true,
  persist_table_filters: true,
  table_filters: {},
  react_table_columns: {},
  table_footer_columns: {},
};

/**
 * Clear persisted list filters and table-column prefs for the authenticated user.
 * The preferences endpoint only authorizes `auth()->id === route user id`;
 * updating any other user returns 401.
 */
export async function resetUserReactSettings(
  api: ApiContext,
  options?: { quiet?: boolean }
): Promise<void> {
  if (!api.userId) {
    throw new Error(
      'Cannot reset react settings: login response did not include user.id'
    );
  }

  const context = await apiRequest(api);

  try {
    const update = await context.put(
      `/api/v1/company_users/${api.userId}/preferences`,
      {
        headers: api.headers,
        data: { react_settings: CLEAN_USER_REACT_SETTINGS },
      }
    );

    if (!update.ok()) {
      throw new Error(
        `Failed to reset react settings (${update.status()}): ${(
          await update.text()
        ).slice(0, 200)}`
      );
    }

    if (!options?.quiet) {
      e2eLog('  Reset react settings');
    }
  } finally {
    await context.dispose();
  }
}

/**
 * Restore any deleted/archived seed users that tests may have removed.
 * Skips unsuffixed permission-base emails (tasks@example.com, …) so this
 * cannot undo purgeUnsuffixedPermissionUsers on parallel account lanes.
 */
export async function restoreDeletedUsers(api: ApiContext): Promise<void> {
  const seedUserNames = [
    'Quotes Example',
    'Products Example',
    'Credits Example',
  ];
  const unsuffixedEmails = new Set<string>(permissionBaseEmails);

  const users = await fetchAllUsers(api);
  const deletedIds = users
    .filter(
      (u) =>
        seedUserNames.some(
          (name) => `${u.first_name} ${u.last_name}`.trim() === name
        ) &&
        u.is_deleted &&
        !unsuffixedEmails.has(u.email)
    )
    .map((u) => u.id);

  if (deletedIds.length > 0) {
    await bulkAction(api, 'users' as EntityType, deletedIds, 'restore');
    e2eLog(`  Restored ${deletedIds.length} deleted seed users`);
  }
}

/**
 * Remove leftover unsuffixed permission users (e.g. tasks@example.com) from
 * this company. Parallel lanes use tasks1@ / tasks2@ / … with the same display
 * name ("Tasks Example"); keeping the unsuffixed orphan makes assignee
 * combobox `.first()` picks ambiguous and flaky across workers.
 *
 * Safe under parallel lanes: each reset is company-scoped via that lane's
 * owner token, and only exact base emails from permissionBaseEmails are
 * removed — never the lane-scoped `{base}{id}@…` users.
 */
export async function purgeUnsuffixedPermissionUsers(
  api: ApiContext,
  account: TestAccount
): Promise<void> {
  const unsuffixedEmails = new Set<string>(permissionBaseEmails);
  const users = await fetchAllUsers(api);

  const orphanIds = users
    .filter(
      (user) =>
        unsuffixedEmails.has(user.email) &&
        user.email !== account.ownerEmail &&
        !user.is_deleted
    )
    .map((user) => user.id);

  if (orphanIds.length === 0) {
    return;
  }

  await bulkAction(api, 'users' as EntityType, orphanIds, 'archive');
  await bulkAction(api, 'users' as EntityType, orphanIds, 'delete');
  e2eLog(
    `  Purged ${orphanIds.length} unsuffixed permission users on lane ${account.id}`
  );
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

  // Derive the expected display name from the base account email, not the suffixed lane email.
  const localPart = baseEmailForAccount(email).split('@')[0];
  const derivedFirst =
    firstName || localPart.charAt(0).toUpperCase() + localPart.slice(1);
  const derivedLast = lastName || 'Example';

  if (existing) {
    if (existing.is_deleted) {
      await bulkAction(api, 'users' as EntityType, [existing.id], 'restore');
      e2eLog(`  Restored deleted user ${email}`);
    }

    if (
      existing.first_name !== derivedFirst ||
      existing.last_name !== derivedLast
    ) {
      const context = await apiRequest(api);
      const response = await context.put(`/api/v1/users/${existing.id}`, {
        headers: api.headers,
        data: { ...existing, first_name: derivedFirst, last_name: derivedLast },
      });

      if (response.ok()) {
        e2eLog(
          `  Updated user name ${email} (${derivedFirst} ${derivedLast})`
        );
      } else {
        console.warn(
          `  Failed to update user name ${email}: ${response.status()}`
        );
      }

      await context.dispose();
    }

    return existing.id;
  }
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

  e2eLog(
    `  Created missing user ${email} (${derivedFirst} ${derivedLast})`
  );
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

export async function getCompany(
  api: ApiContext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<{ companyId: string; company: Record<string, any> }> {
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
    company,
  };
}

export async function getCompanySettings(
  api: ApiContext
): Promise<CompanySettings> {
  const { companyId, company } = await getCompany(api);

  return {
    companyId,
    settings: company.settings || {},
  };
}

export async function updateCompany(
  api: ApiContext,
  companyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  company: Record<string, any>
): Promise<void> {
  const context = await apiRequest(api);
  const response = await context.put(`/api/v1/companies/${companyId}`, {
    headers: api.headers,
    data: company,
  });

  if (!response.ok()) {
    const text = await response.text();
    await context.dispose();
    throw new Error(
      `Failed to update company: ${response.status()} ${text.slice(0, 300)}`
    );
  }

  await context.dispose();
}

export async function updateCompanyFields(
  api: ApiContext,
  companyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: Record<string, any>
): Promise<void> {
  const { company } = await getCompany(api);

  await updateCompany(api, companyId, {
    ...company,
    ...fields,
  });
}

export async function putCompanySettings(
  api: ApiContext,
  companyId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any>
): Promise<void> {
  const { company } = await getCompany(api);

  await updateCompany(api, companyId, {
    ...company,
    settings: {
      ...(company.settings || {}),
      ...settings,
    },
  });
}

/**
 * Reset company settings that tests commonly modify.
 */
export async function resetCompanySettings(api: ApiContext): Promise<void> {
  try {
    const { companyId, company } = await getCompany(api);

    await updateCompany(api, companyId, {
      ...company,
      enabled_expense_tax_rates: 0,
      mark_expenses_invoiceable: false,
      mark_expenses_paid: false,
      convert_expense_currency: false,
      invoice_expense_documents: false,
      settings: {
        ...(company.settings || {}),
        military_time: false,
      },
    });
    e2eLog('  Reset company settings');
  } catch (e) {
    console.warn(`  Failed to reset company settings: ${e}`);
  }
}
