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
import { defaultHeaders } from 'common/queries/common/headers';
import { useEffect, useRef } from 'react';

interface Props {
  link: string;
  resource?: unknown;
  method: 'GET' | 'POST';
}

export function InvoiceViewer(props: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    axios({
      method: props.method,
      url: props.link,
      data: props.resource,
      headers: defaultHeaders,
      responseType: 'arraybuffer',
    })
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        if (iframeRef.current) {
          iframeRef.current.src = url;
        }
      })
      .catch((error) => console.log(error));
  }, [props.link, props.resource]);

  return <iframe ref={iframeRef} width="100%" height={1500} />;
}
