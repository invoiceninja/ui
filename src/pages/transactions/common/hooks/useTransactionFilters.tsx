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
import { useBankAccountsQuery } from '$app/pages/settings/bank-accounts/common/queries';
import { useStatusThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import { useTranslation } from 'react-i18next';

export function useTransactionFilters() {
  const [t] = useTranslation();

  const statusThemeColors = useStatusThemeColorScheme();

  const { data: bankIntegrations } = useBankAccountsQuery({ perPage: 1000 });

  const filters: SelectOption[] = [
    {
      label: t('unmatched'),
      value: 'unmatched',
      color: 'white',
      backgroundColor: statusThemeColors.$1 || '#6B7280',
      dropdownKey: '0',
    },
    {
      label: t('matched'),
      value: 'matched',
      color: 'white',
      backgroundColor: statusThemeColors.$2 || '#1D4ED8',
      dropdownKey: '0',
    },
    {
      label: t('converted'),
      value: 'converted',
      color: 'white',
      backgroundColor: statusThemeColors.$3 || '#22C55E',
      dropdownKey: '0',
    },
    {
      label: t('deposits'),
      value: 'deposits',
      color: 'white',
      backgroundColor: statusThemeColors.$4 || '#e6b05c',
      dropdownKey: '0',
    },
    {
      label: t('withdrawals'),
      value: 'withdrawals',
      color: 'white',
      backgroundColor: statusThemeColors.$5 || '#93C5FD',
      dropdownKey: '0',
    },
  ];

  bankIntegrations?.forEach((bankIntegration) => {
    filters.push({
      label: bankIntegration.bank_account_name,
      value: bankIntegration.id,
      color: 'white',
      backgroundColor: '#6B7280',
      queryKey: 'bank_integration_ids',
      dropdownKey: '1',
      placeHolder: 'bank_account',
    });
  });

  return filters;
}
