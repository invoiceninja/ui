/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceItem } from 'common/interfaces/invoice-item';
import { aliases } from 'common/stores/slices/invoices/constants/product-aliases';
import { resolveKey } from './resolve-key';

export function resolveProperty(property: string) {
  const { property: _property } = resolveKey(property);

  return (
    (aliases[_property] as keyof InvoiceItem) ||
    (_property as keyof InvoiceItem)
  );
}
