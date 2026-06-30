/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date as formatDate } from '$app/common/helpers';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { Project } from '$app/common/interfaces/project';
import {
  ProjectBurnupMetricKey,
  ProjectBurnupResponse,
  ProjectBurnupSeriesRow,
} from '$app/common/interfaces/project-burnup';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { formatBurnupXAxisTick, resolveBurnupMarkerDate } from './helpers';
import {
  PROJECT_BURNUP_METRICS,
  ProjectBurnupMetricDefinition,
} from './metrics';

interface PayloadItem {
  color: string;
  dataKey: ProjectBurnupMetricKey;
  name: string;
  value: number;
  payload: ProjectBurnupSeriesRow;
}

type CustomTooltipProps = TooltipProps<any, any> & {
  active?: boolean;
  payload?: PayloadItem[];
};

interface Props {
  data: ProjectBurnupResponse;
  project: Project;
  visibleMetricKeys: ProjectBurnupMetricKey[];
}

export function ProjectBurnupChart(props: Props) {
  const { data, project, visibleMetricKeys } = props;

  const { t } = useTranslation();
  const colors = useColorScheme();
  const formatMoney = useFormatMoney();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const visibleMetrics = useMemo(
    () =>
      PROJECT_BURNUP_METRICS.filter((metric) =>
        visibleMetricKeys.includes(metric.key)
      ),
    [visibleMetricKeys]
  );

  const visibleMetricByKey = useMemo(
    () =>
      visibleMetrics.reduce<Record<string, ProjectBurnupMetricDefinition>>(
        (metrics, metric) => ({ ...metrics, [metric.key]: metric }),
        {}
      ),
    [visibleMetrics]
  );

  const dueDateMarker = resolveBurnupMarkerDate(
    data.markers?.due_date,
    data.series
  );

  const countryId = project.client?.country_id;
  const currencyId = project.client?.settings.currency_id;

  const translateMetric = (metric: ProjectBurnupMetricDefinition) =>
    t(metric.translationKey, { defaultValue: metric.defaultLabel });

  const formatHours = (value: number | string) =>
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatMoneyValue = (value: number | string) =>
    formatMoney(Number(value) || 0, countryId, currencyId).toString();

  const formatMetricValue = (
    metric: ProjectBurnupMetricDefinition | undefined,
    value: number | string
  ) => {
    if (metric?.axis === 'money') {
      return formatMoneyValue(value);
    }

    return formatHours(value);
  };

  const TooltipContent = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload?.length) {
      return null;
    }

    const row = payload[0].payload;
    const isRangeBucket = data.bucket_type !== 'daily';

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
          const dataKey = item.dataKey;
          const metric = dataKey ? visibleMetricByKey[dataKey] : undefined;

          return (
            <div
              key={dataKey || item.name}
              className="flex items-center justify-between space-x-8 py-1 text-sm"
            >
              <div className="flex items-center space-x-2">
                <span
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />

                <span style={{ color: colors.$3 }}>
                  {metric ? translateMetric(metric) : item.name}
                </span>
              </div>

              <span className="font-mono font-medium">
                {formatMetricValue(metric, item.value)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={420}>
      <ComposedChart
        data={data.series}
        margin={{ top: 24, right: 18, left: 18, bottom: 12 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        <XAxis
          dataKey="date"
          tickMargin={8}
          minTickGap={24}
          tick={{ fontSize: 12 }}
          stroke={colors.$3}
          tickFormatter={(value) =>
            formatBurnupXAxisTick(
              value,
              data.series,
              data.bucket_type,
              dateFormat
            )
          }
        />

        <YAxis
          yAxisId="hours"
          tick={{ fontSize: 12 }}
          stroke={colors.$3}
          tickFormatter={formatHours}
          width={64}
        />

        <YAxis
          yAxisId="money"
          orientation="right"
          tick={{ fontSize: 12 }}
          stroke={colors.$3}
          tickFormatter={formatMoneyValue}
          width={92}
        />

        <Tooltip
          content={<TooltipContent />}
          wrapperStyle={{ outline: 'none' }}
        />

        <Legend />

        {dueDateMarker && (
          <ReferenceLine
            x={dueDateMarker}
            stroke="#dc2626"
            strokeDasharray="5 4"
            label={{
              value: `${t('due_date')}: ${formatDate(
                data.markers.due_date || dueDateMarker,
                dateFormat
              )}`,
              position: 'insideTopRight',
              fill: '#dc2626',
              fontSize: 12,
            }}
          />
        )}

        {visibleMetrics.map((metric) => (
          <Line
            key={metric.key}
            id={metric.key}
            yAxisId={metric.axis}
            type="monotone"
            name={translateMetric(metric)}
            dataKey={metric.key}
            stroke={metric.stroke}
            strokeDasharray={metric.strokeDasharray}
            strokeWidth={metric.strokeWidth ?? 2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
