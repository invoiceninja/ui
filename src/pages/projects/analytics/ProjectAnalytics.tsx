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
import { useEnabled } from '$app/common/guards/guards/enabled';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { Project } from '$app/common/interfaces/project';
import {
  ProjectActivityRow,
  ProjectCumulativeSpendRow,
  ProjectExpenseCategoryRow,
  ProjectTaskDistributionRow,
  ProjectTeamContributionRow,
  ProjectVelocityRow,
} from '$app/common/interfaces/project-analytics';
import { useProjectAnalyticsQuery } from '$app/common/queries/project-analytics';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import Toggle from '$app/components/forms/Toggle';
import { Burnup } from '$app/pages/projects/burnup/Burnup';
import { ModuleBitmask } from '$app/pages/settings';
import { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnalyticsCard } from './components/AnalyticsCard';
import { AnalyticsStatCard } from './components/AnalyticsStatCard';
import { ForecastSummary } from './components/ForecastSummary';
import { ANALYTICS_CHART_COLORS } from './constants';
import {
  findProjectRow,
  getNestedRows,
  hasValue,
  resolveProjectHealthScore,
  resolveProjectHealthStatus,
} from './helpers';
import { useFormatAnalyticsValue } from './hooks/useFormatAnalyticsValue';
import { ExpensesTab } from './tabs/ExpensesTab';
import { ProfitTab } from './tabs/ProfitTab';
import { TimeTab } from './tabs/TimeTab';

interface Props {
  project: Project;
  overviewContent?: (forecastCard: ReactNode) => ReactNode;
}

export function ProjectAnalytics({ project, overviewContent }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const enabled = useEnabled();
  const hasPermission = useHasPermission();
  const formatValue = useFormatAnalyticsValue(project);

  const [includeDrafts, setIncludeDrafts] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  /**
   * Time and burn-up are derived from tasks, so they stay behind a task
   * permission; the remaining tabs report on the project itself.
   */
  const showTaskTabs =
    enabled(ModuleBitmask.Tasks) &&
    (hasPermission('view_task') || hasPermission('edit_task'));

  const analytics = useProjectAnalyticsQuery(
    { project_id: project.id, include_drafts: includeDrafts },
    { enabled: Boolean(project.id) }
  );

  const data = analytics.data;

  const sections = useMemo(() => {
    if (!data) {
      return null;
    }

    return {
      budgetSummary: findProjectRow(data.budget_summary, project.id),
      budgetVsActual: findProjectRow(data.budget_vs_actual, project.id),
      estimatedVsLogged: findProjectRow(
        data.estimated_vs_logged_hours,
        project.id
      ),
      invoiceProgress: findProjectRow(data.invoice_progress, project.id),
      forecastCompletion: findProjectRow(data.forecast_completion, project.id),
      projectHealth: findProjectRow(data.project_health, project.id),
      unbilledHours: findProjectRow(data.unbilled_hours, project.id),
      timelineVariance: findProjectRow(data.timeline_variance, project.id),
      profitability: findProjectRow(data.profitability, project.id),
      teamContribution: getNestedRows<ProjectTeamContributionRow>(
        data.team_contribution,
        project.id
      ),
      timeDistribution: getNestedRows<ProjectTaskDistributionRow>(
        data.time_distribution,
        project.id
      ),
      velocityTrend: getNestedRows<ProjectVelocityRow>(
        data.velocity_trend,
        project.id
      ),
      expenseBreakdown: getNestedRows<ProjectExpenseCategoryRow>(
        data.expense_breakdown,
        project.id
      ),
      cumulativeSpend: getNestedRows<ProjectCumulativeSpendRow>(
        data.cumulative_spend,
        project.id
      ),
      recentActivity: getNestedRows<ProjectActivityRow>(
        data.recent_activity,
        project.id
      ),
    };
  }, [data, project.id]);

  const hasAnalyticsData = Boolean(
    sections &&
      (sections.budgetVsActual ||
        sections.estimatedVsLogged ||
        sections.invoiceProgress ||
        sections.forecastCompletion ||
        sections.projectHealth ||
        sections.unbilledHours ||
        sections.timelineVariance ||
        sections.profitability ||
        sections.teamContribution.length ||
        sections.timeDistribution.length ||
        sections.velocityTrend.length ||
        sections.expenseBreakdown.length ||
        sections.cumulativeSpend.length)
  );

  const healthScore = resolveProjectHealthScore(sections?.projectHealth);

  const statCards = [
    {
      label: t('budgeted_amount'),
      value: formatValue(
        'budgeted_amount',
        sections?.budgetSummary?.budgeted_amount ??
          sections?.budgetVsActual?.budgeted_amount
      ),
      detail: t('planned_value'),
      accent: ANALYTICS_CHART_COLORS[0],
    },
    {
      label: t('actual_spend'),
      value: formatValue(
        'actual_amount',
        sections?.budgetSummary?.actual_amount ??
          sections?.budgetVsActual?.actual_amount
      ),
      detail: t('labor_and_expenses'),
      accent: ANALYTICS_CHART_COLORS[1],
    },
    {
      label: t('invoiced'),
      value: formatValue(
        'invoiced_amount',
        sections?.invoiceProgress?.invoiced_amount ??
          sections?.budgetSummary?.invoiced_amount
      ),
      detail: t('sent_to_client'),
      accent: ANALYTICS_CHART_COLORS[2],
    },
    {
      label: t('paid'),
      value: formatValue(
        'paid_amount',
        sections?.invoiceProgress?.paid_amount ??
          sections?.budgetSummary?.paid_amount
      ),
      detail: t('collected'),
      accent: ANALYTICS_CHART_COLORS[3],
    },
    {
      label: t('outstanding'),
      value: formatValue(
        'outstanding_amount',
        sections?.invoiceProgress?.outstanding_amount ??
          sections?.budgetSummary?.outstanding_amount
      ),
      detail: t('remaining_invoice_balance'),
      accent: ANALYTICS_CHART_COLORS[4],
    },
    {
      label: t('billable'),
      value: formatValue(
        'unbilled_amount',
        sections?.unbilledHours?.unbilled_amount
      ),
      detail: formatValue(
        'unbilled_hours',
        sections?.unbilledHours?.unbilled_hours
      ),
      accent: ANALYTICS_CHART_COLORS[2],
    },
    {
      label: t('health'),
      value: hasValue(healthScore) ? formatValue('score', healthScore) : '-',
      detail:
        resolveProjectHealthStatus(sections?.projectHealth) || t('status'),
      accent: ANALYTICS_CHART_COLORS[5],
    },
    {
      label: t('logged'),
      value: formatValue(
        'logged_hours',
        sections?.estimatedVsLogged?.logged_hours
      ),
      detail: t('tracked_time'),
      accent: ANALYTICS_CHART_COLORS[0],
    },
  ];

  const forecastCard = (
    <AnalyticsCard
      title={t('forecast')}
      className="col-span-12 xl:col-span-3"
      height={240}
    >
      <ForecastSummary
        forecast={sections?.forecastCompletion}
        formatter={formatValue}
      />
    </AnalyticsCard>
  );

  const tabs = [
    {
      label: t('overview'),
      content: overviewContent?.(forecastCard),
    },
    {
      label: t('profit'),
      content: sections && (
        <ProfitTab
          projectName={project.name}
          profitability={sections.profitability}
          budgetVsActual={sections.budgetVsActual}
          invoiceProgress={sections.invoiceProgress}
          formatter={formatValue}
        />
      ),
    },
    ...(showTaskTabs
      ? [
          {
            label: t('time'),
            content: sections && (
              <TimeTab
                projectName={project.name}
                estimatedVsLogged={sections.estimatedVsLogged}
                projectHealth={sections.projectHealth}
                teamContribution={sections.teamContribution}
                timeDistribution={sections.timeDistribution}
                velocityTrend={sections.velocityTrend}
                formatter={formatValue}
              />
            ),
          },
        ]
      : []),
    {
      label: t('expenses'),
      content: sections && (
        <ExpensesTab
          expenseBreakdown={sections.expenseBreakdown}
          cumulativeSpend={sections.cumulativeSpend}
          formatter={formatValue}
        />
      ),
    },
    ...(showTaskTabs
      ? [
          {
            label: t('burn_up'),
            content: (
              <Burnup
                project={project}
                includeDrafts={includeDrafts}
                onIncludeDraftsChange={setIncludeDrafts}
                withoutIncludeDraftsToggle
              />
            ),
          },
        ]
      : []),
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

      {!analytics.isLoading && !hasAnalyticsData && (
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

      {!analytics.isLoading && hasAnalyticsData && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
          {statCards.map((stat) => (
            <AnalyticsStatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      <TabGroup
        tabs={tabs.map((tab) => tab.label)}
        withoutVerticalMargin
        childrenClassName="mt-4"
        defaultTabIndex={activeTabIndex}
        onTabChange={setActiveTabIndex}
      >
        {tabs.map((tab, index) => (
          <div key={tab.label} className="space-y-4">
            {activeTabIndex === index && tab.content}
          </div>
        ))}
      </TabGroup>
    </section>
  );
}
