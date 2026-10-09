/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export enum ModuleBitmask {
  Invoices = 4096,
  RecurringInvoices = 1,
  Quotes = 4,
  Credits = 2,
  Projects = 32,
  Tasks = 8,
  Vendors = 64,
  Expenses = 16,
  RecurringExpenses = 512,
  PurchaseOrders = 16384,
  Transactions = 256, // old: 32768
}
