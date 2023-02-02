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
import { GuardContext } from '../Guard';

export function permission(permission: Permissions) {
  const [action] = permission.split('_');

  return ({ companyUser }: GuardContext) => {
    const permissions = companyUser?.permissions ?? '';

    return Boolean(
      companyUser?.is_admin ||
        companyUser?.is_owner ||
        permissions.includes(permission) ||
        permissions.includes(`${action}_all`)
    );
  };
}
