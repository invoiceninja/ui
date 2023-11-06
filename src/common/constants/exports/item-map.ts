/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Record {
  trans: string;
  value: string;
}

export const itemMap: Record[] = [
  { trans: 'quantity', value: 'item.quantity' },
  { trans: 'discount', value: 'item.discount' },
  { trans: 'cost', value: 'item.cost' },
  { trans: 'product_key', value: 'item.product_key' },
  { trans: 'notes', value: 'item.notes' },
  { trans: 'custom_value1', value: 'item.custom_value1' },
  { trans: 'custom_value2', value: 'item.custom_value2' },
  { trans: 'custom_value3', value: 'item.custom_value3' },
  { trans: 'custom_value4', value: 'item.custom_value4' },
  { trans: 'item_tax1', value: 'item.tax_name1' },
  { trans: 'item_tax_rate1', value: 'item.tax_rate1' },
  { trans: 'item_tax2', value: 'item.tax_name2' },
  { trans: 'item_tax_rate2', value: 'item.tax_rate2' },
  { trans: 'item_tax3', value: 'item.tax_name3' },
  { trans: 'item_tax_rate3', value: 'item.tax_rate3' },
  { trans: 'type', value: 'item.type_id' },
  { trans: 'tax_category', value: 'item.tax_id' },
  { trans: 'tax_amount', value: 'item.tax_amount' },
];
