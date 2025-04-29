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
    product_key: '13rem',
    notes: '30rem',
    cost: '13rem',
    quantity: '13rem',
    line_total: '8rem',
    discount: '13rem',
    tax_rate1: '13rem',
    tax_rate2: '13rem',
    tax_rate3: '13rem',
    tax_amount: '13rem',
    gross_line_total: '8rem',
    product1: '13rem',
    product2: '13rem',
    product3: '13rem',
    product4: '13rem',
    task1: '13rem',
    task2: '13rem',
    task3: '13rem',
    task4: '13rem',
  };

  return mappings[property] || '';
}
