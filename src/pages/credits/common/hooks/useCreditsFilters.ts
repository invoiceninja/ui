/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectOption } from '$app/components/datatables/Actions';
import { useTranslation } from 'react-i18next';

export function useCreditsFilters() {
  const [t] = useTranslation();

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      label: t('draft'),
      value: 'draft',
      color: 'white',
      backgroundColor: '#6B7280',
    },
    {
      label: t('sent'),
      value: 'sent',
      color: 'white',
      backgroundColor: '#93C5FD',
    },
    {
      label: t('partial'),
      value: 'partial',
      color: 'white',
      backgroundColor: '#1D4ED8',
    },
    {
      label: t('applied'),
      value: 'applied',
      color: 'white',
      backgroundColor: '#22C55E',
    },
  ];

  return filters;
}
