/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  Permissions,
  useHasPermission,
} from 'common/hooks/permissions/useHasPermission';

export function permission(permission: Permissions) {
  const hasPermission = useHasPermission();
  const [action] = permission.split('_'); // 'create_invoice' => 'create'

  return (
    hasPermission(permission) ||
    hasPermission(`${action}_all` as unknown as Permissions)
  );
}
