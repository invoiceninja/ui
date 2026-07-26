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
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
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
import { BurnUpData } from '$app/pages/projects/show/common/helpers/burn-up';
import { BurnUpTooltip } from './BurnUpTooltip';
import {
  BURN_UP_COMPLETED_COLOR,
  BURN_UP_TARGET_COLOR,
  BURN_UP_TODAY_COLOR,
} from './constants';

interface Props {
  data: BurnUpData;
}

export function BurnUpChart({ data }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const { summary } = data;

  const yAxisMax = useMemo(() => {
    const peak = data.series.reduce((max, point) => {
      return Math.max(max, point.completed ?? 0);
    }, 100);

    return Math.max(100, Math.ceil(peak / 20) * 20);
  }, [data.series]);

  return (
    <ResponsiveContainer width="100%" height={360}>
      <ComposedChart
        data={data.series}
        margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="burnUpFill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={BURN_UP_COMPLETED_COLOR}
              stopOpacity={0.18}
            />
            <stop
              offset="100%"
              stopColor={BURN_UP_COMPLETED_COLOR}
              stopOpacity={0}
            />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke={colors.$5}
        />

        <XAxis
          dataKey="date"
          tickMargin={8}
          minTickGap={24}
          tick={{ fontSize: 12 }}
          stroke={colors.$17}
          tickFormatter={(value) => formatDate(value, dateFormat)}
        />

        <YAxis
          domain={[0, yAxisMax]}
          tick={{ fontSize: 12 }}
          stroke={colors.$17}
          width={48}
          allowDecimals={false}
          tickFormatter={(value) => `${value}%`}
        />

        <Tooltip
          content={<BurnUpTooltip scopeHours={summary.scopeHours} />}
          wrapperStyle={{ outline: 'none' }}
        />

        <Legend wrapperStyle={{ paddingTop: 12 }} />

        <ReferenceLine
          y={100}
          yAxisId={0}
          stroke={colors.$16}
          strokeDasharray="4 4"
          label={{
            value: t('scope'),
            position: 'insideTopLeft',
            fill: colors.$17,
            fontSize: 12,
          }}
        />

        {data.todayKey && (
          <ReferenceLine
            x={data.todayKey}
            stroke={BURN_UP_TODAY_COLOR}
            strokeDasharray="5 4"
            label={{
              value: t('today'),
              position: 'insideTopRight',
              fill: BURN_UP_TODAY_COLOR,
              fontSize: 12,
            }}
          />
        )}

        <Area
          type="monotone"
          name={t('completed') || ''}
          dataKey="completed"
          stroke={BURN_UP_COMPLETED_COLOR}
          strokeWidth={2.5}
          fill="url(#burnUpFill)"
          connectNulls={false}
          dot={false}
          activeDot={{ r: 4 }}
        />

        {summary.dueDate && (
          <Line
            type="monotone"
            name={t('target') || ''}
            dataKey="target"
            stroke={BURN_UP_TARGET_COLOR}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            connectNulls
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
