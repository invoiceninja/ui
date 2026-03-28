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
import { DashboardCardField } from '$app/common/interfaces/company-user';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { Spinner } from '$app/components/Spinner';
import { Card as ShadcnCard } from '$app/components/cards';
import { FIELDS_LABELS } from './DashboardCardSelector';

export const PERIOD_LABELS: Record<string, string> = {
  current: 'current_period',
  previous: 'previous_period',
  total: 'total',
};

interface Props {
  field: DashboardCardField;
  dateRange: string;
  startDate: string;
  endDate: string;
  currencyId: string;
}

export function DashboardCard({
  field,
  dateRange,
  startDate,
  endDate,
  currencyId,
}: Props) {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const formatMoney = useFormatMoney();

  const [isBusy, setIsBusy] = useState(false);
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
  }, [field, dateRange, startDate, endDate, currencyId]);

  const displayValue =
    field.format === 'money' && field.calculate !== 'count'
      ? formatMoney(value ?? 0, '', '')
      : value;

  return (
    <ShadcnCard className="flex h-full flex-col items-center justify-center gap-1 px-6 py-6">
      {isBusy ? (
        <Spinner />
      ) : (
        <>
          <span className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            {t(FIELDS_LABELS[field.field] ?? field.field)}
          </span>
          <span className="text-xl font-semibold">{displayValue}</span>
          <span className="text-xs text-gray-500">
            {t(PERIOD_LABELS[field.period] ?? field.period)}
          </span>
        </>
      )}
    </ShadcnCard>
  );
}
