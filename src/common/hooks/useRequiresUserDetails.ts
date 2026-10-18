/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isHosted } from '../helpers';
import { useCurrentUser } from './useCurrentUser';

export function useRequiresUserDetails() {
  const user = useCurrentUser();

  if (!isHosted() || !user?.id) {
    return false;
  }

  return !user.first_name || !user.last_name;
}
