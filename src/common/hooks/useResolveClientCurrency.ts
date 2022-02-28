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

export function useResolveClientCurrency() {
  const currencies = useCurrencies();

  return (client: Client) => {
    // This is right place to adjust if we want client currency
    // Or company-level currency

    return currencies.find(
      (currency) => currency.id == client?.settings?.currency_id
    );
  };
}
