/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import { FIELDS_LABELS } from './DashboardCardSelector';
import { useColorScheme } from '$app/common/colors';
import { decodeDashboardField } from '$app/common/helpers/react-settings';

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
}

export function DashboardCard({
  fieldKey,
  dateRange,
  startDate,
  endDate,
  currencyId,
}: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const queryClient = useQueryClient();

  const formatMoney = useFormatMoney();

  const field = decodeDashboardField(fieldKey);

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [value, setValue] = useState<number | undefined>(undefined);

  useEffect(() => {
    (async () => {
      setIsBusy(true);
      try {
        const response = await queryClient.fetchQuery(
          [
            '/api/v1/charts/calculated_fields',
            dateRange,
            startDate,
            endDate,
            field.field,
            field.calculate,
            field.period,
            currencyId,
          ],
          () =>
            request('POST', endpoint('/api/v1/charts/calculated_fields'), {
              date_range: dateRange,
              start_date: startDate,
              end_date: endDate,
              field: field.field,
              calculation: field.calculate,
              period: field.period,
              format: field.format,
              currency_id: currencyId,
            }).then((r) => r.data),
          { staleTime: Infinity }
        );
        setValue(response);
      } finally {
        setIsBusy(false);
      }
    })();
  }, [fieldKey, dateRange, startDate, endDate, currencyId]);

  const displayValue =
    field.format === 'money' && field.calculate !== 'count'
      ? formatMoney(value ?? 0, '', '')
      : value;

  return (
    <Card
      className="flex h-full flex-col items-center justify-center gap-1 px-6 py-4 overflow-hidden shadow-sm"
      style={{ borderColor: colors.$24 }}
    >
      {isBusy ? (
        <Spinner />
      ) : (
        <div className="flex w-full flex-col items-center justify-center gap-1 min-w-0">
          <span className="w-full truncate text-center text-sm font-medium">
            {t(FIELDS_LABELS[field.field] ?? field.field)}
          </span>
          <span className="w-full truncate text-center text-xl font-semibold">
            {displayValue}
          </span>
          <span className="w-full truncate text-center text-xs text-gray-500">
            {t(PERIOD_LABELS[field.period] ?? field.period)}
          </span>
        </div>
      )}
    </Card>
  );
}
