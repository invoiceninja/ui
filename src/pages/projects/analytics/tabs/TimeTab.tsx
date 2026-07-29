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
import {
  ProjectEstimatedVsLoggedHours,
  ProjectHealth,
  ProjectTaskDistributionRow,
  ProjectTeamContributionRow,
  ProjectVelocityRow,
} from '$app/common/interfaces/project-analytics';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  CartesianGrid,
  BarChart,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AnalyticsCard } from '../components/AnalyticsCard';
import {
  AnalyticsChartTooltip,
  AnalyticsValueFormatter,
} from '../components/AnalyticsChartTooltip';
import {
  ProjectHealthHeader,
  ProjectHealthSummary,
} from '../components/ProjectHealthSummary';
import { ResponsiveChart } from '../components/ResponsiveChart';
import {
  ANALYTICS_AXIS_LABEL_LEGEND_WRAPPER_STYLE,
  ANALYTICS_CHART_COLORS,
  ANALYTICS_GRID_PROPS,
  ANALYTICS_LEGEND_WRAPPER_STYLE,
} from '../constants';
import {
  axisTick,
  cleanTooltipText,
  formatCompact,
  normalizeRows,
  singleProjectData,
  truncateAxisTick,
  xAxisLabel,
  yAxisLabel,
} from '../helpers';
import { useAnalyticsFieldLabel } from '../hooks/useAnalyticsFieldLabel';

interface Props {
  projectName: string;
  estimatedVsLogged?: ProjectEstimatedVsLoggedHours;
  projectHealth?: ProjectHealth;
  teamContribution: ProjectTeamContributionRow[];
  timeDistribution: ProjectTaskDistributionRow[];
  velocityTrend: ProjectVelocityRow[];
  formatter: AnalyticsValueFormatter;
}

export function TimeTab({
  projectName,
  estimatedVsLogged,
  projectHealth,
  teamContribution,
  timeDistribution,
  velocityTrend,
  formatter,
}: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const fieldLabel = useAnalyticsFieldLabel();

  const hoursData = singleProjectData(estimatedVsLogged, projectName, [
    'estimated_hours',
    'logged_hours',
    'billable_hours',
    'remaining_hours',
  ]);

  const teamData = normalizeRows(teamContribution, [
    'logged_hours',
    'billable_hours',
    'billable_value',
  ]);

  const taskLabel = t('task');

  const distributionData = useMemo(() => {
    return normalizeRows(timeDistribution, [
      'logged_hours',
      'billable_hours',
      'billable_value',
    ]).map((row, index) => {
      return {
        ...row,
        description:
          cleanTooltipText(row.description) || `${taskLabel} ${index + 1}`,
      };
    });
  }, [timeDistribution, taskLabel]);

  const velocityData = normalizeRows(velocityTrend, [
    'hours',
    'billable_hours',
    'task_value',
  ]);

  const distributionHeight = Math.max(
    320,
    Math.min(560, distributionData.length * 34 + 96)
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <AnalyticsCard title={t('hours')} className="col-span-12 xl:col-span-6">
          <ResponsiveChart>
            <BarChart
              layout="vertical"
              data={hoursData}
              margin={{ top: 8, right: 16, left: 16, bottom: 0 }}
            >
              <CartesianGrid {...ANALYTICS_GRID_PROPS} />

              <XAxis
                type="number"
                tick={axisTick(colors.$22)}
                tickFormatter={formatCompact}
              />

              <YAxis
                type="category"
                dataKey="project_name"
                tick={false}
                width={12}
              />

              <Tooltip
                content={<AnalyticsChartTooltip formatter={formatter} />}
                cursor={{ fill: 'transparent' }}
                wrapperStyle={{ outline: 'none' }}
                shared={false}
              />

              <Legend wrapperStyle={ANALYTICS_LEGEND_WRAPPER_STYLE} />

              <Bar
                dataKey="estimated_hours"
                name={fieldLabel('estimated_hours')}
                fill={ANALYTICS_CHART_COLORS[0]}
              />

              <Bar
                dataKey="logged_hours"
                name={fieldLabel('logged_hours')}
                fill={ANALYTICS_CHART_COLORS[1]}
              />

              <Bar
                dataKey="billable_hours"
                name={fieldLabel('billable_hours')}
                fill={ANALYTICS_CHART_COLORS[4]}
              />

              <Bar
                dataKey="remaining_hours"
                name={fieldLabel('remaining_hours')}
                fill={ANALYTICS_CHART_COLORS[2]}
              />
            </BarChart>
          </ResponsiveChart>
        </AnalyticsCard>

        <AnalyticsCard
          title={t('health_check')}
          className="col-span-12 xl:col-span-6"
          topRight={
            <ProjectHealthHeader health={projectHealth} formatter={formatter} />
          }
        >
          <ProjectHealthSummary health={projectHealth} formatter={formatter} />
        </AnalyticsCard>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <AnalyticsCard
          title={t('team_distribution')}
          className="col-span-12 xl:col-span-6"
        >
          <ResponsiveChart>
            <BarChart
              data={teamData}
              margin={{ top: 8, right: 16, left: 42, bottom: 0 }}
            >
              <CartesianGrid {...ANALYTICS_GRID_PROPS} />

              <XAxis
                dataKey="user_name"
                tick={axisTick(colors.$22)}
                angle={-25}
                textAnchor="end"
                height={54}
              />

              <YAxis
                tick={axisTick(colors.$22)}
                tickFormatter={formatCompact}
                label={yAxisLabel(t('hours'), colors.$22)}
              />

              <Tooltip
                content={<AnalyticsChartTooltip formatter={formatter} />}
                cursor={{ fill: 'transparent' }}
                wrapperStyle={{ outline: 'none' }}
                shared={false}
              />

              <Legend wrapperStyle={ANALYTICS_LEGEND_WRAPPER_STYLE} />

              <Bar
                dataKey="logged_hours"
                name={fieldLabel('logged_hours')}
                fill={ANALYTICS_CHART_COLORS[0]}
              />

              <Bar
                dataKey="billable_hours"
                name={fieldLabel('billable_hours')}
                fill={ANALYTICS_CHART_COLORS[1]}
              />
            </BarChart>
          </ResponsiveChart>
        </AnalyticsCard>

        <AnalyticsCard
          title={t('task_distribution')}
          className="col-span-12 xl:col-span-6"
          height={distributionHeight}
        >
          <ResponsiveChart>
            <BarChart
              layout="vertical"
              data={distributionData}
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid {...ANALYTICS_GRID_PROPS} />

              <XAxis
                type="number"
                tick={axisTick(colors.$22)}
                tickFormatter={formatCompact}
                label={xAxisLabel(t('hours'), colors.$22)}
                height={44}
              />

              <YAxis
                type="category"
                dataKey="description"
                tick={axisTick(colors.$22)}
                tickFormatter={(value) => truncateAxisTick(value, 24)}
                interval={0}
                width={156}
              />

              <Tooltip
                content={
                  <AnalyticsChartTooltip
                    formatter={formatter}
                    options={{ labelKey: 'description' }}
                  />
                }
                cursor={{ fill: 'transparent' }}
                wrapperStyle={{ outline: 'none' }}
                shared={false}
              />

              <Legend
                wrapperStyle={ANALYTICS_AXIS_LABEL_LEGEND_WRAPPER_STYLE}
              />

              <Bar
                dataKey="logged_hours"
                name={fieldLabel('logged_hours')}
                fill={ANALYTICS_CHART_COLORS[0]}
              />

              <Bar
                dataKey="billable_hours"
                name={fieldLabel('billable_hours')}
                fill={ANALYTICS_CHART_COLORS[1]}
              />
            </BarChart>
          </ResponsiveChart>
        </AnalyticsCard>

        <AnalyticsCard
          title={t('task_velocity')}
          className="col-span-12 xl:col-span-6"
        >
          <ResponsiveChart>
            <LineChart
              data={velocityData}
              margin={{ top: 8, right: 16, left: 42, bottom: 0 }}
            >
              <CartesianGrid {...ANALYTICS_GRID_PROPS} />

              <XAxis dataKey="period" tick={axisTick(colors.$22)} />

              <YAxis
                tick={axisTick(colors.$22)}
                tickFormatter={formatCompact}
                label={yAxisLabel(t('hours'), colors.$22)}
              />

              <Tooltip
                content={<AnalyticsChartTooltip formatter={formatter} />}
                cursor={{ fill: 'transparent' }}
                wrapperStyle={{ outline: 'none' }}
              />

              <Legend wrapperStyle={ANALYTICS_LEGEND_WRAPPER_STYLE} />

              <Line
                type="monotone"
                dataKey="hours"
                name={fieldLabel('hours')}
                stroke={ANALYTICS_CHART_COLORS[0]}
                strokeWidth={2}
                dot={false}
              />

              <Line
                type="monotone"
                dataKey="billable_hours"
                name={fieldLabel('billable_hours')}
                stroke={ANALYTICS_CHART_COLORS[1]}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveChart>
        </AnalyticsCard>
      </div>
    </div>
  );
}
