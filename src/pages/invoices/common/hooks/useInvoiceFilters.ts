/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectOption } from 'components/datatables/Actions';
import { useTranslation } from 'react-i18next';

export function useInvoiceFilters() {
  const [t] = useTranslation();

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      label: t('paid'),
      value: 'paid',
      color: 'white',
      backgroundColor: '#22C55E',
    },
    {
      label: t('unpaid'),
      value: 'unpaid',
      color: 'white',
      backgroundColor: '#F97316',
    },
    {
      label: t('overdue'),
      value: 'overdue',
      color: 'white',
      backgroundColor: '#CA8A04',
    },
  ];

  return filters;
}
