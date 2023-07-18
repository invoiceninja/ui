/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { SortableVariableList } from './SortableVariableList';

export function PurchaseOrderDetails() {
  const [t] = useTranslation();

  const defaultVariables = [
    { value: '$purchase_order.number', label: t('number') },
    { value: '$purchase_order.po_number', label: t('po_number') },
    { value: '$purchase_order.date', label: t('date') },
    { value: '$purchase_order.due_date', label: t('due_date') },
    { value: '$purchase_order.total', label: t('total') },
    { value: '$purchase_order.custom1', label: t('custom1') },
    { value: '$purchase_order.custom2', label: t('custom2') },
    { value: '$purchase_order.custom3', label: t('custom3') },
    { value: '$purchase_order.custom4', label: t('custom4') },
    { value: '$purchase_order.balance_due', label: t('balance_due') },
  ];

  return (
    <Card title={t('purchase_order_details')} padding="small" collapsed={true}>
      <SortableVariableList
        for="purchase_order_details"
        defaultVariables={defaultVariables}
      />
    </Card>
  );
}
