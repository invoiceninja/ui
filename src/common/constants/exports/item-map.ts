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

export const itemMap: Record[] = [
  { trans: 'quantity', value: 'item.quantity', map: '' },
  { trans: 'discount', value: 'item.discount', map: '' },
  { trans: 'cost', value: 'item.cost', map: '' },
  { trans: 'product_key', value: 'item.product_key', map: '' },
  { trans: 'notes', value: 'item.notes', map: '' },
  { trans: 'custom_value1', value: 'item.custom_value1', map: '' },
  { trans: 'custom_value2', value: 'item.custom_value2', map: '' },
  { trans: 'custom_value3', value: 'item.custom_value3', map: '' },
  { trans: 'custom_value4', value: 'item.custom_value4', map: '' },
  { trans: 'item_tax1', value: 'item.tax_name1', map: '' },
  { trans: 'item_tax_rate1', value: 'item.tax_rate1', map: '' },
  { trans: 'item_tax2', value: 'item.tax_name2', map: '' },
  { trans: 'item_tax_rate2', value: 'item.tax_rate2', map: '' },
  { trans: 'item_tax3', value: 'item.tax_name3', map: '' },
  { trans: 'item_tax_rate3', value: 'item.tax_rate3', map: '' },
  { trans: 'type', value: 'item.type_id', map: '' },
  { trans: 'tax_category', value: 'item.tax_id', map: '' },
  { trans: 'tax_amount', value: 'item.tax_amount', map: '' },
];
