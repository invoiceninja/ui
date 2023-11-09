/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useResolveCountry } from './useResolveCountry';

export function useCalculateTaxesRegion() {
  /**
   * Supported tax regions
   */
  const supportedCountries: string[] = [
    'AU', // Australia
    'US', // United States
    'AT', // Austria
    'BE', // Belgium
    'BG', // Bulgaria
    'CY', // Cyprus
    'CZ', // Czech Republic
    'DE', // Germany
    'DK', // Denmark
    'EE', // Estonia
    'ES', // Spain
    'FI', // Finland
    'FR', // France
    'GR', // Greece
    'HR', // Croatia
    'HU', // Hungary
    'IE', // Ireland
    'IT', // Italy
    'LT', // Lithuania
    'LU', // Luxembourg
    'LV', // Latvia
    'MT', // Malta
    'NL', // Netherlands
    'PL', // Poland
    'PT', // Portugal
    'RO', // Romania
    'SE', // Sweden
    'SI', // Slovenia
    'SK', // Slovakia
  ];

  const resolveCountry = useResolveCountry();

  return (countryId: string | number) =>
    supportedCountries.includes(resolveCountry(countryId)?.iso_3166_2 || '');
}
