/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * Playwright global setup — resets API state before the test suite runs.
 * This ensures a clean starting state regardless of how previous runs ended.
 */

import { config } from 'dotenv';
import { getAccountOffset, getConfiguredTestAccounts } from './accounts';
import { resetTestAccount } from './account-reset';

config({ path: '.env.testing', override: true });
config();

async function globalSetup() {
  if (process.env.PLAYWRIGHT_SKIP_GLOBAL_SETUP === '1') {
    console.log('\nSkipping API state reset before test suite.\n');
    return;
  }

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
    const scopedAccountCount = optionalPositiveInt(
      process.env.PLAYWRIGHT_GLOBAL_SETUP_ACCOUNT_COUNT
    );
    const accountsToReset = scopedAccountCount
      ? accounts.slice(
          getAccountOffset(),
          getAccountOffset() + scopedAccountCount
        )
      : accounts;

    if (accountsToReset.length === 0) {
      throw new Error(
        'No account lanes selected for Playwright global setup. Check PLAYWRIGHT_ACCOUNT_OFFSET and PLAYWRIGHT_GLOBAL_SETUP_ACCOUNT_COUNT.'
      );
    }

    await Promise.all(
      accountsToReset.map((account) => resetTestAccount(account, 'suite setup'))
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

function optionalPositiveInt(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
