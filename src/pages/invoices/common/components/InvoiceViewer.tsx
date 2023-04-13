/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useEffect, useRef } from 'react';
import { Resource } from './InvoicePreview';
import { Payload } from '$app/pages/settings/invoice-design/pages/general-settings/GeneralSettings';

interface Props {
  link: string;
  resource?: Resource | Payload;
  method: 'GET' | 'POST';
  onLink?: (url: string) => unknown;
  withToast?: boolean;
  height?: number;
}

export function InvoiceViewer(props: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (props.withToast) {
      toast.processing();
    }

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

        toast.dismiss();
      })
      .catch((error) => console.error(error));

    return () => {
      controller.abort();
      toast.dismiss();
    };
  }, [props.link, props.resource]);

  return <iframe ref={iframeRef} width="100%" height={props.height || 1500} />;
}
