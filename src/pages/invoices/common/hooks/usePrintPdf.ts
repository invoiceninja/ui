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

interface Props {
  entity: 'invoice' | 'quote' | 'credit' | 'purchase_order';
}

export const usePrintPdf = ({ entity }: Props) => {
  const queryClient = useQueryClient();

  const appendIframe = (element: HTMLElement) => {
    return new Promise<void>((resolve) => {
      const onLoad = () => {
        element.removeEventListener('load', onLoad);
        resolve();
      };

      document.body.appendChild(element);
      element.addEventListener('load', onLoad);
    });
  };

  return (resourceIds: string[]) => {
    if (!resourceIds.length) {
      return;
    }

    toast.processing();

    queryClient.fetchQuery([`/api/v1/${entity}s/bulk`], () =>
      request(
        'POST',
        endpoint(`/api/v1/${entity}s/bulk`),
        { action: 'bulk_print', ids: resourceIds },
        { responseType: 'arraybuffer' }
      ).then(async (response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const iframeElement = document.createElement('iframe');

        iframeElement.style.display = 'none';
        iframeElement.src = url;

        await appendIframe(iframeElement);

        if (iframeElement && iframeElement.contentWindow) {
          iframeElement.contentWindow.focus();
          iframeElement.contentWindow.print();
        }

        toast.dismiss();
      })
    );
  };
};
