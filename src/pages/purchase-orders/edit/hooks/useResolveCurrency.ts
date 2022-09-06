/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useVendorResolver } from 'common/hooks/vendors/useVendorResolver';
import { useResolveCurrency as useResolveCurrencyHook } from 'common/hooks/useResolveCurrency';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';

export function useResolveCurrency() {
  const vendorResolver = useVendorResolver();
  const currencyResolver = useResolveCurrencyHook();
  const company = useCurrentCompany();

  return async (vendorId: string) => {
    const vendor = await vendorResolver.find(vendorId);

    const currency = currencyResolver(
      vendor.currency_id || company.settings.currency_id
    );

    return currency;
  };
}
