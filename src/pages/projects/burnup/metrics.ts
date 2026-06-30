/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ProjectBurnupMetricKey } from '$app/common/interfaces/project-burnup';

export type ProjectBurnupMetricAxis = 'hours' | 'money';

export interface ProjectBurnupMetricDefinition {
  key: ProjectBurnupMetricKey;
  axis: ProjectBurnupMetricAxis;
  translationKey: string;
  defaultLabel: string;
  stroke: string;
  strokeDasharray?: string;
  strokeWidth?: number;
}

export const PROJECT_BURNUP_METRICS: ProjectBurnupMetricDefinition[] = [
  {
    key: 'cumulative_logged_hours',
    axis: 'hours',
    translationKey: 'logged_hours',
    defaultLabel: 'Logged hours',
    stroke: '#2563eb',
    strokeWidth: 2.5,
  },
  {
    key: 'cumulative_billable_hours',
    axis: 'hours',
    translationKey: 'billable_hours',
    defaultLabel: 'Billable hours',
    stroke: '#0f766e',
    strokeDasharray: '6 4',
  },
  {
    key: 'budgeted_hours',
    axis: 'hours',
    translationKey: 'budgeted_hours',
    defaultLabel: 'Budgeted hours',
    stroke: '#6b7280',
    strokeDasharray: '3 4',
  },
  {
    key: 'ideal_hours',
    axis: 'hours',
    translationKey: 'ideal_hours',
    defaultLabel: 'Ideal hours',
    stroke: '#7c3aed',
    strokeDasharray: '8 5',
  },
  {
    key: 'cumulative_task_value',
    axis: 'money',
    translationKey: 'task_value',
    defaultLabel: 'Task value',
    stroke: '#0891b2',
  },
  {
    key: 'cumulative_invoiced_amount',
    axis: 'money',
    translationKey: 'invoiced_amount',
    defaultLabel: 'Invoiced amount',
    stroke: '#ea580c',
    strokeWidth: 2.5,
  },
  {
    key: 'cumulative_paid_to_date',
    axis: 'money',
    translationKey: 'paid_to_date',
    defaultLabel: 'Paid to date',
    stroke: '#16a34a',
    strokeDasharray: '4 3',
    strokeWidth: 2.5,
  },
  {
    key: 'cumulative_outstanding_amount',
    axis: 'money',
    translationKey: 'outstanding_amount',
    defaultLabel: 'Outstanding amount',
    stroke: '#dc2626',
  },
  {
    key: 'cumulative_expense_amount',
    axis: 'money',
    translationKey: 'expense_amount',
    defaultLabel: 'Expense amount',
    stroke: '#64748b',
    strokeWidth: 2.5,
  },
  {
    key: 'cumulative_net_invoiced_amount',
    axis: 'money',
    translationKey: 'net_invoiced_amount',
    defaultLabel: 'Net invoiced amount',
    stroke: '#f59e0b',
    strokeDasharray: '6 3',
  },
  {
    key: 'cumulative_net_paid_amount',
    axis: 'money',
    translationKey: 'net_paid_amount',
    defaultLabel: 'Net paid amount',
    stroke: '#059669',
    strokeWidth: 2.5,
  },
  {
    key: 'budgeted_amount',
    axis: 'money',
    translationKey: 'budgeted_amount',
    defaultLabel: 'Budgeted amount',
    stroke: '#475569',
    strokeDasharray: '3 4',
  },
  {
    key: 'ideal_amount',
    axis: 'money',
    translationKey: 'ideal_amount',
    defaultLabel: 'Ideal amount',
    stroke: '#9333ea',
    strokeDasharray: '8 5',
  },
];

export const DEFAULT_PROJECT_BURNUP_METRICS: ProjectBurnupMetricKey[] = [
  'cumulative_logged_hours',
  'budgeted_hours',
  'ideal_hours',
  'cumulative_invoiced_amount',
  'cumulative_paid_to_date',
  'cumulative_expense_amount',
];
