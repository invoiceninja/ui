/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Client } from 'common/interfaces/client';
import { useCurrencies } from './useCurrencies';
import { useCurrentCompany } from './useCurrentCompany';

export function useResolveClientCurrency() {
  const currencies = useCurrencies();
  const company = useCurrentCompany();

  return (client: Client) => {
    const currencyId =
      client?.settings?.currency_id || company?.settings?.currency_id;

    return currencies.find((currency) => currency.id == currencyId);
  };
}
