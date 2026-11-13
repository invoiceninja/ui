/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { IconType } from 'react-icons';
import {
  MdMailOutline,
  MdOutlineAssessment,
  MdOutlineNotificationsActive,
} from 'react-icons/md';
import { Frequency } from '$app/common/enums/frequency';
import { Parameters } from '$app/common/interfaces/schedule';
import { Template } from '../hooks/useDisplayTemplateField';

export interface ScheduleStarter {
  key: string;
  icon: IconType;
  title: string;
  description: string;
  template: Template;
  frequencyId: Frequency;
  nextRun?: () => string;
  parameters: Partial<Parameters>;
}

export const SCHEDULE_STARTERS: ScheduleStarter[] = [
  {
    key: 'monthly_statement',
    icon: MdMailOutline,
    title: 'starter_email_monthly_statements',
    description: 'starter_email_monthly_statements_hint',
    template: 'email_statement',
    frequencyId: Frequency.Monthly,
    nextRun: () => {
      return dayjs().add(1, 'month').startOf('month').format('YYYY-MM-DD');
    },
    parameters: {
      date_range: 'last_month',
      status: 'all',
      show_aging_table: true,
    },
  },
  {
    key: 'quarterly_pnl',
    icon: MdOutlineAssessment,
    title: 'starter_run_pnl_quarterly',
    description: 'starter_run_pnl_quarterly_hint',
    template: 'email_report',
    frequencyId: Frequency.ThreeMonths,
    parameters: {
      report_name: 'profitloss',
      date_range: 'last_quarter',
      send_email: true,
    },
  },
  {
    key: 'weekly_reminders',
    icon: MdOutlineNotificationsActive,
    title: 'starter_invoice_reminders_weekly',
    description: 'starter_invoice_reminders_weekly_hint',
    template: 'invoice_outstanding_tasks',
    frequencyId: Frequency.Weekly,
    parameters: {
      auto_send: true,
    },
  },
];

export const getScheduleStarter = (key: string | null) => {
  return SCHEDULE_STARTERS.find((starter) => starter.key === key);
};
