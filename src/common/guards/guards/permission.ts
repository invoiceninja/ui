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
import { Guard } from '../Guard';

export function permission(permission: Permissions): Guard {
  const [action] = permission.split('_');

  return ({ companyUser }) => {
    const permissions = companyUser?.permissions ?? '';

    const value = Boolean(
      companyUser?.is_admin ||
        companyUser?.is_owner ||
        permissions.includes(permission) ||
        permissions.includes(action)
    );

    return new Promise((resolve) => resolve(value));
  };
}
