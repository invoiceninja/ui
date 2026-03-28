/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactSettings, ReactTableColumns } from '../hooks/useReactSettings';
import { Account } from './account';
import { Company } from './company.interface';
import { User } from './user';

export type Field =
  | 'active_invoices'
  | 'outstanding_invoices'
  | 'completed_payments'
  | 'refunded_payments'
  | 'active_quotes'
  | 'unapproved_quotes'
  | 'logged_tasks'
  | 'invoiced_tasks'
  | 'paid_tasks'
  | 'logged_expenses'
  | 'pending_expenses'
  | 'invoiced_expenses'
  | 'invoice_paid_expenses';

export type Period = 'current' | 'previous' | 'total';

export type Calculate = 'sum' | 'avg' | 'count';

export type Format = 'money' | 'time';

export interface DashboardCardField {
  id: string;
  field: Field;
  period: Period;
  calculate: Calculate;
  format: Format;
}

export interface CompanyUser {
  permissions: string;
  notifications: Notifications;
  settings: Settings;
  is_owner: boolean;
  is_admin: boolean;
  is_locked: boolean;
  updated_at: number;
  archived_at: number;
  created_at: number;
  permissions_updated_at: number;
  ninja_portal_url: string;
  user: User;
  company: Company;
  token: Token;
  account: Account;
  react_settings: ReactSettings;
}

export interface Settings {
  accent_color: string;
  table_columns?: Record<ReactTableColumns, string[]>;
  react_table_columns?: Record<ReactTableColumns, string[]>;
}

export interface Notifications {
  email: string[];
}

export interface Token {
  id: string;
  user_id: string;
  token: string;
  name: string;
  is_system: boolean;
  updated_at: number;
  archived_at: number;
  created_at: number;
  is_deleted: boolean;
}
