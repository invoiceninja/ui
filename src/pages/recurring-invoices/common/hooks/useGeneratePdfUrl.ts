/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';

export function useGeneratePdfUrl() {
  return (recurringInvoice: RecurringInvoice) => {
    if (recurringInvoice.invitations.length > 0) {
      return endpoint('/client/recurring_invoice/:key/download_pdf', {
        key: recurringInvoice.invitations[0].key,
      });
    }
  };
}
