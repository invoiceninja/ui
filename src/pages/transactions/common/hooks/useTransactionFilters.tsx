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

export function useTransactionFilters() {
  const [t] = useTranslation();

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      label: t('unmatched'),
      value: 'unmatched',
      color: 'white',
      backgroundColor: '#6B7280',
    },
    {
      label: t('matched'),
      value: 'matched',
      color: 'white',
      backgroundColor: '#1D4ED8',
    },
    {
      label: t('converted'),
      value: 'converted',
      color: 'white',
      backgroundColor: '#22C55E',
    },
    {
      label: t('deposits'),
      value: 'deposits',
      color: 'white',
      backgroundColor: '#e6b05c',
    },
    {
      label: t('withdrawals'),
      value: 'withdrawals',
      color: 'white',
      backgroundColor: '#93C5FD',
    },
  ];

  return filters;
}
