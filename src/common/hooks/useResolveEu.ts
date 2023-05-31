/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { euCountries } from '../constants/eu-countries';
import { useCountries } from './useCountries';

export function useResolveEu() {
    const countries = useCountries();

    const eu_countries = euCountries;

    return (id: number | string) => {
        
        let country = countries.find((country) => country.id == id);
        
        return country && eu_countries[country.iso_3166_2] ? true : false;
    };
}
