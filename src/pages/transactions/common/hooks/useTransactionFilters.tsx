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
import { useStatusThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import { useTranslation } from 'react-i18next';

export function useTransactionFilters() {
  const [t] = useTranslation();

  const statusThemeColors = useStatusThemeColorScheme();

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
      backgroundColor: statusThemeColors.$1 || '#6B7280',
    },
    {
      label: t('matched'),
      value: 'matched',
      color: 'white',
      backgroundColor: statusThemeColors.$2 || '#1D4ED8',
    },
    {
      label: t('converted'),
      value: 'converted',
      color: 'white',
      backgroundColor: statusThemeColors.$3 || '#22C55E',
    },
    {
      label: t('deposits'),
      value: 'deposits',
      color: 'white',
      backgroundColor: statusThemeColors.$4 || '#e6b05c',
    },
    {
      label: t('withdrawals'),
      value: 'withdrawals',
      color: 'white',
      backgroundColor: statusThemeColors.$5 || '#93C5FD',
    },
  ];

  return filters;
}
