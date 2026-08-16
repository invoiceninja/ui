/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Country } from '$app/common/interfaces/country';
import { useStaticsQuery } from '$app/common/queries/statics';

export function useCountryResolver() {
  const statics = useStaticsQuery();

  const find = (id: string) => {
    if (statics) {
      return Promise.resolve(
        statics.data?.countries.find((country: Country) => country.id === id)
      );
    }

    return Promise.resolve(undefined);
  };

  return { find };
}
