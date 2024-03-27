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
  ];

  const currentColumns: string[] =
    reactSettings?.table_footer_columns?.quote || [];

  return {
    footerColumns: columns.filter(({ id }) => currentColumns.includes(id)),
    allFooterColumns: columns,
  };
}
