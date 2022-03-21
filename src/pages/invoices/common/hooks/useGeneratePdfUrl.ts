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
import { Invoice } from 'common/interfaces/invoice';

export function useGeneratePdfUrl() {
  return (invoice: Invoice) => {
    if (invoice.invitations.length > 0) {
      return endpoint('/client/invoice/:invitation/download_pdf', {
        invitation: invoice.invitations[0].key,
      });
    }
  };
}
