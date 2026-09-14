/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isSelfHosted } from '$app/common/helpers';
import { isAccountPlanExpired } from '$app/common/helpers/account-plan';
import { useAdmin } from './permissions/useHasPermission';
import { useCurrentAccount } from './useCurrentAccount';

export function useUnlockButtonForSelfHosted() {
  const account = useCurrentAccount();
  const { isAdmin, isOwner } = useAdmin();

  return (
    isSelfHosted() &&
    (isAccountPlanExpired(account?.plan, account?.plan_expires) ||
      !account?.plan) &&
    (isAdmin || isOwner)
  );
}
