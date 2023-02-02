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

export function or(...permissions: Permissions[]) {
  return ({ companyUser }: GuardContext) => {
    const companyUserPermissions = companyUser?.permissions ?? '';
    const results: boolean[] = [];

    permissions.map((permission) =>
      results.push(companyUserPermissions.includes(permission))
    );

    return Boolean(
      companyUser?.is_admin ||
        companyUser?.is_owner ||
        results.filter((result) => result === true).length
    );
  };
}
