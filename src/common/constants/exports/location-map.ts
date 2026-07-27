/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Record } from './client-map';

export const locationMap: Record[] = [
  { trans: 'name', value: 'location.name', map: 'location' },
  { trans: 'address1', value: 'location.address1', map: 'location' },
  { trans: 'address2', value: 'location.address2', map: 'location' },
  { trans: 'city', value: 'location.city', map: 'location' },
  { trans: 'state', value: 'location.state', map: 'location' },
  { trans: 'postal_code', value: 'location.postal_code', map: 'location' },
  { trans: 'country', value: 'location.country_id', map: 'location' },
  { trans: 'custom_value1', value: 'location.custom_value1', map: 'location' },
  { trans: 'custom_value2', value: 'location.custom_value2', map: 'location' },
  { trans: 'custom_value3', value: 'location.custom_value3', map: 'location' },
  { trans: 'custom_value4', value: 'location.custom_value4', map: 'location' },
  {
    trans: 'is_shipping',
    value: 'location.is_shipping_location',
    map: 'location',
  },
];
