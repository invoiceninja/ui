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
import { useEffect, useRef } from 'react';
import { Resource } from './InvoicePreview';

interface Props {
  link: string;
  resource?: Resource;
  method: 'GET' | 'POST';
  onLink?: (url: string) => unknown;
}

export function InvoiceViewer(props: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    request(props.method, props.link, props.resource, {
      responseType: 'arraybuffer',
      signal: controller.signal,
    })
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        if (iframeRef.current) {
          iframeRef.current.src = url;

          props.onLink && props.onLink(url);
        }
      })
      .catch((error) => console.error(error));

    return () => controller.abort();
  }, [props.link, props.resource?.id]);

  return <iframe ref={iframeRef} width="100%" height={1500} />;
}
