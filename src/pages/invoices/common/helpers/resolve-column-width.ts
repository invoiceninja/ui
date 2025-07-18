/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { resolveProperty } from './resolve-property';

export function resolveColumnWidth(column: string) {
  const property = resolveProperty(column);

  const mappings: Record<string, string> = {
    product_key: '15%',
    notes: '30%',
    cost: '10%',
    quantity: '10%',
    line_total: '5%',
    discount: '10%',
    tax_rate1: '12%',
    tax_rate2: '12%',
    tax_rate3: '12%',
    tax_amount: '5%',
    gross_line_total: '10%',
    product1: '10%',
    product2: '10%',
    product3: '10%',
    product4: '10%',
    task1: '10%',
    task2: '10%',
    task3: '10%',
    task4: '10%',
  };

  return mappings[property] || '';
}
