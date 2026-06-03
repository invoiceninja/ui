import {
  createApiContext,
  ensurePermissionUserExists,
  purgeAllEntities,
  purgeGroupSettings,
  purgeSchedules,
  resetCompanySettings,
  resetPermissionUser,
  restoreDeletedUsers,
} from './api-helpers';
import {
  accountEmail,
  permissionBaseEmails,
  type TestAccount,
} from './accounts';

export async function resetTestAccount(account: TestAccount, label?: string) {
  const suffix = label ? ` (${label})` : '';
  console.log(`  Reset account lane ${account.id}${suffix}: ${account.ownerEmail}`);

  const api = await createApiContext(
    account.apiUrl,
    account.ownerEmail,
    account.password
  );

  await resetCompanySettings(api);
  await purgeSchedules(api);
  await purgeGroupSettings(api);
  await restoreDeletedUsers(api);

  const permissionEmails = permissionBaseEmails.map((email) =>
    accountEmail(email, account)
  );

  for (const email of permissionEmails) {
    await ensurePermissionUserExists(api, email);
  }

  for (const email of permissionEmails) {
    await resetPermissionUser(api, email);
  }

  await purgeAllEntities(api);
}
