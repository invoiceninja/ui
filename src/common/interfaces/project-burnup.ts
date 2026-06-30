/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Project } from './project';

export type ProjectBurnupBucketType = 'daily' | 'weekly' | 'monthly';

export type ProjectBurnupMetricKey =
  | 'cumulative_logged_hours'
  | 'cumulative_billable_hours'
  | 'budgeted_hours'
  | 'ideal_hours'
  | 'cumulative_task_value'
  | 'cumulative_invoiced_amount'
  | 'cumulative_paid_to_date'
  | 'cumulative_outstanding_amount'
  | 'cumulative_expense_amount'
  | 'cumulative_net_invoiced_amount'
  | 'cumulative_net_paid_amount'
  | 'budgeted_amount'
  | 'ideal_amount';

export interface ProjectBurnupRequest {
  project_id: string;
  start_date: string;
  end_date: string;
  bucket_type: ProjectBurnupBucketType;
  include_drafts: boolean;
}

export interface ProjectBurnupMarkers {
  due_date?: string | null;
}

export interface ProjectBurnupSeriesRow {
  period: string;
  date: string;
  period_start: string;
  period_end: string;
  logged_hours: number;
  billable_hours: number;
  task_value: number;
  invoiced_amount: number;
  paid_to_date: number;
  outstanding_amount: number;
  expense_amount: number;
  net_invoiced_amount: number;
  net_paid_amount: number;
  cumulative_logged_hours: number;
  cumulative_billable_hours: number;
  cumulative_task_value: number;
  cumulative_invoiced_amount: number;
  cumulative_paid_to_date: number;
  cumulative_outstanding_amount: number;
  cumulative_expense_amount: number;
  cumulative_net_invoiced_amount: number;
  cumulative_net_paid_amount: number;
  budgeted_hours: number;
  budgeted_amount: number;
  ideal_hours: number;
  ideal_amount: number;
  task_log_count: number;
  invoice_count: number;
  expense_count: number;
}

export interface ProjectBurnupResponse {
  start_date: string;
  end_date: string;
  bucket_type: ProjectBurnupBucketType;
  project: Project;
  markers: ProjectBurnupMarkers;
  series: ProjectBurnupSeriesRow[];
  totals: Record<string, unknown>;
}
