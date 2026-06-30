/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date as formatDate, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useFormatNumber } from '$app/common/hooks/useFormatNumber';
import { Project } from '$app/common/interfaces/project';
import { Badge } from '$app/components/Badge';
import { Card } from '$app/components/cards';
import Toggle from '$app/components/forms/Toggle';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import Burnup from '$app/pages/projects/burnup/Burnup';
import classNames from 'classnames';
import { ReactElement, ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type NumberLike = number | string | null | undefined;

type TranslateFn = (key: string) => string;

type ProjectRow = {
  project_id?: NumberLike;
  project_name?: string;
};

type ProjectBudgetSummary = ProjectRow & {
  budgeted_amount?: NumberLike;
  actual_amount?: NumberLike;
  invoiced_amount?: NumberLike;
  paid_amount?: NumberLike;
  outstanding_amount?: NumberLike;
};

type BudgetVsActual = ProjectRow & {
  budgeted_amount?: NumberLike;
  actual_amount?: NumberLike;
  labor_value?: NumberLike;
  expense_amount?: NumberLike;
  budget_utilization?: NumberLike;
};

type EstimatedVsLoggedHours = ProjectRow & {
  estimated_hours?: NumberLike;
  logged_hours?: NumberLike;
  billable_hours?: NumberLike;
  remaining_hours?: NumberLike;
};

type InvoiceProgress = ProjectRow & {
  work_value?: NumberLike;
  invoiced_amount?: NumberLike;
  paid_amount?: NumberLike;
  outstanding_amount?: NumberLike;
  unbilled_amount?: NumberLike;
  invoice_progress?: NumberLike;
  paid_progress?: NumberLike;
};

type ForecastCompletion = ProjectRow & {
  average_daily_velocity?: NumberLike;
  remaining_hours?: NumberLike;
  forecast_finish_date?: string;
  schedule_variance_days?: NumberLike;
};

type ProjectHealth = ProjectRow & {
  health_score?: NumberLike;
  health_status?: string;
};

type TeamContributionRow = {
  user_id?: NumberLike;
  user_name?: string;
  logged_hours?: NumberLike;
  billable_hours?: NumberLike;
  billable_value?: NumberLike;
};

type TaskDistributionRow = {
  description?: string;
  logged_hours?: NumberLike;
  billable_hours?: NumberLike;
  billable_value?: NumberLike;
};

type UnbilledHours = ProjectRow & {
  unbilled_hours?: NumberLike;
  unbilled_amount?: NumberLike;
};

type VelocityRow = {
  period?: string;
  hours?: NumberLike;
  billable_hours?: NumberLike;
  task_value?: NumberLike;
};

type TimelineVariance = ProjectRow & {
  schedule_variance_days?: NumberLike;
};

type ExpenseCategoryRow = {
  category_name?: string;
  expense_amount?: NumberLike;
  expense_count?: NumberLike;
};

type CumulativeSpendRow = {
  period?: string;
  cumulative_labor_value?: NumberLike;
  cumulative_expense_amount?: NumberLike;
  cumulative_actual_amount?: NumberLike;
};

type Profitability = ProjectRow & {
  invoiced_amount?: NumberLike;
  expense_amount?: NumberLike;
  net_margin?: NumberLike;
  margin_ratio?: NumberLike;
};

type ActivityRow = {
  date?: string;
  type?: string;
  label?: string;
  amount?: NumberLike;
};

type ProjectNested<T> = {
  project_id?: NumberLike;
  project_name?: string;
  [seriesName: string]: T | NumberLike | string;
};

type ProjectAnalyticsResponse = {
  budget_summary: ProjectBudgetSummary[];
  budget_vs_actual: BudgetVsActual[];
  estimated_vs_logged_hours: EstimatedVsLoggedHours[];
  invoice_progress: InvoiceProgress[];
  forecast_completion: ForecastCompletion[];
  project_health: ProjectHealth[];
  team_contribution: ProjectNested<TeamContributionRow[]>[];
  time_distribution: ProjectNested<TaskDistributionRow[]>[];
  unbilled_hours: UnbilledHours[];
  velocity_trend: ProjectNested<VelocityRow[]>[];
  timeline_variance: TimelineVariance[];
  expense_breakdown: ProjectNested<ExpenseCategoryRow[]>[];
  cumulative_spend: ProjectNested<CumulativeSpendRow[]>[];
  profitability: Profitability[];
  recent_activity: ProjectNested<ActivityRow[]>[];
  metadata: {
    project_count: number;
    include_drafts: boolean;
    generated_at: string;
  };
};

type ChartDatum = Record<string, unknown>;

type Formatter = (dataKey: string, value: unknown) => ReactNode;

type ChartTooltipOptions = {
  itemOnly?: boolean;
  labelKey?: string;
  nameKey?: string;
  percentTotal?: number;
  showPercent?: boolean;
};

type ChartTooltipPayloadItem = {
  color?: string;
  dataKey?: string | number;
  fill?: string;
  name?: string | number;
  payload?: ChartDatum;
  percent?: unknown;
  value?: unknown;
};

type ChartTooltipContentProps = {
  active?: boolean;
  label?: string | number;
  payload?: ChartTooltipPayloadItem[];
};

type AnalyticsCardProps = {
  title: string;
  children: ReactNode;
  description?: string;
  className?: string;
  height?: number;
};

type StatCardProps = {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accent: string;
};

type ProjectAnalyticsOverviewContent =
  | ReactNode
  | ((forecastCard: ReactNode) => ReactNode);

interface ProjectAnalyticsProps {
  project: Project;
  overviewContent?: ProjectAnalyticsOverviewContent;
}

const MONEY_FIELDS = new Set([
  'budgeted_amount',
  'actual_amount',
  'amount',
  'labor_value',
  'expense_amount',
  'work_value',
  'invoiced_amount',
  'paid_amount',
  'outstanding_amount',
  'unbilled_amount',
  'billable_value',
  'task_value',
  'cumulative_labor_value',
  'cumulative_expense_amount',
  'cumulative_actual_amount',
  'net_margin',
]);

const HOURS_FIELDS = new Set([
  'estimated_hours',
  'logged_hours',
  'billable_hours',
  'remaining_hours',
  'average_daily_velocity',
  'hours',
  'unbilled_hours',
]);

const RATIO_FIELDS = new Set([
  'utilization',
  'budget_utilization',
  'invoice_progress',
  'paid_progress',
  'margin_ratio',
]);

const PERCENT_FIELDS = new Set([
  'completion_percentage',
  'ideal_progress_percentage',
  'health_score',
]);

// Chart-series field -> i18n key. Every chart carries its own axis
// (Amount / Hours / %), so series labels are the bare metric name —
// the redundant unit suffix is dropped. No fallback text is supplied, so a
// missing translation surfaces the key itself rather than English text.
const FIELD_LABELS: Record<string, string> = {
  actual_amount: 'actual',
  average_daily_velocity: 'daily_velocity',
  billable_hours: 'billable',
  billable_value: 'billable',
  budget_utilization: 'budget_used',
  budgeted_amount: 'budgeted',
  cumulative_actual_amount: 'total',
  cumulative_expense_amount: 'expenses',
  cumulative_labor_value: 'labor',
  estimated_hours: 'estimated',
  expense_amount: 'expense',
  expense_count: 'count',
  health_score: 'health',
  hours: 'logged',
  invoice_progress: 'invoice_progress',
  invoiced_amount: 'invoiced',
  labor_value: 'labor',
  logged_hours: 'logged',
  margin_ratio: 'margin_percentage',
  net_margin: 'net_margin',
  outstanding_amount: 'outstanding',
  paid_amount: 'paid',
  paid_progress: 'paid_progress',
  remaining_hours: 'remaining',
  schedule_variance_days: 'days_ahead',
  task_value: 'task_value',
  unbilled_amount: 'unbilled',
  unbilled_hours: 'unbilled_hours',
  work_value: 'earned',
};

const CHART_COLORS = [
  '#2563EB',
  '#16A34A',
  '#F59E0B',
  '#DC2626',
  '#0891B2',
  '#6B7280',
  '#7C3AED',
];

const KEY_FIELDS = ['project_id', 'project_name'];

export function ProjectAnalytics({
  project,
  overviewContent,
}: ProjectAnalyticsProps) {
  const [tFn] = useTranslation();
  const t = tFn as TranslateFn;
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const formatNumber = useFormatNumber();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const fieldLabel = (key: string) => resolveFieldLabel(t, key);

  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const analytics = useQuery<ProjectAnalyticsResponse>({
    queryKey: ['/api/v1/charts/project_analytics/:id', project.id, includeDrafts],
    queryFn: () =>
      request('POST', endpoint('/api/v1/charts/project_analytics/:id', { id: project.id }), {
        include_drafts: includeDrafts,
      }).then((response) => response.data),
    staleTime: Infinity,
    enabled: !!project.id,
  });

  const currencyId =
    project.client?.settings?.currency_id || company?.settings.currency_id;
  const countryId = project.client?.country_id || company?.settings.country_id;

  const formatFieldValue: Formatter = (dataKey, value) => {
    if (MONEY_FIELDS.has(dataKey)) {
      return formatMoney(toNumber(value), countryId, currencyId, 2).toString();
    }

    if (HOURS_FIELDS.has(dataKey)) {
      return `${formatNumber(toNumber(value))}h`;
    }

    if (RATIO_FIELDS.has(dataKey)) {
      return `${formatNumber(toNumber(value) * 100)}%`;
    }

    if (PERCENT_FIELDS.has(dataKey)) {
      return `${formatNumber(toNumber(value))}%`;
    }

    if (dataKey === 'schedule_variance_days') {
      return `${formatNumber(toNumber(value))}d`;
    }

    return formatNumber(toNumber(value));
  };

  const projectAnalytics = useMemo(() => {
    const data = analytics.data;

    if (!data) {
      return null;
    }

    const budgetSummary = findProjectRow(data.budget_summary, project.id);
    const budgetVsActual = findProjectRow(data.budget_vs_actual, project.id);
    const estimatedVsLogged = findProjectRow(
      data.estimated_vs_logged_hours,
      project.id
    );
    const invoiceProgress = findProjectRow(data.invoice_progress, project.id);
    const forecastCompletion = findProjectRow(
      data.forecast_completion,
      project.id
    );
    const projectHealth = findProjectRow(data.project_health, project.id);
    const unbilledHours = findProjectRow(data.unbilled_hours, project.id);
    const timelineVariance = findProjectRow(data.timeline_variance, project.id);
    const profitability = findProjectRow(data.profitability, project.id);

    return {
      budgetSummary,
      budgetVsActual,
      estimatedVsLogged,
      invoiceProgress,
      forecastCompletion,
      projectHealth,
      unbilledHours,
      timelineVariance,
      profitability,
      teamContribution: getNestedRows<TeamContributionRow>(
        data.team_contribution,
        project.id
      ),
      timeDistribution: getNestedRows<TaskDistributionRow>(
        data.time_distribution,
        project.id
      ),
      velocityTrend: getNestedRows<VelocityRow>(
        data.velocity_trend,
        project.id
      ),
      expenseBreakdown: getNestedRows<ExpenseCategoryRow>(
        data.expense_breakdown,
        project.id
      ),
      cumulativeSpend: getNestedRows<CumulativeSpendRow>(
        data.cumulative_spend,
        project.id
      ),
      recentActivity: getNestedRows<ActivityRow>(
        data.recent_activity,
        project.id
      ),
    };
  }, [analytics.data, project.id]);

  const timeDistributionData = useMemo(
    () => normalizeTaskDistributionRows(projectAnalytics?.timeDistribution, t),
    [projectAnalytics?.timeDistribution, t]
  );

  const expenseBreakdownData = useMemo(
    () =>
      normalizeRows(projectAnalytics?.expenseBreakdown, [
        'expense_amount',
        'expense_count',
      ]),
    [projectAnalytics?.expenseBreakdown]
  );

  const expenseBreakdownTotal = useMemo(
    () => sumChartValues(expenseBreakdownData, 'expense_amount'),
    [expenseBreakdownData]
  );

  const taskTimeDistributionHeight = Math.max(
    320,
    Math.min(560, timeDistributionData.length * 34 + 96)
  );

  const hasAnyProjectData =
    Boolean(projectAnalytics?.budgetVsActual) ||
    Boolean(projectAnalytics?.estimatedVsLogged) ||
    Boolean(projectAnalytics?.invoiceProgress) ||
    Boolean(projectAnalytics?.forecastCompletion) ||
    Boolean(projectAnalytics?.projectHealth) ||
    Boolean(projectAnalytics?.unbilledHours) ||
    Boolean(projectAnalytics?.timelineVariance) ||
    Boolean(projectAnalytics?.profitability) ||
    Boolean(projectAnalytics?.teamContribution.length) ||
    Boolean(projectAnalytics?.timeDistribution.length) ||
    Boolean(projectAnalytics?.velocityTrend.length) ||
    Boolean(projectAnalytics?.expenseBreakdown.length) ||
    Boolean(projectAnalytics?.cumulativeSpend.length);

  const statCards = [
    {
      label: t('budgeted'),
      value: formatFieldValue(
        'budgeted_amount',
        projectAnalytics?.budgetSummary?.budgeted_amount ??
          projectAnalytics?.budgetVsActual?.budgeted_amount
      ),
      detail: t('planned_value'),
      accent: CHART_COLORS[0],
    },
    {
      label: t('actual'),
      value: formatFieldValue(
        'actual_amount',
        projectAnalytics?.budgetSummary?.actual_amount ??
          projectAnalytics?.budgetVsActual?.actual_amount
      ),
      detail: t('labor_and_expenses'),
      accent: CHART_COLORS[1],
    },
    {
      label: t('invoiced'),
      value: formatFieldValue(
        'invoiced_amount',
        projectAnalytics?.invoiceProgress?.invoiced_amount ??
          projectAnalytics?.budgetSummary?.invoiced_amount
      ),
      detail: t('sent_to_client'),
      accent: CHART_COLORS[2],
    },
    {
      label: t('paid'),
      value: formatFieldValue(
        'paid_amount',
        projectAnalytics?.invoiceProgress?.paid_amount ??
          projectAnalytics?.budgetSummary?.paid_amount
      ),
      detail: t('collected'),
      accent: CHART_COLORS[3],
    },
    {
      label: t('outstanding'),
      value: formatFieldValue(
        'outstanding_amount',
        projectAnalytics?.invoiceProgress?.outstanding_amount ??
          projectAnalytics?.budgetSummary?.outstanding_amount
      ),
      detail: t('remaining_invoice_balance'),
      accent: CHART_COLORS[4],
    },
    {
      label: t('health'),
      value: formatFieldValue(
        'health_score',
        projectAnalytics?.projectHealth?.health_score
      ),
      detail:
        projectAnalytics?.projectHealth?.health_status ||
        t('status'),
      accent: CHART_COLORS[5],
    },
    {
      label: t('logged'),
      value: formatFieldValue(
        'logged_hours',
        projectAnalytics?.estimatedVsLogged?.logged_hours
      ),
      detail: t('tracked_time'),
      accent: CHART_COLORS[0],
    },
    {
      label: t('unbilled'),
      value: formatFieldValue(
        'unbilled_amount',
        projectAnalytics?.unbilledHours?.unbilled_amount
      ),
      detail: formatFieldValue(
        'unbilled_hours',
        projectAnalytics?.unbilledHours?.unbilled_hours
      ),
      accent: CHART_COLORS[2],
    },
  ];

  return (
    <section className="my-4 space-y-4">
      <div className="flex justify-end">
        <div
          className="flex items-center justify-start rounded-md border px-3 py-2 md:justify-center"
          style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
        >
          <Toggle
            label={t('include_drafts')}
            checked={includeDrafts}
            onValueChange={setIncludeDrafts}
          />
        </div>
      </div>

      {analytics.isLoading && (
        <div
          className="flex min-h-[160px] items-center justify-center rounded-md border"
          style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
        >
          <Spinner />
        </div>
      )}

      {!analytics.isLoading && !hasAnyProjectData && (
        <div
          className="rounded-md border p-4 text-sm"
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$24,
            color: colors.$22,
          }}
        >
          {t('no_project_analytics_data')}
        </div>
      )}

      {!analytics.isLoading && projectAnalytics && (
        <>
          {hasAnyProjectData && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
              {statCards.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          )}

          <TabGroup
            tabs={[
              t('overview'),
              t('profit'),
              t('time'),
              t('expenses'),
              t('burn_up'),
            ]}
            withoutVerticalMargin
            childrenClassName="mt-4"
            defaultTabIndex={activeTabIndex}
            onTabChange={setActiveTabIndex}
          >
            <div className="space-y-4">
              {activeTabIndex === 0 &&
                renderOverviewContent(
                  overviewContent,
                  <AnalyticsCard
                    title={t('forecast')}
                    className="col-span-12 xl:col-span-6"
                    height={240}
                  >
                    <ForecastSummary
                      forecast={projectAnalytics.forecastCompletion}
                      formatter={formatFieldValue}
                      dateFormat={dateFormat}
                    />
                  </AnalyticsCard>
                )}
            </div>

            <div className="grid grid-cols-12 gap-4">
              {activeTabIndex === 1 && (
                <>
                <AnalyticsCard
                  title={t('profit')}
                  className="col-span-12 xl:col-span-6"
                  height={320}
                >
                  <ResponsiveChart>
                    <ComposedChart
                      data={singleProjectData(
                        projectAnalytics.profitability,
                        project.name,
                        [
                          'invoiced_amount',
                          'expense_amount',
                          'net_margin',
                          'margin_ratio',
                        ]
                      )}
                      margin={{ top: 8, right: 48, left: 42, bottom: 26 }}
                    >
                      <ChartGrid />
                      <XAxis
                        dataKey="project_name"
                        tick={false}
                      />
                      <YAxis
                        yAxisId="amount"
                        tick={axisTick(colors.$22)}
                        tickFormatter={formatCompact}
                        label={yAxisLabel(
                          t('amount'),
                          colors.$22
                        )}
                      />
                      <YAxis
                        yAxisId="ratio"
                        orientation="right"
                        domain={[0, 1]}
                        tick={axisTick(colors.$22)}
                        tickFormatter={(value) => `${toNumber(value) * 100}%`}
                        label={yAxisLabel(
                          t('margin_percentage'),
                          colors.$22,
                          'insideRight'
                        )}
                      />
                      <Tooltip {...chartTooltipProps(formatFieldValue)} />
                      <Legend />
                      <Bar
                        yAxisId="amount"
                        dataKey="invoiced_amount"
                        name={fieldLabel('invoiced_amount')}
                        fill={CHART_COLORS[0]}
                      />
                      <Bar
                        yAxisId="amount"
                        dataKey="expense_amount"
                        name={fieldLabel('expense_amount')}
                        fill={CHART_COLORS[2]}
                      />
                      <Bar
                        yAxisId="amount"
                        dataKey="net_margin"
                        name={fieldLabel('net_margin')}
                        fill={CHART_COLORS[1]}
                      />
                      <Line
                        yAxisId="ratio"
                        type="monotone"
                        dataKey="margin_ratio"
                        name={fieldLabel('margin_ratio')}
                        stroke={CHART_COLORS[3]}
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveChart>
                </AnalyticsCard>

                <AnalyticsCard
                  title={t('budget_vs_actual')}
                  className="col-span-12 xl:col-span-6"
                >
                  <ResponsiveChart>
                    <BarChart
                      data={singleProjectData(
                        projectAnalytics.budgetVsActual,
                        project.name,
                        [
                          'budgeted_amount',
                          'actual_amount',
                          'labor_value',
                          'expense_amount',
                        ]
                      )}
                      margin={{ top: 8, right: 16, left: 42, bottom: 26 }}
                    >
                      <ChartGrid />
                      <XAxis dataKey="project_name" tick={false} />
                      <YAxis
                        tick={axisTick(colors.$22)}
                        tickFormatter={formatCompact}
                        label={yAxisLabel(
                          t('amount'),
                          colors.$22
                        )}
                      />
                      <Tooltip {...chartTooltipProps(formatFieldValue, true)} />
                      <Legend />
                      <Bar
                        dataKey="budgeted_amount"
                        name={fieldLabel('budgeted_amount')}
                        fill={CHART_COLORS[0]}
                      />
                      <Bar
                        dataKey="actual_amount"
                        name={fieldLabel('actual_amount')}
                        fill={CHART_COLORS[1]}
                      />
                      <Bar
                        dataKey="labor_value"
                        name={fieldLabel('labor_value')}
                        fill={CHART_COLORS[4]}
                      />
                      <Bar
                        dataKey="expense_amount"
                        name={fieldLabel('expense_amount')}
                        fill={CHART_COLORS[2]}
                      />
                    </BarChart>
                  </ResponsiveChart>
                </AnalyticsCard>

                <AnalyticsCard
                  title={t('invoice_and_payment_progress')}
                  description={t('invoice_and_payment_progress_help')}
                  className="col-span-12 xl:col-span-6"
                >
                  <ResponsiveChart>
                    <BarChart
                      data={singleProjectData(
                        projectAnalytics.invoiceProgress,
                        project.name,
                        [
                          'work_value',
                          'invoiced_amount',
                          'paid_amount',
                          'outstanding_amount',
                          'unbilled_amount',
                        ]
                      )}
                      margin={{ top: 8, right: 16, left: 42, bottom: 26 }}
                    >
                      <ChartGrid />
                      <XAxis dataKey="project_name" tick={false} />
                      <YAxis
                        tick={axisTick(colors.$22)}
                        tickFormatter={formatCompact}
                        label={yAxisLabel(
                          t('amount'),
                          colors.$22
                        )}
                      />
                      <Tooltip {...chartTooltipProps(formatFieldValue, true)} />
                      <Legend />
                      <Bar
                        dataKey="work_value"
                        name={fieldLabel('work_value')}
                        fill={CHART_COLORS[0]}
                      />
                      <Bar
                        dataKey="invoiced_amount"
                        name={fieldLabel('invoiced_amount')}
                        fill={CHART_COLORS[2]}
                      />
                      <Bar
                        dataKey="paid_amount"
                        name={fieldLabel('paid_amount')}
                        fill={CHART_COLORS[1]}
                      />
                      <Bar
                        dataKey="outstanding_amount"
                        name={fieldLabel('outstanding_amount')}
                        fill={CHART_COLORS[3]}
                      />
                      <Bar
                        dataKey="unbilled_amount"
                        name={fieldLabel('unbilled_amount')}
                        fill={CHART_COLORS[5]}
                      />
                    </BarChart>
                  </ResponsiveChart>
                </AnalyticsCard>
                </>
              )}
            </div>

            <div className="space-y-4">
              {activeTabIndex === 2 && (
                <>
              <div className="grid grid-cols-12 gap-4">
                <AnalyticsCard
                  title={t('estimated_vs_actual')}
                  className="col-span-12 xl:col-span-6"
                >
                  <ResponsiveChart>
                    <BarChart
                      layout="vertical"
                      data={singleProjectData(
                        projectAnalytics.estimatedVsLogged,
                        project.name,
                        [
                          'estimated',
                          'logged',
                          'billable',
                          'remaining',
                        ]
                      )}
                      margin={{ top: 8, right: 16, left: 16, bottom: 26 }}
                    >
                      <ChartGrid />
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
                      <Tooltip {...chartTooltipProps(formatFieldValue, true)} />
                      <Legend />
                      <Bar
                        dataKey="estimated_hours"
                        name={fieldLabel('estimated_hours')}
                        fill={CHART_COLORS[0]}
                      />
                      <Bar
                        dataKey="logged_hours"
                        name={fieldLabel('logged_hours')}
                        fill={CHART_COLORS[1]}
                      />
                      <Bar
                        dataKey="billable_hours"
                        name={fieldLabel('billable_hours')}
                        fill={CHART_COLORS[4]}
                      />
                      <Bar
                        dataKey="remaining_hours"
                        name={fieldLabel('remaining_hours')}
                        fill={CHART_COLORS[2]}
                      />
                    </BarChart>
                  </ResponsiveChart>
                </AnalyticsCard>

              <AnalyticsCard
                title={t('health_check')}
                className="col-span-12 xl:col-span-6"
              >
                <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="min-h-[240px]">
                    <ResponsiveChart>
                      <BarChart
                        data={singleProjectData(
                          projectAnalytics.projectHealth,
                          project.name,
                          ['health_score']
                        )}
                        margin={{ top: 8, right: 16, left: 42, bottom: 26 }}
                      >
                        <ChartGrid />
                        <XAxis
                          dataKey="project_name"
                          tick={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={axisTick(colors.$22)}
                          tickFormatter={(value) => `${value}%`}
                          label={yAxisLabel(
                            t('health_score'),
                            colors.$22
                          )}
                        />
                        <Tooltip {...chartTooltipProps(formatFieldValue, true)} />
                        <Legend />
                        <Bar
                          dataKey="health_score"
                          name={fieldLabel('health_score')}
                          fill={CHART_COLORS[1]}
                        />
                      </BarChart>
                    </ResponsiveChart>
                  </div>

                  <div className="min-h-[240px]">
                    <ResponsiveChart>
                      <BarChart
                        data={singleProjectData(
                          projectAnalytics.timelineVariance,
                          project.name,
                          ['schedule_variance_days']
                        )}
                        margin={{ top: 8, right: 16, left: 42, bottom: 26 }}
                      >
                        <ChartGrid />
                        <XAxis
                          dataKey="project_name"
                          tick={false}
                        />
                        <YAxis
                          tick={axisTick(colors.$22)}
                          label={yAxisLabel(
                            t('days_ahead'),
                            colors.$22
                          )}
                        />
                        <ReferenceLine y={0} stroke={colors.$22} />
                        <Tooltip {...chartTooltipProps(formatFieldValue, true)} />
                        <Legend />
                        <Bar
                          dataKey="schedule_variance_days"
                          name={fieldLabel('schedule_variance_days')}
                          fill={CHART_COLORS[2]}
                        />
                      </BarChart>
                    </ResponsiveChart>
                  </div>
                </div>
              </AnalyticsCard>

              <AnalyticsCard
                title={t('forecast')}
                className="col-span-12 xl:col-span-6"
                height={240}
              >
                <ForecastSummary
                  forecast={projectAnalytics.forecastCompletion}
                  formatter={formatFieldValue}
                  dateFormat={dateFormat}
                />
              </AnalyticsCard>
              </div>

            <div className="grid grid-cols-12 gap-4">
              <AnalyticsCard
                title={t('team_distribution')}
                className="col-span-12 xl:col-span-6"
              >
                <ResponsiveChart>
                  <BarChart
                    data={normalizeRows(projectAnalytics.teamContribution, [
                      'logged_hours',
                      'billable_hours',
                      'billable_value',
                    ])}
                    margin={{ top: 8, right: 16, left: 42, bottom: 48 }}
                  >
                    <ChartGrid />
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
                      label={yAxisLabel(
                        t('hours'),
                        colors.$22
                      )}
                    />
                    <Tooltip {...chartTooltipProps(formatFieldValue, true)} />
                    <Legend />
                    <Bar
                      dataKey="logged_hours"
                      name={fieldLabel('logged_hours')}
                      fill={CHART_COLORS[0]}
                    />
                    <Bar
                      dataKey="billable_hours"
                      name={fieldLabel('billable_hours')}
                      fill={CHART_COLORS[1]}
                    />
                  </BarChart>
                </ResponsiveChart>
              </AnalyticsCard>

              <AnalyticsCard
                title={t('task_distribution')}
                className="col-span-12 xl:col-span-6"
                height={taskTimeDistributionHeight}
              >
                <ResponsiveChart>
                  <BarChart
                    layout="vertical"
                    data={timeDistributionData}
                    margin={{ top: 8, right: 16, left: 8, bottom: 26 }}
                  >
                    <ChartGrid />
                    <XAxis
                      type="number"
                      tick={axisTick(colors.$22)}
                      tickFormatter={formatCompact}
                      label={xAxisLabel(
                        t('hours'),
                        colors.$22
                      )}
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
                      {...chartTooltipProps(formatFieldValue, {
                        itemOnly: true,
                        labelKey: 'description',
                      })}
                    />
                    <Legend />
                    <Bar
                      dataKey="logged_hours"
                      name={fieldLabel('logged_hours')}
                      fill={CHART_COLORS[0]}
                    />
                    <Bar
                      dataKey="billable_hours"
                      name={fieldLabel('billable_hours')}
                      fill={CHART_COLORS[1]}
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
                    data={normalizeRows(projectAnalytics.velocityTrend, [
                      'hours',
                      'billable_hours',
                      'task_value',
                    ])}
                    margin={{ top: 8, right: 16, left: 42, bottom: 26 }}
                  >
                    <ChartGrid />
                    <XAxis
                      dataKey="period"
                      tick={axisTick(colors.$22)}
                    />
                    <YAxis
                      tick={axisTick(colors.$22)}
                      tickFormatter={formatCompact}
                      label={yAxisLabel(
                        t('hours'),
                        colors.$22
                      )}
                    />
                    <Tooltip {...chartTooltipProps(formatFieldValue)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      name={fieldLabel('hours')}
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="billable_hours"
                      name={fieldLabel('billable_hours')}
                      stroke={CHART_COLORS[1]}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveChart>
              </AnalyticsCard>
            </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-12 gap-4">
              {activeTabIndex === 3 && (
                <>
              <AnalyticsCard
                title={t('expenses')}
                className="col-span-12 xl:col-span-6"
              >
                {projectAnalytics.expenseBreakdown.length <= 6 ? (
                  <ResponsiveChart>
                    <PieChart>
                      <Pie
                        data={expenseBreakdownData}
                        dataKey="expense_amount"
                        nameKey="category_name"
                        cx="34%"
                        cy="50%"
                        innerRadius={54}
                        outerRadius={92}
                        paddingAngle={2}
                      >
                        {expenseBreakdownData.map((entry, index) => (
                          <Cell
                            key={String(entry.category_name ?? index)}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        {...chartTooltipProps(formatFieldValue, {
                          labelKey: 'category_name',
                          nameKey: 'category_name',
                          percentTotal: expenseBreakdownTotal,
                          showPercent: true,
                        })}
                      />
                      <Legend
                        align="right"
                        iconType="circle"
                        layout="vertical"
                        verticalAlign="middle"
                        wrapperStyle={{
                          color: colors.$22,
                          fontSize: 12,
                          lineHeight: '18px',
                          maxWidth: 168,
                          paddingLeft: 12,
                          right: 8,
                        }}
                        formatter={(value) => (
                          <span
                            style={{
                              color: colors.$22,
                              display: 'inline-block',
                              maxWidth: 132,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              verticalAlign: 'middle',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {cleanTooltipText(value) || '-'}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveChart>
                ) : (
                  <ResponsiveChart>
                    <BarChart
                      data={expenseBreakdownData}
                      margin={{ top: 8, right: 16, left: 42, bottom: 48 }}
                    >
                      <ChartGrid />
                      <XAxis
                        dataKey="category_name"
                        tick={axisTick(colors.$22)}
                        angle={-25}
                        textAnchor="end"
                        height={54}
                        label={xAxisLabel(
                          t('expense_category'),
                          colors.$22,
                          -12
                        )}
                      />
                      <YAxis
                        tick={axisTick(colors.$22)}
                        tickFormatter={formatCompact}
                        label={yAxisLabel(
                          t('amount'),
                          colors.$22
                        )}
                      />
                      <Tooltip {...chartTooltipProps(formatFieldValue, true)} />
                      <Legend />
                      <Bar
                        dataKey="expense_amount"
                        name={fieldLabel('expense_amount')}
                        fill={CHART_COLORS[2]}
                      />
                    </BarChart>
                  </ResponsiveChart>
                )}
              </AnalyticsCard>

              <AnalyticsCard
                title={`${t('expenses')} / ${t('time')}`}
                className="col-span-12 xl:col-span-8"
              >
                <ResponsiveChart>
                  <LineChart
                    data={normalizeRows(projectAnalytics.cumulativeSpend, [
                      'cumulative_labor_value',
                      'cumulative_expense_amount',
                      'cumulative_actual_amount',
                    ])}
                    margin={{ top: 8, right: 16, left: 42, bottom: 26 }}
                  >
                    <ChartGrid />
                    <XAxis
                      dataKey="period"
                      tick={axisTick(colors.$22)}
                      label={xAxisLabel(
                        t('period'),
                        colors.$22
                      )}
                    />
                    <YAxis
                      tick={axisTick(colors.$22)}
                      tickFormatter={formatCompact}
                      label={yAxisLabel(
                        t('amount'),
                        colors.$22
                      )}
                    />
                    <Tooltip {...chartTooltipProps(formatFieldValue)} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cumulative_labor_value"
                      name={fieldLabel('cumulative_labor_value')}
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative_expense_amount"
                      name={fieldLabel('cumulative_expense_amount')}
                      stroke={CHART_COLORS[2]}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative_actual_amount"
                      name={fieldLabel('cumulative_actual_amount')}
                      stroke={CHART_COLORS[1]}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveChart>
              </AnalyticsCard>
                </>
              )}
            </div>

            <div>
              {activeTabIndex === 4 && (
                <Burnup
                  project={project}
                  includeDrafts={includeDrafts}
                  onIncludeDraftsChange={setIncludeDrafts}
                  showIncludeDraftsToggle={false}
                />
              )}
            </div>
          </TabGroup>

        </>
      )}
    </section>
  );
}

function AnalyticsCard({
  title,
  children,
  description,
  className,
  height = 320,
}: AnalyticsCardProps) {
  const colors = useColorScheme();

  return (
    <Card
      title={title}
      description={description}
      className={classNames('shadow-sm', className)}
      headerClassName="px-3 sm:px-4 py-3"
      childrenClassName="px-4 pb-4"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutHeaderPadding
    >
      <div style={{ height }}>{children}</div>
    </Card>
  );
}

function StatCard({ label, value, detail, accent }: StatCardProps) {
  const colors = useColorScheme();

  return (
    <div
      className="rounded-md border p-3"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium" style={{ color: colors.$22 }}>
          {label}
        </span>
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full"
          style={{ backgroundColor: accent }}
        />
      </div>

      <div className="mt-2 truncate text-lg font-semibold">{value}</div>

      {/* {detail && (
        <div className="mt-1 truncate text-xs" style={{ color: colors.$22 }}>
          {detail}
        </div>
      )} */}
    </div>
  );
}

function ResponsiveChart({ children }: { children: ReactElement }) {
  return (
    <div className="h-full min-h-[240px] min-w-0 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function renderOverviewContent(
  overviewContent: ProjectAnalyticsOverviewContent | undefined,
  forecastCard: ReactNode
) {
  if (typeof overviewContent === 'function') {
    return overviewContent(forecastCard);
  }

  return (
    <>
      {overviewContent}
      {forecastCard}
    </>
  );
}

function ChartGrid() {
  return <CartesianGrid strokeDasharray="3 3" vertical={false} />;
}

function chartTooltipProps(
  formatter: Formatter,
  options: boolean | ChartTooltipOptions = false
) {
  const tooltipOptions =
    typeof options === 'boolean' ? { itemOnly: options } : options;

  return {
    content: (
      <ChartTooltipContent formatter={formatter} options={tooltipOptions} />
    ),
    cursor: { fill: 'transparent' },
    wrapperStyle: { outline: 'none' },
    ...(tooltipOptions.itemOnly && { shared: false }),
  };
}

function ChartTooltipContent({
  active,
  formatter,
  label,
  options,
  payload,
}: ChartTooltipContentProps & {
  formatter: Formatter;
  options?: ChartTooltipOptions;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  if (!active || !payload?.length) {
    return null;
  }

  const displayLabel = resolveTooltipLabel(label, payload, options);

  return (
    <div
      className="rounded-md border p-3 text-sm shadow-lg"
      style={{
        backgroundColor: colors.$1,
        borderColor: colors.$24,
        color: colors.$3,
      }}
    >
      {displayLabel && (
        <div className="mb-2 font-medium" style={{ color: colors.$3 }}>
          {displayLabel}
        </div>
      )}

      <div className="space-y-1">
        {payload.map((item, index) => {
          const dataKey = String(item.dataKey ?? item.name ?? index);
          const percent = options?.showPercent
            ? resolveTooltipPercent(item, options.percentTotal)
            : null;
          const swatchColor = item.color || item.fill || colors.$22;
          const itemLabel = resolveTooltipItemLabel(t, item, dataKey, options);

          return (
            <div
              key={`${dataKey}-${index}`}
              className="flex items-center justify-between gap-6"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: swatchColor }}
                />
                <span className="truncate">{itemLabel}</span>
              </div>

              <span className="whitespace-nowrap font-medium">
                {formatter(dataKey, item.value)}
                {percent !== null && (
                  <span style={{ color: colors.$22 }}>
                    {' '}
                    ({formatPercent(percent)})
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ForecastSummary({
  forecast,
  formatter,
  dateFormat,
}: {
  forecast?: ForecastCompletion;
  formatter: Formatter;
  dateFormat: string;
}) {
  const [tFn] = useTranslation();
  const t = tFn as TranslateFn;

  if (!forecast) {
    return (
      <EmptyState>
        {t('no_forecast_data')}
      </EmptyState>
    );
  }

  const rows = [
    {
      label: resolveFieldLabel(t, 'average_daily_velocity'),
      value: formatter(
        'average_daily_velocity',
        forecast.average_daily_velocity
      ),
    },
    {
      label: t('remaining_hours'),
      value: formatter('remaining_hours', forecast.remaining_hours),
    },
    {
      label: t('forecast_finish'),
      value: forecast.forecast_finish_date
        ? formatDate(forecast.forecast_finish_date, dateFormat)
        : '-',
    },
    {
      label: resolveFieldLabel(t, 'schedule_variance_days'),
      value: formatter(
        'schedule_variance_days',
        forecast.schedule_variance_days
      ),
    },
  ];

  return <MetricTable rows={rows} />;
}

function RecentActivityTable({
  rows,
  formatter,
  dateFormat,
}: {
  rows: ActivityRow[];
  formatter: Formatter;
  dateFormat: string;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  if (!rows.length) {
    return (
      <EmptyState>
        {t('no_recent_activity')}
      </EmptyState>
    );
  }

  return (
    <div className="max-h-[280px] overflow-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr style={{ color: colors.$22 }}>
            <th className="py-2 pr-3 font-medium">
              {t('date')}
            </th>
            <th className="py-2 pr-3 font-medium">
              {t('activity')}
            </th>
            <th className="py-2 text-right font-medium">
              {t('amount')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.date}-${row.type}-${index}`}
              className="border-t"
              style={{ borderColor: colors.$20 }}
            >
              <td className="py-2 pr-3 align-top">
                {row.date ? formatDate(row.date, dateFormat) : '-'}
              </td>
              <td className="py-2 pr-3 align-top">
                <div className="flex flex-col gap-1">
                  <span>{row.label || row.type || '-'}</span>
                  {row.type && <Badge>{row.type}</Badge>}
                </div>
              </td>
              <td className="py-2 text-right align-top">
                {formatter('amount', row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MetricTable({
  rows,
}: {
  rows: { label: string; value: ReactNode }[];
}) {
  const colors = useColorScheme();

  return (
    <div className="divide-y text-sm" style={{ borderColor: colors.$20 }}>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-4 py-3"
          style={{ borderColor: colors.$20 }}
        >
          <span style={{ color: colors.$22 }}>{row.label}</span>
          <span className="text-right font-medium">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  const colors = useColorScheme();

  return (
    <div
      className="flex h-full min-h-[160px] items-center justify-center rounded-md border border-dashed px-4 text-center text-sm"
      style={{ borderColor: colors.$24, color: colors.$22 }}
    >
      {children}
    </div>
  );
}

function findProjectRow<T extends ProjectRow>(
  rows: T[] | undefined,
  projectId: string
) {
  return rows?.find((row) => idsMatch(row.project_id, projectId));
}

function getNestedRows<T extends ChartDatum>(
  feed: ProjectNested<T[]>[] | undefined,
  projectId: string
): T[] {
  const projectFeed = feed?.find((row) => idsMatch(row.project_id, projectId));

  if (!projectFeed) {
    return [];
  }

  const nestedRows = Object.entries(projectFeed).find(
    ([key, value]) => !KEY_FIELDS.includes(key) && Array.isArray(value)
  )?.[1];

  return Array.isArray(nestedRows) ? (nestedRows as T[]) : [];
}

function singleProjectData<T extends ProjectRow>(
  row: T | undefined,
  projectName: string,
  numericKeys: string[]
): ChartDatum[] {
  if (!row) {
    return [];
  }

  return normalizeRows(
    [
      {
        ...row,
        project_name: row.project_name || projectName,
      },
    ],
    numericKeys
  );
}

function normalizeTaskDistributionRows(
  rows: TaskDistributionRow[] | undefined,
  t: TranslateFn
): ChartDatum[] {
  const taskLabel = t('task');

  return normalizeRows(rows, [
    'logged_hours',
    'billable_hours',
    'billable_value',
  ]).map((row, index) => ({
    ...row,
    description:
      cleanTooltipText(row.description) || `${taskLabel} ${index + 1}`,
  }));
}

function normalizeRows<T extends ChartDatum>(
  rows: T[] | undefined,
  numericKeys: string[]
): ChartDatum[] {
  return (rows || []).map((row) => {
    const normalized: ChartDatum = { ...row };

    numericKeys.forEach((key) => {
      normalized[key] = toNumber(row[key]);
    });

    return normalized;
  });
}

function idsMatch(left: NumberLike, right: string) {
  return String(left ?? '') === String(right ?? '');
}

function toNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function sumChartValues(rows: ChartDatum[], key: string) {
  return rows.reduce((total, row) => total + toNumber(row[key]), 0);
}

function formatCompact(value: unknown) {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

function formatPercent(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 1,
  }).format(value * 100) + '%';
}

function resolveFieldLabel(t: TranslateFn, key: string) {
  const translationKey = FIELD_LABELS[key];

  return translationKey ? t(translationKey) : key.replace(/_/g, ' ');
}

function resolveTooltipLabel(
  label: string | number | undefined,
  payload: ChartTooltipPayloadItem[],
  options?: ChartTooltipOptions
) {
  const labelFromPayload = options?.labelKey
    ? readPayloadValue(payload[0], options.labelKey)
    : undefined;

  return cleanTooltipText(labelFromPayload) || cleanTooltipText(label);
}

function resolveTooltipItemLabel(
  t: TranslateFn,
  item: ChartTooltipPayloadItem,
  dataKey: string,
  options?: ChartTooltipOptions
) {
  const nameFromPayload = options?.nameKey
    ? readPayloadValue(item, options.nameKey)
    : undefined;

  return (
    cleanTooltipText(nameFromPayload) ||
    cleanTooltipText(item.name) ||
    resolveFieldLabel(t, dataKey)
  );
}

function resolveTooltipPercent(
  item: ChartTooltipPayloadItem,
  total: number | undefined
) {
  const payloadPercent = toFiniteNumber(item.percent);

  if (payloadPercent !== null) {
    return payloadPercent;
  }

  if (!total) {
    return null;
  }

  return toNumber(item.value) / total;
}

function readPayloadValue(item: ChartTooltipPayloadItem, key: string) {
  if (item.payload?.[key] !== undefined) {
    return item.payload[key];
  }

  const nestedPayload = item.payload?.payload;

  if (isChartDatum(nestedPayload) && nestedPayload[key] !== undefined) {
    return nestedPayload[key];
  }

  return undefined;
}

function cleanTooltipText(value: unknown) {
  const text = String(value ?? '').trim();

  return text || undefined;
}

function truncateAxisTick(value: unknown, maxLength: number) {
  const text = cleanTooltipText(value) || '-';

  return text.length > maxLength
    ? `${text.slice(0, Math.max(0, maxLength - 1))}...`
    : text;
}

function toFiniteNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function isChartDatum(value: unknown): value is ChartDatum {
  return Boolean(value) && typeof value === 'object';
}

function axisTick(fill: string) {
  return { fill, fontSize: 12 };
}

function xAxisLabel(value: string, fill: string, offset = -6) {
  return {
    value,
    position: 'insideBottom',
    offset,
    style: { fill, fontSize: 12 },
  };
}

function yAxisLabel(
  value: string,
  fill: string,
  position: 'insideLeft' | 'insideRight' = 'insideLeft'
) {
  return {
    value,
    angle: position === 'insideRight' ? 90 : -90,
    position,
    style: { textAnchor: 'middle', fill, fontSize: 12 },
  };
}
