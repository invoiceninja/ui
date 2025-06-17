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
  | 'activity_type_id';

const ReportFields: Record<Identifier, Field[]> = {
  client: ['document_email_attachment', 'include_deleted'],
  invoice: [
    'document_email_attachment',
    'status',
    'include_deleted',
    'client',
    'pdf_email_attachment',
  ],
  invoice_item: [
    'document_email_attachment',
    'product_key',
    'include_deleted',
    'status',
    'client',
  ],
  quote: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'client',
    'pdf_email_attachment',
  ],
  quote_item: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'client',
    'product_key',
  ],
  credit: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'client',
    'pdf_email_attachment',
  ],
  document: ['document_email_attachment'],
  payment: ['document_email_attachment', 'status', 'client'],
  expense: [
    'document_email_attachment',
    'clients',
    'vendors',
    'projects',
    'categories',
    'include_deleted',
    'status',
  ],
  task: ['document_email_attachment', 'include_deleted', 'status', 'client'],
  product: ['document_email_attachment'],
  vendor: ['document_email_attachment'],
  purchase_order: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'pdf_email_attachment',
  ],
  purchase_order_item: [
    'document_email_attachment',
    'include_deleted',
    'status',
    'product_key'
  ],
  project: ['clients', 'projects'],
  activity: ['activity_type_id'],
  contact: [],
  recurring_invoice: ['include_deleted', 'status', 'client'],
  recurring_invoice_item: [
    'document_email_attachment',
    'product_key',
    'include_deleted',
    'status',
    'client',
  ],
  product_sales: ['product_key', 'client'],
  aged_receivable_detailed_report: [],
  aged_receivable_summary_report: [],
  client_balance_report: [],
  client_sales_report: [],
  profitloss: ['is_expense_billed', 'is_income_billed', 'include_tax'],
  tax_summary_report: [],
  user_sales_report: [],
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
