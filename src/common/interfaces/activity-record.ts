/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */


interface ActivityRecordBase {
label: string;
hashed_id: string;
contact_entity: string;
}
export interface ActivityRecord {
  id: string;
  activity_type_id: number;
  client_id: string;
  recurring_invoice_id: string;
  recurring_expense_id: string;
  company_id: string;
  user_id: string;
  invoice_id: string;
  quote_id: string;
  payment_id: string;
  credit_id: string;
  updated_at: number;
  created_at: number;
  expense_id: string;
  is_system: boolean;
  contact_id: string;
  vendor_id: string;
  task_id: string;
  token_id: string;
  vendor_contact_id: string;
  purchase_order_id: string;
  notes: string;
  ip: string;
  client: ActivityRecordBase
  task:  ActivityRecordBase
  contact: ActivityRecordBase 
  user: ActivityRecordBase 
  expense: ActivityRecordBase 
  invoice: ActivityRecordBase 
  recurring_invoice: ActivityRecordBase 
  recurring_expense: ActivityRecordBase 
  payment: ActivityRecordBase 
  credit: ActivityRecordBase 
  quote: ActivityRecordBase 
  vendor: ActivityRecordBase
  vendor_contact: ActivityRecordBase 
  purchase_order: ActivityRecordBase 
  subscription: ActivityRecordBase
  payment_amount: ActivityRecordBase
  adjustment: ActivityRecordBase;
}
