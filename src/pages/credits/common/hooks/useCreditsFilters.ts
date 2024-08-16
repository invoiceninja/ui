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

export function useCreditsFilters() {
  const [t] = useTranslation();

  const statusThemeColors = useStatusThemeColorScheme();

  const filters: SelectOption[] = [
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
      backgroundColor: statusThemeColors.$1 || '#93C5FD',
    },
    {
      label: t('partial'),
      value: 'partial',
      color: 'white',
      backgroundColor: statusThemeColors.$2 || '#1D4ED8',
    },
    {
      label: t('applied'),
      value: 'applied',
      color: 'white',
      backgroundColor: statusThemeColors.$3 || '#22C55E',
    },
  ];

  return filters;
}
