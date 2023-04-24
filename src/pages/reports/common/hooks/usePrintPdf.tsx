/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { Report } from '../../index/Reports';

interface Props {
  endpoint: string;
}

export function usePrintPdf(props: Props) {
  const queryClient = useQueryClient();

  return (report: Report) => {
    toast.processing();

    const { client_id } = report.payload;

    const updatedPayload =
      report.identifier === 'product_sales'
        ? { ...report.payload, client_id: client_id || null }
        : report.payload;

    queryClient.fetchQuery(endpoint(props.endpoint), () =>
      request('POST', endpoint(props.endpoint), updatedPayload, {
        responseType: 'arraybuffer',
      })
        .then((response) => {
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          const iframeElement = document.createElement('iframe');

          iframeElement.style.display = 'none';
          iframeElement.src = url;

          document.body.appendChild(iframeElement);

          if (iframeElement && iframeElement.contentWindow) {
            iframeElement.contentWindow.focus();
            iframeElement.contentWindow.print();
          }

          toast.dismiss();
        })
        .catch((error) => {
          console.error(error);
          toast.error();
        })
    );
  };
}
