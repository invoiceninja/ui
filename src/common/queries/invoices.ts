/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { endpoint } from 'common/helpers';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';
import { defaultHeaders } from './common/headers';

export function useInvoiceQuery(
  params: { id: string | undefined },
  options: Record<string, any> = {}
) {
  return useQuery(
    generatePath('/api/v1/invoices/:id', { id: params.id }),
    () =>
      axios.get(endpoint('/api/v1/invoices/:id', { id: params.id }), {
        headers: defaultHeaders,
      }),
    { ...options, staleTime: Infinity }
  );
}
