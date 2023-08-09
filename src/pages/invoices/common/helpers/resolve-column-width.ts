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
  };

  return mappings[property] || '';
}
