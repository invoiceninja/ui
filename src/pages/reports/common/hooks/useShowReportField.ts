/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Identifier } from '../useReports';

type Field =
  | 'document_email_attachment'
  | 'is_expense_billed'
  | 'is_income_billed'
  | 'include_tax'
  | 'status'
  | 'product_key'
  | 'clients'
  | 'vendors'
  | 'projects'
  | 'categories'
  | 'include_deleted'
  | 'client'
  | 'pdf_email_attachment'
  | 'template_id'
  | 'activity_type_id'
  | 'group_by';

const ReportFields: Record<Identifier, Field[]> = {
  client: [
    'document_email_attachment',
    'include_deleted',
    'template_id',
    'group_by',
  ],
  invoice: [
    'document_email_attachment',
    'status',
    'include_deleted',
    'client',
    'pdf_email_attachment',
    'template_id',
    'group_by',
  ],
  invoice_item: [
    'document_email_attachment',
    'product_key',
    'include_deleted',
    'status',
    'client',
    'template_id',
    'group_by',
  ],
  quote: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'client',
    'pdf_email_attachment',
    'template_id',
    'group_by',
  ],
  quote_item: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'client',
    'product_key',
    'template_id',
    'group_by',
  ],
  credit: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'client',
    'pdf_email_attachment',
    'template_id',
    'group_by',
  ],
  document: ['document_email_attachment', 'group_by'],
  payment: [
    'document_email_attachment',
    'status',
    'client',
    'template_id',
    'group_by',
  ],
  expense: [
    'document_email_attachment',
    'clients',
    'vendors',
    'projects',
    'categories',
    'include_deleted',
    'status',
    'template_id',
    'group_by',
  ],
  task: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'client',
    'template_id',
    'group_by',
  ],
  product: ['document_email_attachment', 'template_id', 'group_by'],
  vendor: ['document_email_attachment', 'template_id', 'group_by'],
  purchase_order: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'pdf_email_attachment',
    'template_id',
    'group_by',
  ],
  purchase_order_item: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'product_key',
    'template_id',
    'group_by',
  ],
  project: ['clients', 'projects', 'group_by'],
  activity: ['activity_type_id', 'group_by'],
  contact: ['group_by'],
  recurring_invoice: ['include_deleted', 'status', 'client', 'template_id', 'group_by'],
  recurring_invoice_item: [
    'document_email_attachment',
    'product_key',
    'include_deleted',
    'status',
    'client',
    'template_id',
    'group_by',
  ],
  product_sales: ['product_key', 'client', 'group_by'],
  aged_receivable_detailed_report: ['group_by'],
  aged_receivable_summary_report: ['group_by'],
  client_balance_report: ['group_by'],
  client_sales_report: ['group_by'],
  profitloss: ['is_expense_billed', 'is_income_billed', 'include_tax', 'group_by'],
  tax_summary_report: ['group_by'],
  tax_period_report: ['is_income_billed', 'group_by'],
  user_sales_report: ['group_by'],
};

interface Params {
  report: Identifier;
}

export function useShowReportField(params: Params) {
  const { report } = params;

  return (field: Field) => {
    return Boolean(ReportFields[report].includes(field));
  };
}
