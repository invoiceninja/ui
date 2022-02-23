/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import { RecurringInvoice } from 'common/enums/recurring-invoice';

export default {
  [RecurringInvoice.ACTIVE]: 'active',
  [RecurringInvoice.COMPLETED]: 'completed',
  [RecurringInvoice.DRAFT]: 'draft',
  [RecurringInvoice.PAUSED]: 'paused',
  [RecurringInvoice.PENDING]: 'pending',
};
