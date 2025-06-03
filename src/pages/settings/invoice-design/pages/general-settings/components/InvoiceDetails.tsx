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
import { Invoice } from '$app/components/icons/Invoice';

export default function InvoiceDetails() {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const customField = useCustomField();

  const defaultVariables = [
    { value: '$invoice.number', label: t('invoice_number') },
    { value: '$invoice.po_number', label: t('po_number') },
    { value: '$invoice.date', label: t('invoice_date') },
    { value: '$invoice.due_date', label: t('invoice_due_date') },
    { value: '$invoice.amount', label: t('invoice_amount') },
    { value: '$invoice.balance', label: t('invoice_balance') },
    { value: '$invoice.balance_due', label: t('balance_due') },
    {
      value: '$invoice.custom1',
      label: customField('invoice1').label() || t('custom1'),
    },
    {
      value: '$invoice.custom2',
      label: customField('invoice2').label() || t('custom2'),
    },
    {
      value: '$invoice.custom3',
      label: customField('invoice3').label() || t('custom3'),
    },
    {
      value: '$invoice.custom4',
      label: customField('invoice4').label() || t('custom4'),
    },
    { value: '$invoice.project', label: t('project') },
    { value: '$client.balance', label: t('client_balance') },
    { value: '$invoice.total', label: t('invoice_total') },
  ];

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <div>
            <Invoice color="#2176FF" size="1.3rem" />
          </div>

          <span>{t('invoice_details')}</span>
        </div>
      }
      padding="small"
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <SortableVariableList
        for="invoice_details"
        defaultVariables={defaultVariables}
      />
    </Card>
  );
}
