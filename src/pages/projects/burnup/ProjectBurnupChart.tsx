/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

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
  XAxis,
  YAxis,
} from 'recharts';
import { useColorScheme } from '$app/common/colors';
import { date as formatDate } from '$app/common/helpers';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Project } from '$app/common/interfaces/project';
import {
  ProjectBurnupMetricKey,
  ProjectBurnupResponse,
} from '$app/common/interfaces/project-burnup';
import { BurnupTooltip } from './BurnupTooltip';
import { formatBurnupXAxisTick, resolveBurnupMarkerDate } from './helpers';
import {
  PROJECT_BURNUP_METRICS,
  ProjectBurnupMetricDefinition,
} from './metrics';

interface Props {
  data: ProjectBurnupResponse;
  project: Project;
  visibleMetricKeys: ProjectBurnupMetricKey[];
}

const axisLabel = (
  value: string,
  fill: string,
  orientation: 'x' | 'left' | 'right'
) => {
  if (orientation === 'x') {
    return {
      value,
      position: 'insideBottom',
      offset: -10,
      style: { fill, fontSize: 12 },
    };
  }

  return {
    value,
    angle: orientation === 'right' ? 90 : -90,
    position: orientation === 'right' ? 'insideRight' : 'insideLeft',
    style: { textAnchor: 'middle', fill, fontSize: 12 },
  };
};

export function ProjectBurnupChart({
  data,
  project,
  visibleMetricKeys,
}: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const formatMoney = useFormatMoney();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const visibleMetrics = useMemo(() => {
    return PROJECT_BURNUP_METRICS.filter((metric) => {
      return visibleMetricKeys.includes(metric.key);
    });
  }, [visibleMetricKeys]);

  const visibleMetricByKey = useMemo(() => {
    return visibleMetrics.reduce<Record<string, ProjectBurnupMetricDefinition>>(
      (metrics, metric) => {
        return { ...metrics, [metric.key]: metric };
      },
      {}
    );
  }, [visibleMetrics]);

  const dueDateMarker = resolveBurnupMarkerDate(
    data.markers?.due_date,
    data.series
  );

  const countryId = project.client?.country_id;
  const currencyId = project.client?.settings.currency_id;
  const canViewFinancials = data.metadata.can_view_financials;

  const formatHours = (value: number | string) => {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const formatMoneyValue = (value: number | string) => {
    return formatMoney(Number(value) || 0, countryId, currencyId).toString();
  };

  const xAxisTitle = data.bucket_type === 'daily' ? t('date') : t('period');

  return (
    <ResponsiveContainer width="100%" height={420}>
      <ComposedChart
        data={data.series}
        margin={{ top: 24, right: 56, left: 46, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        <XAxis
          dataKey="date"
          tickMargin={8}
          minTickGap={24}
          tick={{ fontSize: 12 }}
          stroke={colors.$3}
          label={axisLabel(xAxisTitle, colors.$17, 'x')}
          tickFormatter={(value) => {
            return formatBurnupXAxisTick(
              value,
              data.series,
              data.bucket_type,
              dateFormat
            );
          }}
        />

        <YAxis
          yAxisId="hours"
          tick={{ fontSize: 12 }}
          stroke={colors.$3}
          tickFormatter={formatHours}
          label={axisLabel(t('hours'), colors.$17, 'left')}
          width={64}
        />

        {canViewFinancials && (
          <YAxis
            yAxisId="money"
            orientation="right"
            tick={{ fontSize: 12 }}
            stroke={colors.$3}
            tickFormatter={formatMoneyValue}
            label={axisLabel(t('amount'), colors.$17, 'right')}
            width={92}
          />
        )}

        <Tooltip
          content={
            <BurnupTooltip
              bucketType={data.bucket_type}
              metricsByKey={visibleMetricByKey}
              countryId={countryId}
              currencyId={currencyId}
              canViewFinancials={canViewFinancials}
            />
          }
          wrapperStyle={{ outline: 'none' }}
        />

        <Legend wrapperStyle={{ paddingTop: 28 }} />

        {dueDateMarker && (
          <ReferenceLine
            x={dueDateMarker}
            yAxisId="hours"
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

        {visibleMetrics.map((metric, index) => (
          <Line
            key={index}
            id={metric.key}
            yAxisId={metric.axis}
            type="monotone"
            name={t(metric.translationKey)}
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
