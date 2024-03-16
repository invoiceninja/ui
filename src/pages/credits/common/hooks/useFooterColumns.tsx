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
import { useAllCreditColumns } from '../hooks';
import { DataTableFooterColumnsExtended } from '$app/pages/invoices/common/hooks/useFooterColumns';
import { Credit } from '$app/common/interfaces/credit';

export function useFooterColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();
  const creditColumns = useAllCreditColumns();

  const sumTableColumn = useSumTableColumn();

  type CreditColumns = (typeof creditColumns)[number];

  const columns: DataTableFooterColumnsExtended<Credit, CreditColumns> = [
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (values, credits) => sumTableColumn(values as number[], credits),
    },
    {
      column: 'remaining',
      id: 'balance',
      label: t('remaining'),
      format: (values, credits) => sumTableColumn(values as number[], credits),
    },
  ];

  const currentColumns: string[] =
    reactSettings?.table_footer_columns?.credit || [];

  return {
    footerColumns: columns.filter(({ id }) => currentColumns.includes(id)),
    allFooterColumns: columns,
  };
}
