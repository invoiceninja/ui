/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from '$app/common/interfaces/invoice';
import { useAllInvoiceColumns } from './useInvoiceColumns';

export type DataTableFooterColumnsExtended<
  TResource = any,
  TColumn = string
> = {
  column: TColumn;
  id: keyof TResource;
  format?: (field: (string | number)[], resource: TResource[]) => unknown;
}[];

export function useFooterColumns() {
  const invoiceColumns = useAllInvoiceColumns();

  type InvoiceColumns = (typeof invoiceColumns)[number];

  const columns: DataTableFooterColumnsExtended<Invoice, InvoiceColumns> = [
    {
      column: 'amount',
      id: 'amount',
      format: (values, invoices) => <span>amount</span>,
    },
    {
      column: 'balance',
      id: 'balance',
      format: (values, invoices) => <span>amount</span>,
    },
  ];

  return columns;
}
