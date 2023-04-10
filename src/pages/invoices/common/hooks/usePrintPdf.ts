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
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { useQueryClient } from 'react-query';

interface Props {
  entity: 'invoice' | 'quote' | 'credit' | 'purchase_order';
}

type Resource = Invoice | RecurringInvoice | Quote | PurchaseOrder;

export function usePrintPdf({ entity }: Props) {
  const queryClient = useQueryClient();

  return (resource: Resource) => {
    toast.processing();

    queryClient.fetchQuery(endpoint(`/api/v1/${entity}s/bulk`), () =>
      request(
        'POST',
        endpoint(`/api/v1/${entity}s/bulk`),
        { action: 'bulk_print', ids: [resource.id] },
        { responseType: 'arraybuffer' }
      )
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
