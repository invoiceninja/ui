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
import { useEffect, useState } from 'react';

export function InvoicePreview() {
  const invoice = useCurrentInvoice();
  const [html, setHtml] = useState({ __html: '' });

  useEffect(() => {
    if (invoice) {
      axios
        .post(
          endpoint(
            '/api/v1/live_preview?entity=invoice&entity_id=:id&html=true',
            {
              id: invoice?.id,
            }
          ),
          invoice,
          { headers: defaultHeaders }
        )
        .then((response) => setHtml({ __html: response.data }))
        .catch((error) => console.log(error));
    }
  }, [invoice]);

  return <div dangerouslySetInnerHTML={html}></div>;
}
