/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  Calculate,
  Field,
  Format,
  Period,
} from '$app/common/interfaces/company-user';

export interface DashboardFieldRules {
  calculations: Calculate[];
  formats: Format[];
  defaultPeriod?: Period;
}

const ALL_CALCULATIONS: Calculate[] = ['sum', 'avg', 'count'];

export const TASK_METRIC_FIELDS: Field[] = [
  'task_estimated_duration',
  'task_remaining_estimated_duration',
  'unestimated_tasks',
  'tasks_over_estimate',
  'overdue_tasks',
  'tasks_due',
];

export const DASHBOARD_FIELD_RULES: Record<Field, DashboardFieldRules> = {
  active_invoices: { calculations: ALL_CALCULATIONS, formats: ['money'] },
  outstanding_invoices: { calculations: ALL_CALCULATIONS, formats: ['money'] },
  completed_payments: { calculations: ALL_CALCULATIONS, formats: ['money'] },
  refunded_payments: { calculations: ALL_CALCULATIONS, formats: ['money'] },
  active_quotes: { calculations: ALL_CALCULATIONS, formats: ['money'] },
  unapproved_quotes: { calculations: ALL_CALCULATIONS, formats: ['money'] },
  logged_tasks: { calculations: ALL_CALCULATIONS, formats: ['money', 'time'] },
  invoiced_tasks: {
    calculations: ALL_CALCULATIONS,
    formats: ['money', 'time'],
  },
  paid_tasks: { calculations: ALL_CALCULATIONS, formats: ['money', 'time'] },
  logged_expenses: { calculations: ALL_CALCULATIONS, formats: ['money'] },
  pending_expenses: { calculations: ALL_CALCULATIONS, formats: ['money'] },
  invoiced_expenses: { calculations: ALL_CALCULATIONS, formats: ['money'] },
  invoice_paid_expenses: {
    calculations: ALL_CALCULATIONS,
    formats: ['money'],
  },
  task_estimated_duration: { calculations: ['sum', 'avg'], formats: ['time'] },
  task_remaining_estimated_duration: {
    calculations: ['sum', 'avg'],
    formats: ['time'],
  },
  unestimated_tasks: {
    calculations: ['count'],
    formats: [],
    defaultPeriod: 'total',
  },
  tasks_over_estimate: {
    calculations: ['count'],
    formats: [],
    defaultPeriod: 'total',
  },
  overdue_tasks: {
    calculations: ['count'],
    formats: [],
    defaultPeriod: 'total',
  },
  tasks_due: {
    calculations: ['count'],
    formats: [],
    defaultPeriod: 'current',
  },
};

export const formatDurationFromSeconds = (seconds: number): string => {
  if (!Number.isFinite(seconds)) {
    return '0:00:00';
  }

  const total = Math.round(Math.abs(seconds));

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const remainingSeconds = total % 60;

  return `${seconds < 0 ? '-' : ''}${hours}:${minutes
    .toString()
    .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
