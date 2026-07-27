/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { date as formatDate } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import {
  ProjectBurnupBucketType,
  ProjectBurnupMetricKey,
  ProjectBurnupSeriesRow,
} from '$app/common/interfaces/project-burnup';
import { useTranslation } from 'react-i18next';
import { ProjectBurnupMetricDefinition } from './metrics';

interface PayloadItem {
  color: string;
  dataKey: ProjectBurnupMetricKey;
  name: string;
  value: number;
  payload: ProjectBurnupSeriesRow;
}

interface Props {
  bucketType: ProjectBurnupBucketType;
  metricsByKey: Record<string, ProjectBurnupMetricDefinition>;
  countryId: string | undefined;
  currencyId: string | undefined;
  active?: boolean;
  payload?: PayloadItem[];
}

export function BurnupTooltip({
  bucketType,
  metricsByKey,
  countryId,
  currencyId,
  active,
  payload,
}: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const formatMoney = useFormatMoney();
  const { dateFormat } = useCurrentCompanyDateFormats();

  if (!active || !payload || !payload.length) {
    return null;
  }

  const row = payload[0].payload;
  const isRangeBucket = bucketType !== 'daily';

  const formatHours = (value: number | string) => {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const formatMoneyValue = (value: number | string) => {
    return formatMoney(Number(value) || 0, countryId, currencyId).toString();
  };

  const formatMetricValue = (
    metric: ProjectBurnupMetricDefinition | undefined,
    value: number | string
  ) => {
    if (metric?.axis === 'money') {
      return formatMoneyValue(value);
    }

    return formatHours(value);
  };

  return (
    <div
      className="rounded-md border p-4 shadow-lg"
      style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
    >
      <p className="mb-1 font-semibold">
        {isRangeBucket ? row.period : formatDate(row.date, dateFormat)}
      </p>

      {isRangeBucket && (
        <p className="mb-3 text-xs" style={{ color: colors.$17 }}>
          {formatDate(row.period_start, dateFormat)} -{' '}
          {formatDate(row.period_end, dateFormat)}
        </p>
      )}

      <div
        className="mb-3 grid grid-cols-3 gap-3 border-b pb-3 text-xs"
        style={{ borderColor: colors.$20, color: colors.$17 }}
      >
        <span>
          {t('tasks')}: {row.task_log_count}
        </span>
        <span>
          {t('invoices')}: {row.invoice_count}
        </span>
        <span>
          {t('expenses')}: {row.expense_count}
        </span>
      </div>

      {payload.map((item) => {
        const metric = item.dataKey ? metricsByKey[item.dataKey] : undefined;
        const label = metric ? t(metric.translationKey) : String(item.name);

        return (
          <div
            key={item.dataKey || item.name}
            className="flex items-center justify-between space-x-8 py-1 text-sm"
          >
            <div className="flex items-center space-x-2">
              <span
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />

              <span style={{ color: colors.$3 }}>{label}</span>
            </div>

            <span className="font-mono font-medium">
              {formatMetricValue(metric, item.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
