import {
  createApiContext,
  ensurePermissionUserExists,
  resetCompanySettings,
  restoreDeletedUsers,
} from './api-helpers';
import {
  accountEmail,
  permissionBaseEmails,
  type TestAccount,
} from './accounts';

export async function resetTestAccount(account: TestAccount, label?: string) {
  const suffix = label ? ` (${label})` : '';
  console.log(
    `  Reset account lane ${account.id}${suffix}: ${account.ownerEmail}`
  );

  const api = await createApiContext(
    account.apiUrl,
    account.ownerEmail,
    account.password
  );

  await resetCompanySettings(api);
  await restoreDeletedUsers(api);

  for (const email of permissionBaseEmails) {
    const scopedEmail = accountEmail(email, account);
    await ensurePermissionUserExists(api, scopedEmail);
  }
}
