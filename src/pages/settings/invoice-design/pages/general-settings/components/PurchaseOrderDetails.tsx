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
import { useCustomField } from '$app/components/CustomField';
import { useColorScheme } from '$app/common/colors';
import { FileClock } from '$app/components/icons/FileClock';

export default function PurchaseOrderDetails() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const customField = useCustomField();

  const defaultVariables = [
    { value: '$purchase_order.number', label: t('number') },
    { value: '$purchase_order.po_number', label: t('po_number') },
    { value: '$purchase_order.date', label: t('date') },
    { value: '$purchase_order.due_date', label: t('due_date') },
    { value: '$purchase_order.total', label: t('total') },
    {
      value: '$purchase_order.custom1',
      label: customField('invoice1').label() || t('custom1'),
    },
    {
      value: '$purchase_order.custom2',
      label: customField('invoice2').label() || t('custom2'),
    },
    {
      value: '$purchase_order.custom3',
      label: customField('invoice3').label() || t('custom3'),
    },
    {
      value: '$purchase_order.custom4',
      label: customField('invoice4').label() || t('custom4'),
    },
    { value: '$purchase_order.balance_due', label: t('balance_due') },
  ];

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <div>
            <FileClock color="#2176FF" size="1.3rem" />
          </div>

          <span>{t('purchase_order_details')}</span>
        </div>
      }
      padding="small"
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <SortableVariableList
        for="purchase_order_details"
        defaultVariables={defaultVariables}
      />
    </Card>
  );
}
