/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * Playwright global setup — resets API state before the test suite runs.
 * This ensures a clean starting state regardless of how previous runs ended.
 */

import { config } from 'dotenv';
import {
  createApiContext,
  purgeAllEntities,
  purgeSchedules,
  purgeGroupSettings,
  resetPermissionUser,
  restoreDeletedUsers,
  resetCompanySettings,
} from './api-helpers';

config({ path: '.env.testing', override: true });
config();

const PERMISSION_EMAILS = [
  'permissions@example.com',
  'invoices@example.com',
  'clients@example.com',
  'products@example.com',
  'projects@example.com',
  'vendors@example.com',
  'expenses@example.com',
  'credits@example.com',
  'tasks@example.com',
  'quotes@example.com',
  'payments@example.com',
  'purchase_orders@example.com',
  'bank_transactions@example.com',
];

async function globalSetup() {
  const apiUrl = process.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error(
      'VITE_API_URL must be set in .env for test API reset to work'
    );
  }

  console.log('\nResetting API state before test suite...');
  console.log(`  API URL: ${apiUrl}`);

  try {
    const api = await createApiContext(apiUrl);

    // 1. Reset company settings modified by tests
    await resetCompanySettings(api);

    // 2. Purge schedules and group settings
    await purgeSchedules(api);
    await purgeGroupSettings(api);

    // 3. Restore any deleted seed users
    await restoreDeletedUsers(api);

    // 4. Reset permissions for all test users
    for (const email of PERMISSION_EMAILS) {
      await resetPermissionUser(api, email);
    }

    // 5. Purge all entities to get a clean state
    await purgeAllEntities(api);

    console.log('API state reset complete.\n');
  } catch (error) {
    console.error('Failed to reset API state:', error);
    console.error(
      'Make sure the Laravel backend is running and seeded.\n' +
        'Run: php artisan migrate:fresh --seed && php artisan db:seed --class=RandomDataSeeder'
    );
    throw error;
  }
}

export default globalSetup;
