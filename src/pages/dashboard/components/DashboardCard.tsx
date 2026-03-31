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
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import { FIELDS_LABELS } from './DashboardCardSelector';
import { useColorScheme } from '$app/common/colors';
import { decodeDashboardField } from '$app/common/helpers/react-settings';
import { useQuery } from 'react-query';
import { useMemo } from 'react';

export const PERIOD_LABELS: Record<string, string> = {
  current: 'current_period',
  previous: 'previous_period',
  total: 'total',
};

interface Props {
  fieldKey: string;
  dateRange: string;
  startDate: string;
  endDate: string;
  currencyId: string;
  refreshKey: number;
  onSettled: () => void;
}

export function DashboardCard({
  fieldKey,
  dateRange,
  startDate,
  endDate,
  currencyId,
  refreshKey,
  onSettled,
}: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();

  const colors = useColorScheme();
  const field = useMemo(() => decodeDashboardField(fieldKey), [fieldKey]);

  const { data: value, isLoading } = useQuery({
    queryKey: [
      'dashboard_card',
      fieldKey,
      dateRange,
      startDate,
      endDate,
      currencyId,
      refreshKey,
    ],
    queryFn: () =>
      request('POST', endpoint('/api/v1/charts/calculated_fields'), {
        date_range: dateRange,
        start_date: startDate,
        end_date: endDate,
        field: field.field,
        calculation: field.calculate,
        period: field.period,
        format: field.format,
        currency_id: currencyId,
      }).then((response) => response.data),
    staleTime: Infinity,
    onSettled,
  });

  return (
    <Card
      className="flex h-full flex-col items-center justify-center gap-1 px-6 py-4 overflow-hidden shadow-sm"
      style={{ borderColor: colors.$24 }}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-1 min-w-0">
          <span className="w-full truncate text-center text-sm font-medium">
            {t(FIELDS_LABELS[field.field] ?? field.field)}
          </span>
          <span className="w-full truncate text-center text-xl font-semibold">
            {field.format === 'money' && field.calculate !== 'count'
              ? formatMoney(value ?? 0, '', '')
              : value}
          </span>
          <span className="w-full truncate text-center text-xs text-gray-500">
            {t(PERIOD_LABELS[field.period] ?? field.period)}
          </span>
        </div>
      )}
    </Card>
  );
}
