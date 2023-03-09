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
import { useCurrentAccount } from './useCurrentAccount';

export function useUnlockButtonForSelfHosted() {
  const account = useCurrentAccount();

  const isPlanExpired = new Date(account?.plan_expires) < new Date();

  return isSelfHosted() && ((account?.plan && isPlanExpired) || !account?.plan);
}
