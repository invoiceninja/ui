/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from 'common/interfaces/invoice';
import { Quote } from 'common/interfaces/quote';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';

export function openClientPortal(resource: Invoice | RecurringInvoice | Quote) {
  if (resource.invitations.length > 0) {
    window.open(resource.invitations[0].link, '_blank')?.focus();
  }
}
