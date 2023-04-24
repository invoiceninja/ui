/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useEffect, useRef } from 'react';
import { Report } from '../../index/Reports';

interface Props {
  endpoint: string;
  report: Report;
}

export function ReportViewer(props: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { report } = props;

  useEffect(() => {
    toast.processing();

    const { client_id } = report.payload;

    const updatedPayload =
      report.identifier === 'product_sales'
        ? { ...report.payload, client_id: client_id || null }
        : report.payload;

    const controller = new AbortController();

    request('POST', endpoint(props.endpoint), updatedPayload, {
      responseType: 'arraybuffer',
      signal: controller.signal,
    })
      .then((response) => {
        const blob = new Blob([response.data], {
          type: 'application/pdf',
        });
        const url = URL.createObjectURL(blob);

        if (iframeRef.current) {
          iframeRef.current.src = url;
        }

        toast.dismiss();
      })
      .catch((error) => console.error(error));

    return () => {
      controller.abort();
      toast.dismiss();
    };
  }, [props.endpoint, props.report]);

  return <iframe ref={iframeRef} width="100%" height={1500} />;
}
