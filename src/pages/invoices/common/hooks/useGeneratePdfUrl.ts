/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { Invoice } from 'common/interfaces/invoice';
import { Quote } from 'common/interfaces/quote';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';

interface Props {
  resource: 'invoice' | 'recurring_invoic' | 'quote';
}

export function useGeneratePdfUrl(props: Props) {
  return (resource: Invoice | RecurringInvoice | Quote) => {
    if (resource.invitations.length > 0) {
      return endpoint('/client/:resource/:invitation/download_pdf', {
        resource: props.resource,
        invitation: resource.invitations[0].key,
      });
    }
  };
}
