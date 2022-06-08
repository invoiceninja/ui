/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Permissions } from 'common/hooks/permissions/useHasPermission';
import { store } from 'common/stores/store';

export function permission(permission: Permissions) {
  const state = store.getState();
  const user = state.companyUsers.api[state.companyUsers.currentIndex];

  const permissions = user?.permissions ?? '';
  const [action] = permission.split('_');

  return (
    user?.is_admin ||
    user?.is_owner ||
    permissions.includes(permission) ||
    permission.includes(action)
  );
}
