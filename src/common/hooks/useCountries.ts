/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Country } from 'common/interfaces/country';
import { useStaticsQuery } from 'common/queries/statics';
import { useEffect, useState } from 'react';

export function useCountries(): Country[] {
  const { data: statics } = useStaticsQuery();
  const [countries, setCountries] = useState<Country[]>([]);

  useEffect(() => {
    if (statics?.data?.countries) {
      setCountries(statics.data.countries);
    }
  }, [statics]);

  return countries;
}
