/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const ANALYTICS_CHART_COLORS = [
  '#2563EB',
  '#16A34A',
  '#F59E0B',
  '#DC2626',
  '#0891B2',
  '#6B7280',
  '#7C3AED',
];

export const ANALYTICS_KEY_FIELDS = ['project_id', 'project_name'];

/**
 * Recharts resolves grid/legend children by element type, so these are shared
 * as props rather than wrapper components — a wrapper would never render.
 */
export const ANALYTICS_GRID_PROPS = {
  strokeDasharray: '3 3',
  vertical: false,
};

export const ANALYTICS_LEGEND_WRAPPER_STYLE = { paddingTop: 4 };

export const MONEY_FIELDS = new Set([
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

export const HOURS_FIELDS = new Set([
  'estimated_hours',
  'logged_hours',
  'billable_hours',
  'remaining_hours',
  'average_daily_velocity',
  'hours',
  'unbilled_hours',
]);

export const RATIO_FIELDS = new Set([
  'utilization',
  'budget_utilization',
  'invoice_progress',
  'paid_progress',
  'margin_ratio',
  'outstanding_ratio',
  'unbilled_ratio',
]);

export const PERCENT_FIELDS = new Set([
  'completion_percentage',
  'ideal_progress_percentage',
  'health_score',
  'score',
]);

/**
 * Chart-series field -> i18n key. Every chart carries its own axis
 * (Amount / Hours / %), so series labels are the bare metric name.
 */
export const FIELD_LABELS: Record<string, string> = {
  actual_amount: 'actual_spend',
  average_daily_velocity: 'daily_velocity',
  billable_hours: 'billable',
  billable_value: 'billable',
  budget_utilization: 'budget_used',
  budgeted_amount: 'budgeted_amount',
  cumulative_actual_amount: 'total',
  cumulative_expense_amount: 'expenses',
  cumulative_labor_value: 'tasks',
  estimated_hours: 'budgeted',
  expense_amount: 'expense',
  expense_count: 'count',
  health_score: 'health',
  score: 'health_score',
  hours: 'logged',
  invoice_progress: 'invoice_progress',
  invoiced_amount: 'invoiced',
  labor_value: 'tasks',
  logged_hours: 'logged',
  margin_ratio: 'margin',
  net_margin: 'margin',
  outstanding_amount: 'outstanding',
  outstanding_ratio: 'outstanding',
  paid_amount: 'paid',
  paid_progress: 'paid_progress',
  remaining_hours: 'remaining',
  schedule_variance_days: 'days_ahead',
  task_value: 'task_value',
  unbilled_amount: 'billable',
  unbilled_hours: 'unbilled_hours',
  unbilled_ratio: 'unbilled',
  work_value: 'total',
};
