/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { previewEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Invoice } from '$app/common/interfaces/invoice';
import { useEffect, useRef, useState } from 'react';
import { Spinner, useTheme } from '../kit';

interface Props {
  invoice: Invoice | undefined;
  invoiceId: string | null;
  height?: string;
}

export function LivePreview({ invoice, invoiceId, height = '46rem' }: Props) {
  const t = useTheme();

  const [url, setUrl] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const objectUrl = useRef<string>();
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const signature = JSON.stringify({
    id: invoiceId,
    design: invoice?.design_id,
    items: invoice?.line_items,
    client: invoice?.client_id,
    due: invoice?.due_date,
    date: invoice?.date,
    terms: invoice?.terms,
  });

  useEffect(() => {
    if (!invoice || !invoiceId) {
      setLoading(false);

      return;
    }

    let cancelled = false;

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      setLoading(true);
      setFailed(false);

      request(
        'POST',
        previewEndpoint('/api/v1/live_preview?entity=:entity&entity_id=:id', {
          entity: 'invoice',
          id: invoiceId,
        }),
        invoice,
        { responseType: 'arraybuffer', skipIntercept: true }
      )
        .then((response) => {
          if (cancelled) {
            return;
          }

          const blob = new Blob([response.data], { type: 'application/pdf' });
          const next = URL.createObjectURL(blob);

          if (objectUrl.current) {
            URL.revokeObjectURL(objectUrl.current);
          }

          objectUrl.current = next;
          setUrl(next);
        })
        .catch(() => !cancelled && setFailed(true))
        .finally(() => !cancelled && setLoading(false));
    }, 700);

    return () => {
      cancelled = true;

      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  useEffect(() => {
    return () => {
      if (objectUrl.current) {
        URL.revokeObjectURL(objectUrl.current);
      }
    };
  }, []);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height,
        backgroundColor: '#FFFFFF',
        borderRadius: '0.375rem',
        border: `1px solid ${t.dark ? 'rgba(255,255,255,0.10)' : 'rgba(9,9,11,0.08)'}`,
        boxShadow: t.dark
          ? '0 24px 60px -20px rgba(0,0,0,0.75)'
          : '0 18px 44px -18px rgba(9,9,11,0.28)',
      }}
    >
      {url ? (
        <iframe
          src={`${url}#toolbar=0&navpanes=0&view=FitH`}
          title="Invoice preview"
          width="100%"
          height="100%"
          style={{
            border: 0,
            opacity: loading ? 0.45 : 1,
            transition: 'opacity 200ms ease',
          }}
        />
      ) : null}

      {failed && url ? (
        <div
          className="absolute left-0 right-0 bottom-0 px-4 py-2 text-center"
          style={{ backgroundColor: 'rgba(24,24,27,0.86)' }}
        >
          <span className="text-xs" style={{ color: '#FAFAFA' }}>
            Showing the last preview — the newest one didn't load.
          </span>
        </div>
      ) : null}

      {loading && !url ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex items-center gap-2">
            <Spinner tone="#A1A1AA" />
            <span className="text-sm" style={{ color: '#A1A1AA' }}>
              Rendering your invoice
            </span>
          </div>
        </div>
      ) : null}

      {failed && !url ? (
        <div className="absolute inset-0 grid place-items-center px-8 text-center">
          <p className="text-sm" style={{ color: '#71717A' }}>
            The preview didn't load. Your invoice is still saved as a draft, and
            you can keep going.
          </p>
        </div>
      ) : null}
    </div>
  );
}
