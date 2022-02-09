/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const enum InvoiceStatus {
  Viewed = '-3',
  Unpaid = '-2',
  PastDue = '-1',
  Draft = '1',
  Sent = '2',
  Partial = '3',
  Paid = '4',
  Cancelled = '5',
  Reversed = '6',
}
