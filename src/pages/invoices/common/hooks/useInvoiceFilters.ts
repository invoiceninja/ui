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

export function useInvoiceFilters() {
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
      label: t('paid'),
      value: 'paid',
      color: 'white',
      backgroundColor: statusThemeColors.$3 || '#22C55E',
    },
    {
      label: t('unpaid'),
      value: 'unpaid',
      color: 'white',
      backgroundColor: '#F97316',
    },
    {
      label: t('past_due'),
      value: 'overdue',
      color: 'white',
      backgroundColor: statusThemeColors.$5 || '#CA8A04',
    },
    {
      label: t('cancelled'),
      value: 'cancelled',
      color: 'white',
      backgroundColor: '#000000',
    },
  ];

  return filters;
}
