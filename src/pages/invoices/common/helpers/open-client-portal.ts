/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Invoice } from 'common/interfaces/invoice';

export function openClientPortal(invoice: Invoice) {
  if (invoice.invitations.length > 0) {
    window.open(invoice.invitations[0].link, '_blank')?.focus();
  }
}
