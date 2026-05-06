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
      label: t('active'),
      value: 'active',
      color: 'white',
      backgroundColor: '#22C55E',
      dropdownKey: '0',
      queryKey: 'status',
    },
    {
      label: t('draft'),
      value: 'draft',
      color: 'white',
      backgroundColor: '#6B7280',
      dropdownKey: '0',
      queryKey: 'status',
    },
    {
      label: t('sent'),
      value: 'sent',
      color: 'white',
      backgroundColor: '#93C5FD',
      dropdownKey: '0',
      queryKey: 'status',
    },
    {
      label: t('pending_approval'),
      value: 'pending_approval',
      color: 'white',
      backgroundColor: '#FBBF24',
      dropdownKey: '0',
      queryKey: 'status',
    },
    {
      label: t('completed'),
      value: 'completed',
      color: 'white',
      backgroundColor: '#1D4ED8',
      dropdownKey: '0',
      queryKey: 'status',
    },
    {
      label: t('approved'),
      value: 'approved',
      color: 'white',
      backgroundColor: '#3B82F6',
      dropdownKey: '0',
      queryKey: 'status',
    },
    {
      label: t('voided'),
      value: 'voided',
      color: 'white',
      backgroundColor: '#EF4444',
      dropdownKey: '0',
      queryKey: 'status',
    },
    {
      label: t('expired'),
      value: 'expired',
      color: 'white',
      backgroundColor: '#9CA3AF',
      dropdownKey: '0',
      queryKey: 'status',
    },
    {
      label: t('rejected'),
      value: 'rejected',
      color: 'white',
      backgroundColor: '#DC2626',
      dropdownKey: '0',
      queryKey: 'status',
    },
    {
      label: t('archived'),
      value: 'archived',
      color: 'white',
      backgroundColor: '#F97316',
      dropdownKey: '0',
      queryKey: 'status',
    },
    {
      label: t('deleted'),
      value: 'deleted',
      color: 'white',
      backgroundColor: '#991B1B',
      dropdownKey: '0',
      queryKey: 'status',
    },
  ];

  return filters;
}
