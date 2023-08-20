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
import { GeneralSettingsPayload } from '$app/pages/settings/invoice-design/pages/general-settings/GeneralSettings';
import { PreviewPayload } from '$app/pages/settings/invoice-design/pages/custom-designs/pages/edit/Edit';

interface Props {
  link: string;
  resource?: Resource | GeneralSettingsPayload | PreviewPayload;
  method: 'GET' | 'POST';
  onLink?: (url: string) => unknown;
  withToast?: boolean;
  height?: number;
}

export const android = Boolean(navigator.userAgent.match(/Android/i));

export function InvoiceViewer(props: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (props.withToast) {
      toast.processing();
    }

    const controller = new AbortController();

    request(props.method, props.link, props.resource, {
      responseType: 'arraybuffer',
      signal: controller.signal,
    }).then((response) => {
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (android && linkRef.current) {
        linkRef.current.href = url;

        props.onLink && props.onLink(url);
      }

      if (!android && iframeRef.current) {
        iframeRef.current.src = url;

        props.onLink && props.onLink(url);
      }

      toast.dismiss();
    });

    return () => {
      controller.abort();
      toast.dismiss();
    };
  }, [props.link, props.resource]);

  if (android) {
    return (
      <p>
        Unable to preview PDF. &nbsp;
        <a ref={linkRef} style={{ textDecoration: 'underline' }}>
          Click to download it.
        </a>
      </p>
    );
  }

  return <iframe ref={iframeRef} width="100%" height={props.height || 1500} />;
}
