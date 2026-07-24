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
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
import { Project } from '$app/common/interfaces/project';
import { Badge, BadgeVariant } from '$app/components/Badge';
import { Card } from '$app/components/cards';
import { ReactNode, useMemo } from 'react';
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
  TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import { BurnUpPoint, BurnUpStatus, computeBurnUp } from './burn-up';

interface Props {
  project: Project;
}

const COMPLETED_COLOR = '#2276ff';
const TARGET_COLOR = '#a1a1aa';
const TODAY_COLOR = '#f59e0b';
const DUE_COLOR = '#ef4444';

const STATUS_VARIANT: Record<BurnUpStatus, BadgeVariant> = {
  not_started: 'generic',
  on_track: 'blue',
  ahead_of_schedule: 'green',
  behind_schedule: 'yellow',
  overdue: 'red',
  over_budget: 'red',
  completed: 'green',
};

interface TooltipPayloadItem {
  payload: BurnUpPoint;
}

type CustomTooltipProps = TooltipProps<number, string> & {
  active?: boolean;
  payload?: TooltipPayloadItem[];
};

export function ProjectBurnUp({ project }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const formatNumber = useFormatNumber();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const data = useMemo(() => computeBurnUp(project), [project]);

  const { summary } = data;

  const formatHours = (value: number) =>
    formatNumber(Number(value.toFixed(1)));

  const formatPercent = (value: number) => `${formatNumber(Math.round(value))}%`;

  const yAxisMax = useMemo(() => {
    const peak = data.series.reduce(
      (max, point) => Math.max(max, point.completed ?? 0),
      100
    );

    return Math.max(100, Math.ceil(peak / 20) * 20);
  }, [data.series]);

  const statusBadge = (
    <Badge variant={STATUS_VARIANT[summary.status]}>
      {t(summary.status)}
    </Badge>
  );

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (!active || !payload?.length) {
      return null;
    }

    const point = payload[0].payload;

    const delta =
      point.completed !== null && point.target !== null
        ? point.completed - point.target
        : null;

    return (
      <div
        className="p-3 shadow-lg rounded-md border text-sm"
        style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
      >
        <p className="font-semibold mb-2">
          {formatDate(point.date, dateFormat)}
        </p>

        <TooltipRow
          color={COMPLETED_COLOR}
          label={t('completed')}
          value={point.completed !== null ? formatPercent(point.completed) : '—'}
          colors={colors}
        />

        {point.target !== null && (
          <TooltipRow
            color={TARGET_COLOR}
            label={t('target')}
            value={formatPercent(point.target)}
            colors={colors}
          />
        )}

        {point.loggedHours !== null && (
          <TooltipRow
            label={t('logged')}
            value={`${formatHours(point.loggedHours)} / ${formatHours(
              summary.scopeHours
            )}`}
            colors={colors}
          />
        )}

        {delta !== null && (
          <p
            className="mt-2 pt-2 border-t text-xs"
            style={{ borderColor: colors.$20, color: colors.$17 }}
          >
            {delta >= 0
              ? `${t('ahead_of_schedule')} ${formatPercent(Math.abs(delta))}`
              : `${t('behind_schedule')} ${formatPercent(Math.abs(delta))}`}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card
      title={t('burn_up')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      topRight={statusBadge}
      childrenClassName="px-4 sm:px-6"
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5 pt-2">
        <Stat
          label={t('percent_complete')}
          value={formatPercent(summary.percentComplete)}
          detail={
            summary.targetPercent !== null
              ? `${t('target')}: ${formatPercent(summary.targetPercent)}`
              : undefined
          }
          colors={colors}
        />

        <Stat
          label={t('logged')}
          value={formatHours(summary.loggedHours)}
          detail={
            data.hasScope
              ? `${t('of')} ${formatHours(summary.scopeHours)} ${t('hours')}`
              : t('hours')
          }
          colors={colors}
        />

        <Stat
          label={t('remaining')}
          value={data.hasScope ? formatHours(summary.remainingHours) : '—'}
          detail={t('hours')}
          colors={colors}
        />

        <Stat
          label={t('active_tasks')}
          value={formatNumber(summary.activeTaskCount)}
          detail={
            summary.runningTaskCount > 0
              ? `${formatNumber(summary.runningTaskCount)} ${t('running')}`
              : `${formatNumber(summary.invoicedTaskCount)} ${t('invoiced')}`
          }
          colors={colors}
        />

        <Stat
          label={t('projected_completion')}
          value={
            summary.projectedCompletion
              ? formatDate(summary.projectedCompletion, dateFormat)
              : '—'
          }
          detail={
            summary.dueDate
              ? `${t('due_date')}: ${formatDate(summary.dueDate, dateFormat)}`
              : undefined
          }
          colors={colors}
        />
      </div>

      {!data.hasTasks && (
        <EmptyState message={t('no_records_found')} colors={colors} />
      )}

      {data.hasTasks && !data.hasScope && (
        <EmptyState message={t('no_budgeted_hours')} colors={colors} />
      )}

      {data.hasTasks && data.hasScope && (
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart
              data={data.series}
              margin={{ top: 16, right: 16, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="burnUpFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={COMPLETED_COLOR}
                    stopOpacity={0.18}
                  />
                  <stop
                    offset="100%"
                    stopColor={COMPLETED_COLOR}
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
                content={<CustomTooltip />}
                wrapperStyle={{ outline: 'none' }}
              />

              <Legend />

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
                  stroke={TODAY_COLOR}
                  strokeDasharray="5 4"
                  label={{
                    value: t('today'),
                    position: 'insideTopRight',
                    fill: TODAY_COLOR,
                    fontSize: 12,
                  }}
                />
              )}

              {data.dueDateKey && (
                <ReferenceLine
                  x={data.dueDateKey}
                  stroke={DUE_COLOR}
                  strokeDasharray="5 4"
                  label={{
                    value: t('due_date'),
                    position: 'insideBottomRight',
                    fill: DUE_COLOR,
                    fontSize: 12,
                  }}
                />
              )}

              <Area
                type="monotone"
                name={t('completed') || ''}
                dataKey="completed"
                stroke={COMPLETED_COLOR}
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
                  stroke={TARGET_COLOR}
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={false}
                  connectNulls
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

interface StatProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  colors: ReturnType<typeof useColorScheme>;
}

function Stat({ label, value, detail, colors }: StatProps) {
  return (
    <div
      className="flex flex-col rounded-md border px-3 py-2"
      style={{ borderColor: colors.$24, backgroundColor: colors.$2 }}
    >
      <span className="text-xs font-medium" style={{ color: colors.$17 }}>
        {label}
      </span>

      <span className="text-lg font-semibold" style={{ color: colors.$3 }}>
        {value}
      </span>

      {detail && (
        <span className="text-xs" style={{ color: colors.$17 }}>
          {detail}
        </span>
      )}
    </div>
  );
}

interface TooltipRowProps {
  label: string;
  value: ReactNode;
  color?: string;
  colors: ReturnType<typeof useColorScheme>;
}

function TooltipRow({ label, value, color, colors }: TooltipRowProps) {
  return (
    <div className="flex items-center justify-between space-x-8 py-0.5">
      <div className="flex items-center space-x-2">
        {color && (
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
        )}

        <span style={{ color: colors.$3 }}>{label}</span>
      </div>

      <span className="font-medium font-mono" style={{ color: colors.$3 }}>
        {value}
      </span>
    </div>
  );
}

interface EmptyStateProps {
  message: string;
  colors: ReturnType<typeof useColorScheme>;
}

function EmptyState({ message, colors }: EmptyStateProps) {
  return (
    <div
      className="mt-6 flex items-center justify-center rounded-md border border-dashed py-12 text-sm"
      style={{ borderColor: colors.$24, color: colors.$17 }}
    >
      {message}
    </div>
  );
}
