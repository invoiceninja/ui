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
import { useTranslation } from 'react-i18next';
import { useAllInvoiceColumns } from './useInvoiceColumns';
import { ReactNode } from 'react';
import { useSumTableColumn } from '$app/common/hooks/useSumTableColumn';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

export type DataTableFooterColumnsExtended<
  TResource = any,
  TColumn = string
> = {
  column: TColumn;
  id: keyof TResource;
  label: string;
  format: (
    field: (string | number)[],
    resource: TResource[]
  ) => ReactNode | string | number;
}[];

export function useFooterColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();

  const sumTableColumn = useSumTableColumn();
  const invoiceColumns = useAllInvoiceColumns();

  type InvoiceColumns = (typeof invoiceColumns)[number];

  const columns: DataTableFooterColumnsExtended<Invoice, InvoiceColumns> = [
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (values, invoices) =>
        sumTableColumn(values as number[], invoices),
    },
    {
      column: 'balance',
      id: 'balance',
      label: t('balance'),
      format: (values, invoices) =>
        sumTableColumn(values as number[], invoices),
    },
  ];

  const currentColumns: string[] =
    reactSettings?.table_footer_columns?.invoice || [];

  return {
    footerColumns: columns.filter(({ id }) => currentColumns.includes(id)),
    allFooterColumns: columns,
  };
}
