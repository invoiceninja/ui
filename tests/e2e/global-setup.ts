/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * Playwright global setup — resets API state before the test suite runs.
 * This ensures a clean starting state regardless of how previous runs ended.
 */

import { config } from 'dotenv';
import { getConfiguredTestAccounts } from './accounts';
import { resetTestAccount } from './account-reset';

config({ path: '.env.testing', override: true });
config();

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
    const accounts = getConfiguredTestAccounts(apiUrl);
    await Promise.all(
      accounts.map((account) => resetTestAccount(account, 'suite setup'))
    );

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
