/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Parameters, Schedule } from '$app/common/interfaces/schedule';
import { Templates } from '$app/pages/settings/schedules/common/components/ScheduleForm';

const TemplateProperties = {
  EMAIL_STATEMENT: [
    'template',
    'next_run',
    'frequency_id',
    'remaining_cycles',
    'parameters',
  ],
  EMAIL_RECORD: ['template', 'next_run', 'parameters'],
  EMAIL_REPORT: ['template', 'next_run', 'frequency_id', 'parameters'],
};


export const AllParameterProperties = {
  'activities':[
    'date_range',
    'start_date',
    'end_date',
  ],
  'client':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'contact':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'credit':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'document':[
    'date_range',
    'start_date',
    'end_date',,
    'send_email',
  ],
  'expense':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'invoice':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
    'status',
  ],
  'invoice_item':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
    'product_key',
  ],
  'quote':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'quote_item':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'recurring_invoice':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'payment':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'product':[
    'date_range',
    'start_date',
    'end_date',
    'send_email',
  ],
  'product_sales':[
    'date_range',
    'start_date',
    'end_date',
    'product_key',
    'send_email',
    'clients',
  ],
  'task':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'vendor':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'purchase_order':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'purchase_order_item':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
  ],
  'profitloss':[
    'date_range',
    'start_date',
    'end_date',
    'report_keys',
    'send_email',
    'is_expense_billed',
    'is_income_billed',
    'include_tax',
  ],
  'client_balance_report':[
    'date_range',
    'start_date',
    'end_date',
    'send_email',
  ],
  'client_sales_report':[
    'date_range',
    'start_date',
    'end_date',
    'send_email',
  ],
  'aged_receivable_detailed_report':[
    'date_range',
    'start_date',
    'end_date',
    'send_email',
  ],
  'aged_receivable_summary_report':[
    'date_range',
    'start_date',
    'end_date',
    'send_email',
  ],
  'user_sales_report':[
    'date_range',
    'start_date',
    'end_date',
    'send_email',
  ],
  'tax_summary_report':[
    'date_range',
    'start_date',
    'end_date',
    'send_email',
  ],
};

const TemplateParametersProperties = {
  EMAIL_STATEMENT: [
    'date_range',
    'status',
    'show_aging_table',
    'show_credits_table',
    'show_payments_table',
    'only_clients_with_invoices',
    'clients',
  ],
  EMAIL_RECORD: ['entity', 'entity_id'],
  EMAIL_REPORT: [
    'date_range',
    'start_date',
    'end_date',
    'status',
    'clients',
    'report_keys',
    'send_email',
    'is_expense_billed',
    'is_income_billed',
    'include_tax',
    'product_key',
  ]
};

export function useFormatSchedulePayload() {
  return (schedule: Schedule) => {
    let formattedSchedule = {};

    let scheduleMainProperties = TemplateProperties.EMAIL_STATEMENT;
    let scheduleParametersProperties =
      TemplateParametersProperties.EMAIL_STATEMENT;

    if (schedule?.template === Templates.EMAIL_RECORD) {
      scheduleMainProperties = TemplateProperties.EMAIL_RECORD;
      scheduleParametersProperties = TemplateParametersProperties.EMAIL_RECORD;
    }

    if (schedule?.template === Templates.EMAIL_REPORT) {
      scheduleMainProperties = TemplateProperties.EMAIL_REPORT;
      scheduleParametersProperties = TemplateParametersProperties.EMAIL_REPORT;
    }

    Object.entries(schedule.parameters).forEach(([property]) => {
      if (!scheduleParametersProperties.includes(property)) {
        delete schedule.parameters[property as keyof Parameters];
      }
    });

    Object.entries(schedule).forEach(([property, value]) => {
      if (scheduleMainProperties.includes(property)) {
        formattedSchedule = { ...formattedSchedule, [property]: value };
      }
    });

    return formattedSchedule;
  };
}
