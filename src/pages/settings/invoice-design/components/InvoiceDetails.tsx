/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { SortableVariableList } from './SortableVariableList';

export function InvoiceDetails() {
  const [t] = useTranslation();

  const defaultVariables = [
    { value: '$invoice.number', label: t('invoice_number') },
    { value: '$invoice.po_number', label: t('po_number') },
    { value: '$invoice.date', label: t('invoice_date') },
    { value: '$invoice.due_date', label: t('invoice_due_date') },
    { value: '$invoice.amount', label: t('invoice_amount') },
    { value: '$invoice.balance', label: t('invoice_balance') },
    { value: '$invoice.balance_due', label: t('balance_due') },
    { value: '$invoice.custom1', label: t('custom1') },
    { value: '$invoice.custom2', label: t('custom2') },
    { value: '$invoice.custom3', label: t('custom3') },
    { value: '$invoice.custom4', label: t('custom4') },
    { value: '$invoice.project', label: t('project') },
    { value: '$client.balance', label: t('client_balance') },
  ];

  return (
    <SortableVariableList
      for="invoice_details"
      defaultVariables={defaultVariables}
    />
  );
}
