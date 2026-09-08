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
import { useAllQuoteColumns } from '../hooks';
import { Quote } from '$app/common/interfaces/quote';
import { DataTableFooterColumnsExtended } from '$app/pages/invoices/common/hooks/useFooterColumns';
import { calculateNetAmount } from '$app/common/helpers/invoices/net-amount';

export function useFooterColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();
  const quoteColumns = useAllQuoteColumns();

  const sumTableColumn = useSumTableColumn();

  type QuoteColumns = (typeof quoteColumns)[number];

  const columns: DataTableFooterColumnsExtended<Quote, QuoteColumns> = [
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (values, quotes) => sumTableColumn(values as number[], quotes),
    },
    {
      column: 'net_amount',
      id: 'amount',
      label: t('net_amount'),
      format: (values, quotes) =>
        sumTableColumn(quotes.map(calculateNetAmount), quotes),
    },
  ];

  const currentColumns: string[] =
    reactSettings?.table_footer_columns?.quote || [];

  return {
    footerColumns: columns.filter(({ column }) =>
      currentColumns.includes(column)
    ),
    allFooterColumns: columns,
  };
}
