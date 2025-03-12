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

export function usePaymentFilters() {
  const [t] = useTranslation();

  const statusThemeColors = useStatusThemeColorScheme();

  const filters: SelectOption[] = [
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
      backgroundColor: statusThemeColors.$4 || '#93C5FD',
    },
    {
      label: t('failed'),
      value: 'failed',
      color: 'white',
      backgroundColor: statusThemeColors.$5 || '#DC2626',
    },
    {
      label: t('completed'),
      value: 'completed',
      color: 'white',
      backgroundColor: statusThemeColors.$3 || '#22C55E',
    },
    {
      label: t('partially_refunded'),
      value: 'partially_refunded',
      color: 'white',
      backgroundColor: statusThemeColors.$2 || '#1D4ED8',
    },
    {
      label: t('refunded'),
      value: 'refunded',
      color: 'white',
      backgroundColor: '#6B7280',
    },
    {
      label: t('partially_unapplied'),
      value: 'partially_unapplied',
      color: 'white',
      backgroundColor: '#bf83cc',
    },
  ];

  return filters;
}
