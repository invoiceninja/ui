/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export type ProjectAnalyticsValue = number | string | null | undefined;

export interface ProjectAnalyticsRequest {
  project_id: string;
  include_drafts: boolean;
}

interface ProjectScopedRow {
  project_id?: ProjectAnalyticsValue;
  project_name?: string;
}

export interface ProjectBudgetSummary extends ProjectScopedRow {
  budgeted_amount?: ProjectAnalyticsValue;
  actual_amount?: ProjectAnalyticsValue;
  invoiced_amount?: ProjectAnalyticsValue;
  paid_amount?: ProjectAnalyticsValue;
  outstanding_amount?: ProjectAnalyticsValue;
}

export interface ProjectBudgetVsActual extends ProjectScopedRow {
  budgeted_amount?: ProjectAnalyticsValue;
  actual_amount?: ProjectAnalyticsValue;
  labor_value?: ProjectAnalyticsValue;
  expense_amount?: ProjectAnalyticsValue;
  budget_utilization?: ProjectAnalyticsValue;
}

export interface ProjectEstimatedVsLoggedHours extends ProjectScopedRow {
  estimated_hours?: ProjectAnalyticsValue;
  logged_hours?: ProjectAnalyticsValue;
  billable_hours?: ProjectAnalyticsValue;
  remaining_hours?: ProjectAnalyticsValue;
}

export interface ProjectInvoiceProgress extends ProjectScopedRow {
  work_value?: ProjectAnalyticsValue;
  invoiced_amount?: ProjectAnalyticsValue;
  paid_amount?: ProjectAnalyticsValue;
  outstanding_amount?: ProjectAnalyticsValue;
  unbilled_amount?: ProjectAnalyticsValue;
  invoice_progress?: ProjectAnalyticsValue;
  paid_progress?: ProjectAnalyticsValue;
}

export interface ProjectForecastCompletion extends ProjectScopedRow {
  average_daily_velocity?: ProjectAnalyticsValue;
  remaining_hours?: ProjectAnalyticsValue;
  forecast_finish_date?: string;
  schedule_variance_days?: ProjectAnalyticsValue;
}

export interface ProjectHealthIndicators {
  budget_utilization?: ProjectAnalyticsValue;
  schedule_variance_days?: ProjectAnalyticsValue;
  margin_ratio?: ProjectAnalyticsValue;
  unbilled_ratio?: ProjectAnalyticsValue;
  outstanding_ratio?: ProjectAnalyticsValue;
}

export interface ProjectHealth extends ProjectScopedRow {
  score?: ProjectAnalyticsValue;
  status?: string;
  health_score?: ProjectAnalyticsValue;
  health_status?: string;
  indicators?: ProjectHealthIndicators;
}

export interface ProjectTeamContributionRow {
  user_id?: ProjectAnalyticsValue;
  user_name?: string;
  logged_hours?: ProjectAnalyticsValue;
  billable_hours?: ProjectAnalyticsValue;
  billable_value?: ProjectAnalyticsValue;
}

export interface ProjectTaskDistributionRow {
  description?: string;
  logged_hours?: ProjectAnalyticsValue;
  billable_hours?: ProjectAnalyticsValue;
  billable_value?: ProjectAnalyticsValue;
}

export interface ProjectUnbilledHours extends ProjectScopedRow {
  unbilled_hours?: ProjectAnalyticsValue;
  unbilled_amount?: ProjectAnalyticsValue;
}

export interface ProjectVelocityRow {
  period?: string;
  hours?: ProjectAnalyticsValue;
  billable_hours?: ProjectAnalyticsValue;
  task_value?: ProjectAnalyticsValue;
}

export interface ProjectTimelineVariance extends ProjectScopedRow {
  schedule_variance_days?: ProjectAnalyticsValue;
}

export interface ProjectExpenseCategoryRow {
  category_name?: string;
  expense_amount?: ProjectAnalyticsValue;
  expense_count?: ProjectAnalyticsValue;
}

export interface ProjectCumulativeSpendRow {
  period?: string;
  cumulative_labor_value?: ProjectAnalyticsValue;
  cumulative_expense_amount?: ProjectAnalyticsValue;
  cumulative_actual_amount?: ProjectAnalyticsValue;
}

export interface ProjectProfitability extends ProjectScopedRow {
  invoiced_amount?: ProjectAnalyticsValue;
  expense_amount?: ProjectAnalyticsValue;
  net_margin?: ProjectAnalyticsValue;
  margin_ratio?: ProjectAnalyticsValue;
}

export interface ProjectActivityRow {
  date?: string;
  type?: string;
  label?: string;
  amount?: ProjectAnalyticsValue;
}

export type ProjectNestedSection<TRow> = ProjectScopedRow &
  Record<string, TRow[] | ProjectAnalyticsValue>;

export interface ProjectAnalyticsMetadata {
  project_count: number;
  include_drafts: boolean;
  generated_at: string;
}

export interface ProjectAnalyticsResponse {
  budget_summary: ProjectBudgetSummary[];
  budget_vs_actual: ProjectBudgetVsActual[];
  estimated_vs_logged_hours: ProjectEstimatedVsLoggedHours[];
  invoice_progress: ProjectInvoiceProgress[];
  forecast_completion: ProjectForecastCompletion[];
  project_health: ProjectHealth[];
  team_contribution: ProjectNestedSection<ProjectTeamContributionRow>[];
  time_distribution: ProjectNestedSection<ProjectTaskDistributionRow>[];
  unbilled_hours: ProjectUnbilledHours[];
  velocity_trend: ProjectNestedSection<ProjectVelocityRow>[];
  timeline_variance: ProjectTimelineVariance[];
  expense_breakdown: ProjectNestedSection<ProjectExpenseCategoryRow>[];
  cumulative_spend: ProjectNestedSection<ProjectCumulativeSpendRow>[];
  profitability: ProjectProfitability[];
  recent_activity: ProjectNestedSection<ProjectActivityRow>[];
  metadata: ProjectAnalyticsMetadata;
}
