/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Currency } from 'common/interfaces/currency';
import { useStaticsQuery } from 'common/queries/statics';
import { useEffect, useState } from 'react';

export function useCurrencies(): Currency[] {
  const { data: statics } = useStaticsQuery();
  const [currencies, setCurrencies] = useState<Currency[]>([]);

  useEffect(() => {
    if (statics?.data?.currencies) {
      setCurrencies(statics.data.currencies);
    }
  }, [statics]);

  return currencies;
}
