/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { User } from '@sentry/react';
import { Client } from './client';
import { ClientContact } from './client-contact';
import { Expense } from './expense';
import { Invoice } from './invoice';
import { Credit } from './credit';
import { Payment } from './payment';
import { Quote } from './quote';
import { RecurringInvoice } from './recurring-invoice';
import { Task } from './task';
import { Vendor } from './vendor';
import { PurchaseOrder } from './purchase-order';
import { VendorContact } from './vendor-contact';
import { Subscription } from './subscription';
import { RecurringExpense } from './recurring-expense';

interface WithHashId {
  hashed_id: string;
}

export interface ActivityRecord {
  id: string;
  activity_type_id: string;
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
  client: [string, string]
  task:  [string, string]
  contact: [string, string] 
  user: [string, string] 
  expense: [string, string] 
  invoice: [string, string] 
  recurring_invoice: [string, string] 
  recurring_expense: [string, string] 
  payment: [string, string] 
  credit: [string, string] 
  quote: [string, string] 
  vendor: [string, string]
  vendor_contact: [string, string] 
  purchase_order: [string, string] 
  subscription: [string, string]
  payment_amount: string
  payment_adjustment: string;
  
}
