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
import { SelectOption } from '$app/components/datatables/Actions';

export function useDocumentFilters() {
  const [t] = useTranslation();

  const filters: SelectOption[] = [
    {
      label: t('draft'),
      value: 'draft',
      color: 'white',
      backgroundColor: '#6B7280',
      queryKey: 'status',
    },
    {
      label: t('sent'),
      value: 'sent',
      color: 'white',
      backgroundColor: '#93C5FD',
      queryKey: 'status',
    },
    {
      label: t('pending_approval'),
      value: 'pending_approval',
      color: 'white',
      backgroundColor: '#FBBF24',
      queryKey: 'status',
    },
    {
      label: t('completed'),
      value: 'completed',
      color: 'white',
      backgroundColor: '#1D4ED8',
      queryKey: 'status',
    },
    {
      label: t('approved'),
      value: 'approved',
      color: 'white',
      backgroundColor: '#3B82F6',
      queryKey: 'status',
    },
    {
      label: t('voided'),
      value: 'voided',
      color: 'white',
      backgroundColor: '#EF4444',
      queryKey: 'status',
    },
    {
      label: t('expired'),
      value: 'expired',
      color: 'white',
      backgroundColor: '#9CA3AF',
      queryKey: 'status',
    },
    {
      label: t('rejected'),
      value: 'rejected',
      color: 'white',
      backgroundColor: '#DC2626',
      queryKey: 'status',
    },
  ];

  return filters;
}
