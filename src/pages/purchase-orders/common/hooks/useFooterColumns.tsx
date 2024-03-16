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
import { useAllPurchaseOrderColumns } from '../hooks';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';

export function useFooterColumns() {
  const [t] = useTranslation();

  const reactSettings = useReactSettings();
  const purchaseOrderColumns = useAllPurchaseOrderColumns();

  const sumTableColumn = useSumTableColumn({
    countryPath: 'vendor.country_id',
    currencyPath: 'vendor.currency_id',
  });

  type PurchaseOrderColumns = (typeof purchaseOrderColumns)[number];

  const columns: DataTableFooterColumnsExtended<
    PurchaseOrder,
    PurchaseOrderColumns
  > = [
    {
      column: 'amount',
      id: 'amount',
      label: t('amount'),
      format: (values, purchaseOrders) =>
        sumTableColumn(values as number[], purchaseOrders),
    },
  ];

  const currentColumns: string[] =
    reactSettings?.table_footer_columns?.purchaseOrder || [];

  return {
    footerColumns: columns.filter(({ id }) => currentColumns.includes(id)),
    allFooterColumns: columns,
  };
}
