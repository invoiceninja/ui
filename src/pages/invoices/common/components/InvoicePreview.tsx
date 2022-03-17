/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { useCurrentInvoice } from 'common/hooks/useCurrentInvoice';
import { defaultHeaders } from 'common/queries/common/headers';
import { useEffect, useRef } from 'react';

export function InvoicePreview() {
  const invoice = useCurrentInvoice();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (invoice) {
      axios
        .post(
          endpoint('/api/v1/live_preview?entity=invoice&entity_id=:id', {
            id: invoice?.id,
          }),
          invoice,
          { responseType: 'arraybuffer', headers: defaultHeaders }
        )
        .then((response) => {
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          if (iframeRef.current) {
            iframeRef.current.src = url;
          }
        })
        .catch((error) => console.log(error));
    }
  }, [invoice]);

  return <iframe ref={iframeRef} width="100%" height={1500} />;
}
