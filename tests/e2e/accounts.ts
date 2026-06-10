/**
 * Account lanes for Playwright parallelism.
 *
 * The API server hosts several isolated seed accounts. Tests keep using the
 * familiar base emails (user@example.com, clients@example.com, ...), and this
 * module maps those identities to the lane assigned to the current test.
 */

export interface TestAccount {
  id: number;
  suffix: string;
  ownerEmail: string;
  password: string;
  apiUrl: string;
}

const DEFAULT_ACCOUNT_COUNT = 8;
const DEFAULT_OWNER_EMAIL = 'user@example.com';
const DEFAULT_PASSWORD = 'password';

const ACCOUNT_COUNT = parsePositiveInt(
  process.env.PLAYWRIGHT_ACCOUNT_COUNT ||
    process.env.E2E_ACCOUNT_COUNT ||
    String(DEFAULT_ACCOUNT_COUNT)
);
const ACCOUNT_OFFSET = parseNonNegativeInt(
  process.env.PLAYWRIGHT_ACCOUNT_OFFSET || '0'
);

export const permissionBaseEmails = [
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
] as const;

const accountBaseLocalParts = new Set([
  'user',
  ...permissionBaseEmails.map((email) => email.split('@')[0]),
]);

let currentAccount: TestAccount | undefined;

export function getConfiguredTestAccounts(apiUrl = requireApiUrl()) {
  return Array.from({ length: ACCOUNT_COUNT }, (_, index) =>
    createTestAccount(index + 1, apiUrl)
  );
}

export function createTestAccount(
  id: number,
  apiUrl = requireApiUrl()
): TestAccount {
  const ownerEmail =
    process.env[`PLAYWRIGHT_ACCOUNT_${id}_EMAIL`] ||
    accountEmail(process.env.PLAYWRIGHT_OWNER_EMAIL || DEFAULT_OWNER_EMAIL, id);

  return {
    id,
    suffix: String(id),
    ownerEmail,
    password:
      process.env[`PLAYWRIGHT_ACCOUNT_${id}_PASSWORD`] ||
      process.env.PLAYWRIGHT_ACCOUNT_PASSWORD ||
      DEFAULT_PASSWORD,
    apiUrl,
  };
}

export function accountForParallelIndex(parallelIndex: number) {
  const accounts = getConfiguredTestAccounts();
  const accountIndex = ACCOUNT_OFFSET + parallelIndex;

  if (accountIndex >= accounts.length) {
    throw new Error(
      'Playwright worker parallelIndex ' +
        parallelIndex +
        ' with account offset ' +
        ACCOUNT_OFFSET +
        ' needs account lane ' +
        (accountIndex + 1) +
        ', but only ' +
        accounts.length +
        ' account lanes are configured. Lower PLAYWRIGHT_WORKERS/PLAYWRIGHT_SPEC_CONCURRENCY or increase PLAYWRIGHT_ACCOUNT_COUNT.'
    );
  }

  return accounts[accountIndex];
}

export function getAccountOffset() {
  return ACCOUNT_OFFSET;
}

export function setCurrentTestAccount(account: TestAccount) {
  currentAccount = account;
}

export function clearCurrentTestAccount() {
  currentAccount = undefined;
}

export function getCurrentTestAccount() {
  return currentAccount;
}

export function emailForCurrentAccount(email: string) {
  if (!currentAccount) {
    return email;
  }

  return accountEmail(email, currentAccount);
}

export function passwordForCurrentAccount(password = DEFAULT_PASSWORD) {
  if (!currentAccount || password !== DEFAULT_PASSWORD) {
    return password;
  }

  return currentAccount.password;
}

export function accountEmail(email: string, account: TestAccount | number) {
  const accountId = typeof account === 'number' ? account : account.id;
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain || !accountBaseLocalParts.has(localPart)) {
    return email;
  }

  return `${localPart}${accountId}@${domain}`;
}

export function baseEmailForAccount(email: string) {
  const [localPart, domain] = email.split('@');

  if (!localPart || !domain) {
    return email;
  }

  const baseLocalPart = localPart.replace(/\d+$/, '');

  if (!accountBaseLocalParts.has(baseLocalPart)) {
    return email;
  }

  return `${baseLocalPart}@${domain}`;
}

function requireApiUrl() {
  const apiUrl = process.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error('VITE_API_URL must be set for Playwright account lanes');
  }

  return apiUrl;
}

function parsePositiveInt(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_ACCOUNT_COUNT;
  }

  return parsed;
}

function parseNonNegativeInt(value: string) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}
