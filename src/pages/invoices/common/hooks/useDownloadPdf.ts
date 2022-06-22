/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from 'common/helpers/request';
import { Invoice } from 'common/interfaces/invoice';
import { Quote } from 'common/interfaces/quote';
import { RecurringInvoice } from 'common/interfaces/recurring-invoice';
import { useQueryClient } from 'react-query';
import { useGeneratePdfUrl } from './useGeneratePdfUrl';

interface Props {
  resource: 'invoice' | 'recurring_invoice' | 'quote' | 'credit';
}

export function useDownloadPdf(props: Props) {
  const queryClient = useQueryClient();
  const url = useGeneratePdfUrl({ resource: props.resource });

  return (resource: Invoice | RecurringInvoice | Quote) => {
    const downloadableUrl = url(resource);

    if (downloadableUrl) {
      queryClient.fetchQuery(downloadableUrl, () =>
        request('GET', downloadableUrl, {}, { responseType: 'arraybuffer' })
          .then((response) => {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.download = `${props.resource}.pdf`;
            link.href = url;
            link.target = '_blank';

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
          })
          .catch((error) => console.error(error))
      );
    }
  };
}
