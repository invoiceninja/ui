/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCountries } from './useCountries';

export function useResolveCountry() {
  const countries = useCountries();

  return (id: number | string) => {
    return countries.find((country) => country.id == id);
  };
}
