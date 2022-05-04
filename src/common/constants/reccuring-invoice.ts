/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RecurringInvoiceStatus } from 'common/enums/recurring-invoice-status';

export default {
  [RecurringInvoiceStatus.ACTIVE]: 'active',
  [RecurringInvoiceStatus.COMPLETED]: 'completed',
  [RecurringInvoiceStatus.DRAFT]: 'draft',
  [RecurringInvoiceStatus.PAUSED]: 'paused',
  [RecurringInvoiceStatus.PENDING]: 'pending',
};
