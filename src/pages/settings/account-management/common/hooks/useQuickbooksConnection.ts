/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Quickbooks } from '$app/common/interfaces/quickbooks';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';

export function useQuickbooksConnection() {
  const company = useCurrentCompany();

  const quickbooks: Quickbooks | undefined = company?.quickbooks;

  const isConnected = Boolean(
    quickbooks?.accessTokenKey ||
      (quickbooks?.refresh_token && quickbooks.refresh_token.length > 0) ||
      (quickbooks?.realmID && quickbooks.realmID.length > 0)
  );

  return { quickbooks, isConnected };
}
