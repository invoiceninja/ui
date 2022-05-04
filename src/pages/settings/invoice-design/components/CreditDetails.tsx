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

export function CreditDetails() {
  const [t] = useTranslation();

  const defaultVariables = [
    { value: '$credit.number', label: t('credit_number') },
    { value: '$credit.po_number', label: t('po_number') },
    { value: '$credit.date', label: t('credit_date') },
    { value: '$credit.valid_until', label: t('valid_until') },
    { value: '$credit.total', label: t('credit_total') },
    { value: '$credit.custom1', label: t('custom1') },
    { value: '$credit.custom2', label: t('custom2') },
    { value: '$credit.custom3', label: t('custom3') },
    { value: '$credit.custom4', label: t('custom4') },
    { value: '$client.balance', label: t('client_balance') },
  ];

  return (
    <SortableVariableList
      for="credit_details"
      defaultVariables={defaultVariables}
    />
  );
}
