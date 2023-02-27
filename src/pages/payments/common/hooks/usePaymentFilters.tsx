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

export function usePaymentFilters() {
  const [t] = useTranslation();

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      label: t('pending'),
      value: 'pending',
      color: 'white',
      backgroundColor: '#6B7280',
    },
    {
      label: t('cancelled'),
      value: 'cancelled',
      color: 'white',
      backgroundColor: '#93C5FD',
    },
    {
      label: t('failed'),
      value: 'failed',
      color: 'white',
      backgroundColor: '#DC2626',
    },
    {
      label: t('completed'),
      value: 'completed',
      color: 'white',
      backgroundColor: '#22C55E',
    },
    {
      label: t('partially_refunded'),
      value: 'partially_refunded',
      color: 'white',
      backgroundColor: '#1D4ED8',
    },
    {
      label: t('refunded'),
      value: 'refunded',
      color: 'white',
      backgroundColor: '#6B7280',
    },
  ];

  return filters;
}
