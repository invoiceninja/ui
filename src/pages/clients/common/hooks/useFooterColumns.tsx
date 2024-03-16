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
import { useAllClientColumns } from './useClientColumns';
import { Client } from '$app/common/interfaces/client';

export function useFooterColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();

  const sumTableColumn = useSumTableColumn();
  const clientColumns = useAllClientColumns();

  type ClientColumns = (typeof clientColumns)[number];

  const columns: DataTableFooterColumnsExtended<Client, ClientColumns> = [
    {
      column: 'balance',
      id: 'balance',
      label: t('balance'),
      format: (values, clients) => sumTableColumn(values as number[], clients),
    },
  ];

  const currentColumns: string[] =
    reactSettings?.table_footer_columns?.client || [];

  return {
    footerColumns: columns.filter(({ id }) => currentColumns.includes(id)),
    allFooterColumns: columns,
  };
}
