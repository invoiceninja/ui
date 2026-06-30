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

type ChartTooltipPayloadItem = {
  color?: string;
  dataKey?: string | number;
  fill?: string;
  name?: string | number;
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

interface ProjectAnalyticsProps {
  project: Project;
  overviewContent?: ReactNode;
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

const FIELD_LABELS: Record<string, string> = {
  actual_amount: 'Actual project value',
  average_daily_velocity: 'Daily velocity',
  billable_hours: 'Billable hours',
  billable_value: 'Billable value',
  budget_utilization: 'Budget used',
  budgeted_amount: 'Budgeted project value',
  cumulative_actual_amount: 'Actual spend',
  cumulative_expense_amount: 'Expenses',
  cumulative_labor_value: 'Labor',
  estimated_hours: 'Estimated hours',
  expense_amount: 'Expense amount',
  expense_count: 'Expense count',
  health_score: 'Health score',
  hours: 'Logged hours',
  invoice_progress: 'Invoice progress',
  invoiced_amount: 'Invoiced amount',
  labor_value: 'Labor value',
  logged_hours: 'Logged hours',
  margin_ratio: 'Margin %',
  net_margin: 'Net margin',
  outstanding_amount: 'Outstanding amount',
  paid_amount: 'Paid amount',
  paid_progress: 'Paid progress',
  remaining_hours: 'Remaining hours',
  schedule_variance_days: 'Schedule variance',
  task_value: 'Task value',
  unbilled_amount: 'Unbilled amount',
  unbilled_hours: 'Unbilled hours',
  work_value: 'Work value',
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
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const formatMoney = useFormatMoney();
  const formatNumber = useFormatNumber();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [hoveredBarDataKey, setHoveredBarDataKey] = useState<string | null>(
    null
  );

  const barHoverProps = (dataKey: string) => ({
    onMouseEnter: () => setHoveredBarDataKey(dataKey),
    onMouseLeave: () => setHoveredBarDataKey(null),
  });

  const analytics = useQuery<ProjectAnalyticsResponse>({
    queryKey: ['/api/v1/charts/project_analytics', includeDrafts],
    queryFn: () =>
      request('POST', endpoint('/api/v1/charts/project_analytics'), {
        include_drafts: includeDrafts,
      }).then((response) => response.data),
    staleTime: Infinity,
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
    Boolean(projectAnalytics?.cumulativeSpend.length) ||
    Boolean(projectAnalytics?.recentActivity.length);

  const statCards = [
    {
      label: 'Budgeted',
      value: formatFieldValue(
        'budgeted_amount',
        projectAnalytics?.budgetSummary?.budgeted_amount ??
          projectAnalytics?.budgetVsActual?.budgeted_amount
      ),
      detail: 'planned value',
      accent: CHART_COLORS[0],
    },
    {
      label: 'Actual',
      value: formatFieldValue(
        'actual_amount',
        projectAnalytics?.budgetSummary?.actual_amount ??
          projectAnalytics?.budgetVsActual?.actual_amount
      ),
      detail: 'labor and expenses',
      accent: CHART_COLORS[1],
    },
    {
      label: 'Invoiced',
      value: formatFieldValue(
        'invoiced_amount',
        projectAnalytics?.invoiceProgress?.invoiced_amount ??
          projectAnalytics?.budgetSummary?.invoiced_amount
      ),
      detail: 'sent to client',
      accent: CHART_COLORS[2],
    },
    {
      label: 'Paid',
      value: formatFieldValue(
        'paid_amount',
        projectAnalytics?.invoiceProgress?.paid_amount ??
          projectAnalytics?.budgetSummary?.paid_amount
      ),
      detail: 'collected',
      accent: CHART_COLORS[3],
    },
    {
      label: 'Outstanding',
      value: formatFieldValue(
        'outstanding_amount',
        projectAnalytics?.invoiceProgress?.outstanding_amount ??
          projectAnalytics?.budgetSummary?.outstanding_amount
      ),
      detail: 'remaining invoice balance',
      accent: CHART_COLORS[4],
    },
    {
      label: 'Health',
      value: formatFieldValue(
        'health_score',
        projectAnalytics?.projectHealth?.health_score
      ),
      detail: projectAnalytics?.projectHealth?.health_status || 'status',
      accent: CHART_COLORS[5],
    },
    {
      label: 'Logged',
      value: formatFieldValue(
        'logged_hours',
        projectAnalytics?.estimatedVsLogged?.logged_hours
      ),
      detail: 'tracked time',
      accent: CHART_COLORS[0],
    },
    {
      label: 'Unbilled',
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
            label="Include drafts"
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
          No analytics data is available for this project yet.
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
              'Overview',
              'Financials',
              'Time',
              'Spend',
              'Activity',
              'Burn-up',
            ]}
            withoutVerticalMargin
            childrenClassName="mt-4"
          >
            <div className="space-y-4">
              {overviewContent}
            </div>

            <div className="grid grid-cols-12 gap-4">
              <AnalyticsCard
                title="Profitability and margin"
                description="Compares invoiced amount, expenses, and net margin, with margin percentage on the right axis."
                className="col-span-12 xl:col-span-8"
                height={240}
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
                      label={xAxisLabel('Project', colors.$22)}
                    />
                    <YAxis
                      yAxisId="amount"
                      tick={axisTick(colors.$22)}
                      tickFormatter={formatCompact}
                      label={yAxisLabel('Amount', colors.$22)}
                    />
                    <YAxis
                      yAxisId="ratio"
                      orientation="right"
                      domain={[0, 1]}
                      tick={axisTick(colors.$22)}
                      tickFormatter={(value) => `${toNumber(value) * 100}%`}
                      label={yAxisLabel(
                        'Margin %',
                        colors.$22,
                        'insideRight'
                      )}
                    />
                    <ChartTooltip
                      formatter={formatFieldValue}
                      highlightedDataKey={hoveredBarDataKey}
                    />
                    <Legend />
                    <Bar
                      {...barHoverProps('invoiced_amount')}
                      yAxisId="amount"
                      dataKey="invoiced_amount"
                      name={FIELD_LABELS.invoiced_amount}
                      fill={CHART_COLORS[0]}
                    />
                    <Bar
                      {...barHoverProps('expense_amount')}
                      yAxisId="amount"
                      dataKey="expense_amount"
                      name={FIELD_LABELS.expense_amount}
                      fill={CHART_COLORS[2]}
                    />
                    <Bar
                      {...barHoverProps('net_margin')}
                      yAxisId="amount"
                      dataKey="net_margin"
                      name={FIELD_LABELS.net_margin}
                      fill={CHART_COLORS[1]}
                    />
                    <Line
                      yAxisId="ratio"
                      type="monotone"
                      dataKey="margin_ratio"
                      name={FIELD_LABELS.margin_ratio}
                      stroke={CHART_COLORS[3]}
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveChart>
              </AnalyticsCard>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4">
                <AnalyticsCard
                  title="Budget vs actual value"
                  description="Compares the planned project value with actual labor and expense value."
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
                      <XAxis
                        dataKey="project_name"
                        tick={false}
                        label={xAxisLabel('Project', colors.$22)}
                      />
                      <YAxis
                        tick={axisTick(colors.$22)}
                        tickFormatter={formatCompact}
                        label={yAxisLabel('Amount', colors.$22)}
                      />
                      <ChartTooltip
                        formatter={formatFieldValue}
                        highlightedDataKey={hoveredBarDataKey}
                      />
                      <Legend />
                      <Bar
                        {...barHoverProps('budgeted_amount')}
                        dataKey="budgeted_amount"
                        name={FIELD_LABELS.budgeted_amount}
                        fill={CHART_COLORS[0]}
                      />
                      <Bar
                        {...barHoverProps('actual_amount')}
                        dataKey="actual_amount"
                        name={FIELD_LABELS.actual_amount}
                        fill={CHART_COLORS[1]}
                      />
                      <Bar
                        {...barHoverProps('labor_value')}
                        dataKey="labor_value"
                        name={FIELD_LABELS.labor_value}
                        fill={CHART_COLORS[4]}
                      />
                      <Bar
                        {...barHoverProps('expense_amount')}
                        dataKey="expense_amount"
                        name={FIELD_LABELS.expense_amount}
                        fill={CHART_COLORS[2]}
                      />
                    </BarChart>
                  </ResponsiveChart>
                </AnalyticsCard>

                <AnalyticsCard
                  title="Estimated vs logged hours"
                  description="Compares estimated, logged, billable, and remaining project hours."
                  className="col-span-12 xl:col-span-6"
                >
                  <ResponsiveChart>
                    <BarChart
                      layout="vertical"
                      data={singleProjectData(
                        projectAnalytics.estimatedVsLogged,
                        project.name,
                        [
                          'estimated_hours',
                          'logged_hours',
                          'billable_hours',
                          'remaining_hours',
                        ]
                      )}
                      margin={{ top: 8, right: 16, left: 16, bottom: 26 }}
                    >
                      <ChartGrid />
                      <XAxis
                        type="number"
                        tick={axisTick(colors.$22)}
                        tickFormatter={formatCompact}
                        label={xAxisLabel('Hours', colors.$22)}
                      />
                      <YAxis
                        type="category"
                        dataKey="project_name"
                        tick={false}
                        width={12}
                        label={yAxisLabel('Project', colors.$22)}
                      />
                      <ChartTooltip
                        formatter={formatFieldValue}
                        highlightedDataKey={hoveredBarDataKey}
                      />
                      <Legend />
                      <Bar
                        {...barHoverProps('estimated_hours')}
                        dataKey="estimated_hours"
                        name={FIELD_LABELS.estimated_hours}
                        fill={CHART_COLORS[0]}
                      />
                      <Bar
                        {...barHoverProps('logged_hours')}
                        dataKey="logged_hours"
                        name={FIELD_LABELS.logged_hours}
                        fill={CHART_COLORS[1]}
                      />
                      <Bar
                        {...barHoverProps('billable_hours')}
                        dataKey="billable_hours"
                        name={FIELD_LABELS.billable_hours}
                        fill={CHART_COLORS[4]}
                      />
                      <Bar
                        {...barHoverProps('remaining_hours')}
                        dataKey="remaining_hours"
                        name={FIELD_LABELS.remaining_hours}
                        fill={CHART_COLORS[2]}
                      />
                    </BarChart>
                  </ResponsiveChart>
                </AnalyticsCard>

              <AnalyticsCard
                title="Invoice and payment progress"
                description="Shows earned work value against invoiced, paid, outstanding, and unbilled amounts."
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
                    <XAxis
                      dataKey="project_name"
                      tick={false}
                      label={xAxisLabel('Project', colors.$22)}
                    />
                    <YAxis
                      tick={axisTick(colors.$22)}
                      tickFormatter={formatCompact}
                      label={yAxisLabel('Amount', colors.$22)}
                    />
                    <ChartTooltip
                      formatter={formatFieldValue}
                      highlightedDataKey={hoveredBarDataKey}
                    />
                    <Legend />
                    <Bar
                      {...barHoverProps('work_value')}
                      dataKey="work_value"
                      name={FIELD_LABELS.work_value}
                      fill={CHART_COLORS[0]}
                    />
                    <Bar
                      {...barHoverProps('invoiced_amount')}
                      dataKey="invoiced_amount"
                      name={FIELD_LABELS.invoiced_amount}
                      fill={CHART_COLORS[2]}
                    />
                    <Bar
                      {...barHoverProps('paid_amount')}
                      dataKey="paid_amount"
                      name={FIELD_LABELS.paid_amount}
                      fill={CHART_COLORS[1]}
                    />
                    <Bar
                      {...barHoverProps('outstanding_amount')}
                      dataKey="outstanding_amount"
                      name={FIELD_LABELS.outstanding_amount}
                      fill={CHART_COLORS[3]}
                    />
                    <Bar
                      {...barHoverProps('unbilled_amount')}
                      dataKey="unbilled_amount"
                      name={FIELD_LABELS.unbilled_amount}
                      fill={CHART_COLORS[5]}
                    />
                  </BarChart>
                </ResponsiveChart>
              </AnalyticsCard>

              <AnalyticsCard
                title="Project health and schedule variance"
                description="Shows project health score and schedule variance from the forecast."
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
                          label={xAxisLabel('Project', colors.$22)}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={axisTick(colors.$22)}
                          tickFormatter={(value) => `${value}%`}
                          label={yAxisLabel('Health score', colors.$22)}
                        />
                        <ChartTooltip
                          formatter={formatFieldValue}
                          highlightedDataKey={hoveredBarDataKey}
                        />
                        <Legend />
                        <Bar
                          {...barHoverProps('health_score')}
                          dataKey="health_score"
                          name={FIELD_LABELS.health_score}
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
                          label={xAxisLabel('Project', colors.$22)}
                        />
                        <YAxis
                          tick={axisTick(colors.$22)}
                          label={yAxisLabel('Days variance', colors.$22)}
                        />
                        <ReferenceLine y={0} stroke={colors.$22} />
                        <ChartTooltip
                          formatter={formatFieldValue}
                          highlightedDataKey={hoveredBarDataKey}
                        />
                        <Legend />
                        <Bar
                          {...barHoverProps('schedule_variance_days')}
                          dataKey="schedule_variance_days"
                          name={FIELD_LABELS.schedule_variance_days}
                          fill={CHART_COLORS[2]}
                        />
                      </BarChart>
                    </ResponsiveChart>
                  </div>
                </div>
              </AnalyticsCard>

              <AnalyticsCard
                title="Forecast completion"
                description="Summarizes projected completion timing from current project velocity."
                className="col-span-12 xl:col-span-4"
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
                title="Team time contribution"
                description="Shows logged and billable hours by team member."
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
                      label={xAxisLabel('Team member', colors.$22, -12)}
                    />
                    <YAxis
                      tick={axisTick(colors.$22)}
                      tickFormatter={formatCompact}
                      label={yAxisLabel('Hours', colors.$22)}
                    />
                    <ChartTooltip
                      formatter={formatFieldValue}
                      highlightedDataKey={hoveredBarDataKey}
                    />
                    <Legend />
                    <Bar
                      {...barHoverProps('logged_hours')}
                      dataKey="logged_hours"
                      name={FIELD_LABELS.logged_hours}
                      fill={CHART_COLORS[0]}
                    />
                    <Bar
                      {...barHoverProps('billable_hours')}
                      dataKey="billable_hours"
                      name={FIELD_LABELS.billable_hours}
                      fill={CHART_COLORS[1]}
                    />
                  </BarChart>
                </ResponsiveChart>
              </AnalyticsCard>

              <AnalyticsCard
                title="Task time distribution"
                description="Shows logged and billable hours by task or work item."
                className="col-span-12 xl:col-span-6"
              >
                <ResponsiveChart>
                  <BarChart
                    layout="vertical"
                    data={normalizeRows(projectAnalytics.timeDistribution, [
                      'logged_hours',
                      'billable_hours',
                      'billable_value',
                    ])}
                    margin={{ top: 8, right: 16, left: 52, bottom: 26 }}
                  >
                    <ChartGrid />
                    <XAxis
                      type="number"
                      tick={axisTick(colors.$22)}
                      tickFormatter={formatCompact}
                      label={xAxisLabel('Hours', colors.$22)}
                    />
                    <YAxis
                      type="category"
                      dataKey="description"
                      tick={axisTick(colors.$22)}
                      width={120}
                      label={yAxisLabel('Task', colors.$22)}
                    />
                    <ChartTooltip
                      formatter={formatFieldValue}
                      highlightedDataKey={hoveredBarDataKey}
                    />
                    <Legend />
                    <Bar
                      {...barHoverProps('logged_hours')}
                      dataKey="logged_hours"
                      name={FIELD_LABELS.logged_hours}
                      fill={CHART_COLORS[0]}
                    />
                    <Bar
                      {...barHoverProps('billable_hours')}
                      dataKey="billable_hours"
                      name={FIELD_LABELS.billable_hours}
                      fill={CHART_COLORS[1]}
                    />
                  </BarChart>
                </ResponsiveChart>
              </AnalyticsCard>

              <AnalyticsCard
                title="Time velocity trend"
                description="Shows tracked and billable hours over each reporting period."
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
                      label={xAxisLabel('Period', colors.$22)}
                    />
                    <YAxis
                      tick={axisTick(colors.$22)}
                      tickFormatter={formatCompact}
                      label={yAxisLabel('Hours', colors.$22)}
                    />
                    <ChartTooltip formatter={formatFieldValue} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      name="Hours"
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="billable_hours"
                      name={FIELD_LABELS.billable_hours}
                      stroke={CHART_COLORS[1]}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveChart>
              </AnalyticsCard>
            </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <AnalyticsCard
                title="Expense breakdown by category"
                description="Shows project expenses grouped by category."
                className="col-span-12 xl:col-span-6"
              >
                {projectAnalytics.expenseBreakdown.length <= 6 ? (
                  <ResponsiveChart>
                    <PieChart>
                      <Pie
                        data={normalizeRows(projectAnalytics.expenseBreakdown, [
                          'expense_amount',
                          'expense_count',
                        ])}
                        dataKey="expense_amount"
                        nameKey="category_name"
                        innerRadius={54}
                        outerRadius={92}
                        paddingAngle={2}
                      >
                        {projectAnalytics.expenseBreakdown.map(
                          (entry, index) => (
                            <Cell
                              key={entry.category_name ?? index}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          )
                        )}
                      </Pie>
                      <ChartTooltip formatter={formatFieldValue} />
                      <Legend />
                    </PieChart>
                  </ResponsiveChart>
                ) : (
                  <ResponsiveChart>
                    <BarChart
                      data={normalizeRows(projectAnalytics.expenseBreakdown, [
                        'expense_amount',
                        'expense_count',
                      ])}
                      margin={{ top: 8, right: 16, left: 42, bottom: 48 }}
                    >
                      <ChartGrid />
                      <XAxis
                        dataKey="category_name"
                        tick={axisTick(colors.$22)}
                        angle={-25}
                        textAnchor="end"
                        height={54}
                        label={xAxisLabel('Expense category', colors.$22, -12)}
                      />
                      <YAxis
                        tick={axisTick(colors.$22)}
                        tickFormatter={formatCompact}
                        label={yAxisLabel('Amount', colors.$22)}
                      />
                      <ChartTooltip
                        formatter={formatFieldValue}
                        highlightedDataKey={hoveredBarDataKey}
                      />
                      <Legend />
                      <Bar
                        {...barHoverProps('expense_amount')}
                        dataKey="expense_amount"
                        name={FIELD_LABELS.expense_amount}
                        fill={CHART_COLORS[2]}
                      />
                    </BarChart>
                  </ResponsiveChart>
                )}
              </AnalyticsCard>

              <AnalyticsCard
                title="Cumulative spend over time"
                description="Shows cumulative labor, expense, and total project spend over time."
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
                      label={xAxisLabel('Period', colors.$22)}
                    />
                    <YAxis
                      tick={axisTick(colors.$22)}
                      tickFormatter={formatCompact}
                      label={yAxisLabel('Amount', colors.$22)}
                    />
                    <ChartTooltip formatter={formatFieldValue} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cumulative_labor_value"
                      name={FIELD_LABELS.cumulative_labor_value}
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative_expense_amount"
                      name={FIELD_LABELS.cumulative_expense_amount}
                      stroke={CHART_COLORS[2]}
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative_actual_amount"
                      name={FIELD_LABELS.cumulative_actual_amount}
                      stroke={CHART_COLORS[1]}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveChart>
              </AnalyticsCard>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <AnalyticsCard
                title="Recent project activity"
                description="Lists recent project activity and the related amount."
                className="col-span-12 xl:col-span-4"
              >
                <RecentActivityTable
                  rows={projectAnalytics.recentActivity}
                  formatter={formatFieldValue}
                  dateFormat={dateFormat}
                />
              </AnalyticsCard>
            </div>

            <div>
              <Burnup
                project={project}
                includeDrafts={includeDrafts}
                onIncludeDraftsChange={setIncludeDrafts}
                showIncludeDraftsToggle={false}
              />
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

      {detail && (
        <div className="mt-1 truncate text-xs" style={{ color: colors.$22 }}>
          {detail}
        </div>
      )}
    </div>
  );
}

function ResponsiveChart({ children }: { children: ReactElement }) {
  return (
    <div className="h-full min-h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function ChartGrid() {
  return <CartesianGrid strokeDasharray="3 3" vertical={false} />;
}

function ChartTooltip({
  formatter,
  highlightedDataKey,
}: {
  formatter: Formatter;
  highlightedDataKey?: string | null;
}) {
  const colors = useColorScheme();

  const Content = ({ active, label, payload }: ChartTooltipContentProps) => {
    if (!active || !payload?.length) {
      return null;
    }

    const filteredPayload = highlightedDataKey
      ? payload.filter((item) => String(item.dataKey) === highlightedDataKey)
      : payload;
    const displayPayload = filteredPayload.length ? filteredPayload : payload;

    return (
      <div
        className="rounded-md border p-3 text-sm shadow-lg"
        style={{
          backgroundColor: colors.$1,
          borderColor: colors.$24,
          color: colors.$3,
        }}
      >
        {label !== undefined && (
          <div className="mb-2 font-medium" style={{ color: colors.$3 }}>
            {label}
          </div>
        )}

        <div className="space-y-1">
          {displayPayload.map((item, index) => {
            const dataKey = String(item.dataKey ?? item.name ?? index);
            const swatchColor = item.color || item.fill || colors.$22;

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
                  <span className="truncate">{labelFor(dataKey)}</span>
                </div>

                <span className="whitespace-nowrap font-medium">
                  {formatter(dataKey, item.value)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Tooltip
      content={<Content />}
      wrapperStyle={{ outline: 'none' }}
    />
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
  if (!forecast) {
    return <EmptyState>No forecast data is available.</EmptyState>;
  }

  const rows = [
    {
      label: FIELD_LABELS.average_daily_velocity,
      value: formatter(
        'average_daily_velocity',
        forecast.average_daily_velocity
      ),
    },
    {
      label: FIELD_LABELS.remaining_hours,
      value: formatter('remaining_hours', forecast.remaining_hours),
    },
    {
      label: 'Forecast finish',
      value: forecast.forecast_finish_date
        ? formatDate(forecast.forecast_finish_date, dateFormat)
        : '-',
    },
    {
      label: FIELD_LABELS.schedule_variance_days,
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
  const colors = useColorScheme();

  if (!rows.length) {
    return <EmptyState>No recent activity is available.</EmptyState>;
  }

  return (
    <div className="max-h-[280px] overflow-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr style={{ color: colors.$22 }}>
            <th className="py-2 pr-3 font-medium">Date</th>
            <th className="py-2 pr-3 font-medium">Activity</th>
            <th className="py-2 text-right font-medium">Amount</th>
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

function formatCompact(value: unknown) {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(toNumber(value));
}

function labelFor(key: string) {
  return FIELD_LABELS[key] || key.replace(/_/g, ' ');
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
