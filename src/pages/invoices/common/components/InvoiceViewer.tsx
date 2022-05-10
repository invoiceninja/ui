/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { request } from 'common/helpers/request';
import { defaultHeaders } from 'common/queries/common/headers';
import { useEffect, useRef } from 'react';
import { useQueryClient } from 'react-query';

interface Props {
  link: string;
  resource?: unknown;
  method: 'GET' | 'POST';
  onLink?: (url: string) => unknown;
}

export function InvoiceViewer(props: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient
      .fetchQuery(props.link, () =>
        request(props.method, props.link, props.resource, {
          responseType: 'arraybuffer',
        })
      )
      .then((response) => {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        if (iframeRef.current) {
          iframeRef.current.src = url;

          props.onLink && props.onLink(url);
        }
      })
      .catch((error) => console.error(error));
  }, [props.link, props.resource]);

  return <iframe ref={iframeRef} width="100%" height={1500} />;
}
