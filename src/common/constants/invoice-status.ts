/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceStatus } from 'common/enums/invoice-status';

export default {
  [InvoiceStatus.Cancelled]: 'cancelled',
  [InvoiceStatus.Unpaid]: 'unpaid',
  [InvoiceStatus.PastDue]: 'past_due',
  [InvoiceStatus.Draft]: 'draft',
  [InvoiceStatus.Sent]: 'sent',
  [InvoiceStatus.Partial]: 'partial',
  [InvoiceStatus.Paid]: 'paid',
  [InvoiceStatus.Cancelled]: 'cancelled',
  [InvoiceStatus.Reversed]: 'reversed',
};
