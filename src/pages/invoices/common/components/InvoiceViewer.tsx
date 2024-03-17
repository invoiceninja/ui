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
import { PreviewPayload } from '$app/pages/settings/invoice-design/pages/custom-designs/pages/edit/Edit';
import { useQueryClient } from 'react-query';
import { Spinner } from '$app/components/Spinner';
import { GeneralSettingsPayload } from '$app/pages/settings/invoice-design/InvoiceDesign';
import interact from 'interactjs';

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

  const pixelSize = 16;

  interact('.pdf-preview')
    .origin('self')
    .draggable({
      modifiers: [
        interact.modifiers.snap({
          // snap to the corners of a grid
          targets: [interact.snappers.grid({ x: pixelSize, y: pixelSize })],
        }),
      ],
      listeners: {
        // draw colored squares on move
        move: function (event: any) {
          const context = event.target.getContext('2d'),
            // calculate the angle of the drag direction
            dragAngle = (180 * Math.atan2(event.dx, event.dy)) / Math.PI;

          // set color based on drag angle and speed
          context.fillStyle =
            'hsl(' +
            dragAngle +
            ', 86%, ' +
            (30 + Math.min(event.speed / 1000, 1) * 50) +
            '%)';

          // draw squares
          context.fillRect(
            event.pageX - pixelSize / 2,
            event.pageY - pixelSize / 2,
            pixelSize,
            pixelSize
          );
        },
      },
    })
    // clear the canvas on doubletap
    .on('doubletap', function (event: any) {
      const context = event.target.getContext('2d');

      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    });

  function resizeCanvases() {
    [].forEach.call(
      document.querySelectorAll('.pdf-preview'),
      function (canvas: any) {
        canvas.width = document.body.clientWidth;
        canvas.height = window.innerHeight * 0.7;
      }
    );
  }

  // interact.js can also add DOM event listeners
  interact(document).on('DOMContentLoaded', resizeCanvases);
  //interact(window).on('resize', resizeCanvases);

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
        className="pdf-preview"
        ref={iframeRef}
        width="100%"
        height={isLoading ? 0 : props.height || 1500}
      />
    </>
  );
}
