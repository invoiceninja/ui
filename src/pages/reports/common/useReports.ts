/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Payload {
  start_date: string;
  end_date: string;
  date_key?: string;
  client_id?: string;
  date_range: string;
  report_keys: string[];
  send_email: boolean;
  is_income_billed?: boolean;
  is_expense_billed?: boolean;
  include_tax?: boolean;
  status?: string;
  product_key?: string;
  document_email_attachment?: boolean;
  clients?: string;
  categories?: string;
  projects?: string;
  vendors?: string;
  include_deleted?: boolean;
}

export interface Report {
  identifier: Identifier;
  schedule_identifier?: string;
  label: string;
  endpoint: string;
  payload: Payload;
  custom_columns: string[];
  allow_custom_column: boolean;
  preview: string;
  supports_previews: boolean;
}

export type Identifier =
  | 'activity'
  | 'client'
  | 'contact'
  | 'credit'
  | 'document'
  | 'expense'
  | 'invoice'
  | 'invoice_item'
  | 'quote'
  | 'quote_item'
  | 'recurring_invoice'
  | 'payment'
  | 'product'
  | 'product_sales'
  | 'task'
  | 'vendor'
  | 'purchase_order'
  | 'purchase_order_item'
  | 'profitloss'
  | 'client_balance_report'
  | 'client_sales_report'
  | 'aged_receivable_detailed_report'
  | 'aged_receivable_summary_report'
  | 'user_sales_report'
  | 'tax_summary_report';

export function useReports() {
  const reports: Report[] = [
    {
      identifier: 'activity',
      label: 'activity',
      endpoint: '/api/v1/reports/activities',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
      },
      preview: '/api/v1/reports/activities?output=json',
      supports_previews: false,
    },
    {
      identifier: 'client',
      label: 'client',
      endpoint: '/api/v1/reports/clients',
      allow_custom_column: true,
      custom_columns: ['client'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
        include_deleted: false,
      },
      preview: '/api/v1/reports/clients?output=json',
      supports_previews: true,
    },
    {
      identifier: 'contact',
      label: 'contact',
      endpoint: '/api/v1/reports/contacts',
      allow_custom_column: true,
      custom_columns: ['contact'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
      },
      preview: '/api/v1/reports/contacts?output=json',
      supports_previews: true,
    },
    {
      identifier: 'credit',
      label: 'credit',
      endpoint: '/api/v1/reports/credits',
      allow_custom_column: true,
      custom_columns: ['client', 'credit', 'payment'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
        include_deleted: false,
        status: '',
        client_id: '',
      },
      preview: '/api/v1/reports/credits?output=json',
      supports_previews: true,
    },
    {
      identifier: 'document',
      label: 'document',
      endpoint: '/api/v1/reports/documents',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
      },
      preview: '/api/v1/reports/documents?output=json',
      supports_previews: true,
    },
    {
      identifier: 'expense',
      label: 'expense',
      endpoint: '/api/v1/reports/expenses',
      allow_custom_column: true,
      custom_columns: ['expense', 'client', 'vendor'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
        clients: '',
        vendors: '',
        categories: '',
        projects: '',
        include_deleted: false,
        status: '',
      },
      preview: '/api/v1/reports/expenses?output=json',
      supports_previews: true,
    },
    {
      identifier: 'invoice',
      label: 'invoice',
      endpoint: '/api/v1/reports/invoices',
      allow_custom_column: true,
      custom_columns: ['client', 'invoice', 'payment'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        status: '',
        document_email_attachment: false,
        include_deleted: false,
        client_id: '',
      },
      preview: '/api/v1/reports/invoices?output=json',
      supports_previews: true,
    },
    {
      identifier: 'invoice_item',
      label: 'invoice_item',
      endpoint: '/api/v1/reports/invoice_items',
      allow_custom_column: true,
      custom_columns: ['client', 'invoice', 'payment', 'item'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
        include_deleted: false,
        status: '',
        client_id: '',
      },
      preview: '/api/v1/reports/invoice_items?output=json',
      supports_previews: true,
    },
    {
      identifier: 'purchase_order',
      label: 'purchase_order',
      endpoint: '/api/v1/reports/purchase_orders',
      allow_custom_column: true,
      custom_columns: ['vendor', 'purchase_order'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        status: '',
        document_email_attachment: false,
        include_deleted: false,
      },
      preview: '/api/v1/reports/purchase_orders?output=json',
      supports_previews: true,
    },
    {
      identifier: 'purchase_order_item',
      label: 'purchase_order_item',
      endpoint: '/api/v1/reports/purchase_order_items',
      allow_custom_column: true,
      custom_columns: ['vendor', 'purchase_order', 'item'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
        include_deleted: false,
        status: '',
      },
      preview: '/api/v1/reports/purchase_order_items?output=json',
      supports_previews: true,
    },
    {
      identifier: 'quote',
      label: 'quote',
      endpoint: '/api/v1/reports/quotes',
      allow_custom_column: true,
      custom_columns: ['client', 'quote'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
        include_deleted: false,
        status: '',
        client_id: '',
      },
      preview: '/api/v1/reports/quotes?output=json',
      supports_previews: true,
    },
    {
      identifier: 'quote_item',
      label: 'quote_item',
      endpoint: '/api/v1/reports/quote_items',
      allow_custom_column: true,
      custom_columns: ['client', 'quote', 'item'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
        include_deleted: false,
        status: '',
        client_id: '',
      },
      preview: '/api/v1/reports/quote_items?output=json',
      supports_previews: true,
    },
    {
      identifier: 'recurring_invoice',
      label: 'recurring_invoice',
      endpoint: '/api/v1/reports/recurring_invoices',
      allow_custom_column: true,
      custom_columns: ['recurring_invoice', 'client', 'item'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        include_deleted: false,
        status: '',
        client_id: '',
      },
      preview: '/api/v1/reports/recurring_invoices?output=json',
      supports_previews: true,
    },
    {
      identifier: 'payment',
      label: 'payment',
      endpoint: '/api/v1/reports/payments',
      allow_custom_column: true,
      custom_columns: ['client', 'invoice', 'payment'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
        status: '',
        client_id: '',
      },
      preview: '/api/v1/reports/payments?output=json',
      supports_previews: true,
    },
    {
      identifier: 'product',
      label: 'product',
      endpoint: '/api/v1/reports/products',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
      },
      preview: '/api/v1/reports/products?output=json',
      supports_previews: true,
    },
    {
      identifier: 'product_sales',
      label: 'product_sales',
      endpoint: '/api/v1/reports/product_sales',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        client_id: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
      },
      preview: '/api/v1/reports/product_sales?output=json',
      supports_previews: false,
    },
    {
      identifier: 'task',
      label: 'task',
      endpoint: '/api/v1/reports/tasks',
      allow_custom_column: true,
      custom_columns: ['task', 'client', 'invoice'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
        include_deleted: false,
        status: '',
        client_id: '',
      },
      preview: '/api/v1/reports/tasks?output=json',
      supports_previews: true,
    },
    {
      identifier: 'vendor',
      label: 'vendor',
      endpoint: '/api/v1/reports/vendors',
      allow_custom_column: true,
      custom_columns: ['vendor'],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        document_email_attachment: false,
      },
      preview: '/api/v1/reports/vendors?output=json',
      supports_previews: true,
    },
    {
      identifier: 'profitloss',
      label: 'profitloss',
      endpoint: '/api/v1/reports/profitloss',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        is_expense_billed: false,
        is_income_billed: false,
        include_tax: false,
      },
      preview: '/api/v1/reports/profitloss?output=json',
      supports_previews: false,
    },
    {
      identifier: 'aged_receivable_detailed_report',
      schedule_identifier: 'ar_detailed',
      label: 'aged_receivable_detailed_report',
      endpoint: '/api/v1/reports/ar_detail_report',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        is_expense_billed: false,
        is_income_billed: false,
        include_tax: false,
      },
      preview: '/api/v1/reports/ar_detail_report?output=json',
      supports_previews: false,
    },
    {
      identifier: 'aged_receivable_summary_report',
      schedule_identifier: 'ar_summary',
      label: 'aged_receivable_summary_report',
      endpoint: '/api/v1/reports/ar_summary_report',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        is_expense_billed: false,
        is_income_billed: false,
        include_tax: false,
      },
      preview: '/api/v1/reports/ar_summary_report?output=json',
      supports_previews: false,
    },
    {
      identifier: 'client_balance_report',
      label: 'client_balance_report',
      schedule_identifier: 'client_balance',
      endpoint: '/api/v1/reports/client_balance_report',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        is_expense_billed: false,
        is_income_billed: false,
        include_tax: false,
      },
      preview: '/api/v1/reports/client_balance_report?output=json',
      supports_previews: false,
    },
    {
      identifier: 'client_sales_report',
      label: 'client_sales_report',
      schedule_identifier: 'client_sales',
      endpoint: '/api/v1/reports/client_sales_report',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        is_expense_billed: false,
        is_income_billed: false,
        include_tax: false,
      },
      preview: '/api/v1/reports/client_sales_report?output=json',
      supports_previews: false,
    },
    {
      identifier: 'tax_summary_report',
      label: 'tax_summary_report',
      schedule_identifier: 'tax_summary',
      endpoint: '/api/v1/reports/tax_summary_report',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        is_expense_billed: false,
        is_income_billed: false,
        include_tax: false,
      },
      preview: '/api/v1/reports/tax_summary_report?output=json',
      supports_previews: false,
    },
    {
      identifier: 'user_sales_report',
      label: 'user_sales_report',
      schedule_identifier: 'user_sales',
      endpoint: '/api/v1/reports/user_sales_report',
      allow_custom_column: false,
      custom_columns: [],
      payload: {
        start_date: '',
        end_date: '',
        date_key: '',
        date_range: 'all',
        report_keys: [],
        send_email: false,
        is_expense_billed: false,
        is_income_billed: false,
        include_tax: false,
      },
      preview: '/api/v1/reports/user_sales_report?output=json',
      supports_previews: false,
    },
  ];
  return reports;
}
