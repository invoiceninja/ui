/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAllInvoiceColumns } from './useAllInvoiceColumns';

export function useDefaultInvoiceColumns() {
  const invoiceColumns = useAllInvoiceColumns();

  type InvoiceColumns = typeof invoiceColumns[number];

  const defaultColumns: InvoiceColumns[] = [
    'status',
    'number',
    'client',
    'amount',
    'balance',
    'date',
    'due_date',
  ];

  return defaultColumns;
}
