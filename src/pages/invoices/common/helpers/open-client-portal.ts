/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Credit } from '$app/common/interfaces/credit';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';

export function generateClientPortalUrl(
  resource: Invoice | RecurringInvoice | Quote | Credit | PurchaseOrder
) {
  if (resource.invitations.length > 0) {
    return `${resource.invitations[0].link}?silent=true`;
  }

  return null;
}

export function openClientPortal(
  resource: Invoice | RecurringInvoice | Quote | Credit | PurchaseOrder
) {
  const url = generateClientPortalUrl(resource);

  if (url) {
    window.open(url, '_blank')?.focus();
  }
}
