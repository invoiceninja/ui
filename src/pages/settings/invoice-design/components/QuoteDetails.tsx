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
import { SortableVariableList } from './SortableVariableList';

export function QuoteDetails() {
  const [t] = useTranslation();

  const defaultVariables = [
    { value: '$quote.number', label: t('quote_number') },
    { value: '$quote.po_number', label: t('po_number') },
    { value: '$quote.po_number', label: t('po_number') },
    { value: '$quote.date', label: t('quote_date') },
    { value: '$quote.valid_until', label: t('valid_until') },
    { value: '$quote.total', label: t('quote_total') },
    { value: '$quote.custom1', label: t('custom1') },
    { value: '$quote.custom2', label: t('custom2') },
    { value: '$quote.custom3', label: t('custom3') },
    { value: '$quote.custom4', label: t('custom4') },
    { value: '$client.balance', label: t('client_balance') },
  ];

  return (
    <SortableVariableList
      for="quote_details"
      defaultVariables={defaultVariables}
    />
  );
}
