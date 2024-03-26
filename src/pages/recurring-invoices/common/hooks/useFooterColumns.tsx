/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useSumTableColumn } from '$app/common/hooks/useSumTableColumn';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { DataTableFooterColumnsExtended } from '$app/pages/invoices/common/hooks/useFooterColumns';
import { useAllRecurringInvoiceColumns } from '../hooks';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';

export function useFooterColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();

  const sumTableColumn = useSumTableColumn();
  const recurringInvoiceColumns = useAllRecurringInvoiceColumns();

  type RecurringInvoiceColumns = (typeof recurringInvoiceColumns)[number];

  const columns: DataTableFooterColumnsExtended<
    RecurringInvoice,
    RecurringInvoiceColumns
  > = [
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (values, recurringInvoices) =>
        sumTableColumn(values as number[], recurringInvoices),
    },
  ];

  const currentColumns: string[] =
    reactSettings?.table_footer_columns?.recurringInvoice || [];

  return {
    footerColumns: columns.filter(({ id }) => currentColumns.includes(id)),
    allFooterColumns: columns,
  };
}
