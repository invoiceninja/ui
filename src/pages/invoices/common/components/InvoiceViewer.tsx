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
import { useEffect, useRef, useState } from 'react';
import { Resource } from './InvoicePreview';
import { useQueryClient } from 'react-query';
import { Spinner } from '$app/components/Spinner';
import { GeneralSettingsPayload } from '$app/pages/settings/invoice-design/InvoiceDesign';
import { PreviewPayload } from '$app/pages/settings/invoice-design/pages/custom-designs/CustomDesign';

interface Props {
  link: string;
  resource?: Resource | GeneralSettingsPayload | PreviewPayload;
  method: 'GET' | 'POST';
  onLink?: (url: string) => unknown;
  withToast?: boolean;
  height?: number;
  enabled?: boolean;
  renderAsHTML?: boolean;
}

export const android = Boolean(navigator.userAgent.match(/Android/i));

export function InvoiceViewer(props: Props) {
  const queryClient = useQueryClient();

  const { renderAsHTML } = props;

  const linkRef = useRef<HTMLAnchorElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (props.withToast) {
      toast.processing();
    }

    setIsLoading(true);

    if (props.enabled !== false) {
      queryClient.fetchQuery({
        queryKey: [props.link, JSON.stringify(props.resource)],
        queryFn: ({ signal }) =>
          request(props.method, props.link, props.resource, {
            responseType: 'arraybuffer',
            signal,
          })
            .then((response) => {
              const blob = new Blob([response.data], {
                type: renderAsHTML ? 'text/html' : 'application/pdf',
              });
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
            })
            .finally(() => setIsLoading(false)),
      });
    }

    return () => {
      toast.dismiss();
    };
  }, [props.link, props.resource, props.enabled]);

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

  return (
    <>
      {isLoading && (
        <div
          className="flex justify-center items-center"
          style={{ height: props.height || 1500 }}
        >
          <Spinner />
        </div>
      )}

      <iframe
        ref={iframeRef}
        width="100%"
        height={isLoading ? 0 : props.height || 1500}
      />
    </>
  );
}
