/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Spinner } from '$app/components/Spinner';
import { GeneralSettingsPayload } from '$app/pages/settings/invoice-design/InvoiceDesign';
import { PreviewPayload } from '$app/pages/settings/invoice-design/pages/custom-designs/CustomDesign';
import { Resource } from './InvoicePreview';

const PREVIEW_DEBOUNCE_MS = 300;

interface Props {
  link: string;
  resource?: Resource | GeneralSettingsPayload | PreviewPayload;
  resourceKey?: string;
  method: 'GET' | 'POST';
  onLink?: (url: string) => unknown;
  withToast?: boolean;
  height?: number;
  enabled?: boolean;
  renderAsHTML?: boolean;
  onError?: (error: any) => unknown;
  onRequest?: () => unknown;
  headers?: Record<string, string>;
}

export const android = Boolean(navigator.userAgent.match(/Android/i));

export function InvoiceViewer(props: Props) {
  const queryClient = useQueryClient();

  const { renderAsHTML } = props;

  const linkRef = useRef<HTMLAnchorElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [debouncedResourceKey, setDebouncedResourceKey] = useState('');

  const lastFetchedKeyRef = useRef<string | null>(null);
  const inFlightAbortRef = useRef<AbortController | null>(null);
  const activeResourceKeyRef = useRef('');

  const resourceKey = useMemo(() => {
    if (props.resourceKey) {
      return props.resourceKey;
    }

    return JSON.stringify(props.resource);
  }, [props.resource, props.resourceKey]);

  useEffect(() => {
    if (props.enabled === false || !resourceKey) {
      setDebouncedResourceKey('');
      return;
    }

    const timeoutId = globalThis.setTimeout(() => {
      setDebouncedResourceKey(resourceKey);
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, [resourceKey, props.enabled]);

  useEffect(() => {
    activeResourceKeyRef.current = debouncedResourceKey;
  }, [debouncedResourceKey]);

  useEffect(() => {
    if (props.enabled === false || !debouncedResourceKey) {
      setIsLoading(false);
      return;
    }

    if (debouncedResourceKey === lastFetchedKeyRef.current) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchKey = debouncedResourceKey;
    inFlightAbortRef.current?.abort();
    inFlightAbortRef.current = null;

    if (props.withToast) {
      toast.processing();
    }

    const abortController = new AbortController();
    inFlightAbortRef.current = abortController;

    queryClient
      .fetchQuery({
        queryKey: [props.link, fetchKey],
        staleTime: 0,
        gcTime: 0,
        retry: 0,
        queryFn: ({ signal }) => {
          if (props.onRequest) {
            props.onRequest();
          }

          return request(props.method, props.link, props.resource, {
            responseType: 'arraybuffer',
            signal: signal ?? abortController.signal,
            ...(props.headers && { headers: props.headers }),
          })
            .then((response) => {
              if (
                abortController.signal.aborted ||
                fetchKey !== activeResourceKeyRef.current
              ) {
                return response;
              }

              lastFetchedKeyRef.current = fetchKey;

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

              return response;
            })
            .catch((error) => {
              if (
                abortController.signal.aborted ||
                fetchKey !== activeResourceKeyRef.current
              ) {
                return;
              }

              if (props.onError) {
                props.onError(error);
              }

              toast.dismiss();

              throw error;
            })
            .finally(() => {
              if (
                !abortController.signal.aborted &&
                fetchKey === activeResourceKeyRef.current
              ) {
                setIsLoading(false);
              }
            });
        },
      })
      .catch(() => undefined);

    return () => {
      abortController.abort();
      toast.dismiss();

      if (fetchKey !== activeResourceKeyRef.current) {
        setIsLoading(false);
      }
    };
  }, [
    props.link,
    debouncedResourceKey,
    props.enabled,
    props.method,
    props.resource,
    props.withToast,
  ]);

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
    <div
      className="flex flex-col w-full"
      style={{ height: props.height || 1500 }}
    >
      {isLoading && (
        <div
          className="flex justify-center items-center w-full"
          style={{ height: '100%' }}
        >
          <Spinner />
        </div>
      )}

      <iframe
        ref={iframeRef}
        width="100%"
        height={isLoading ? 0 : '100%'}
        loading="lazy"
        tabIndex={-1}
      />
    </div>
  );
}
