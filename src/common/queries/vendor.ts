/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from 'axios';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';
import { endpoint } from '../helpers';
import { defaultHeaders } from './common/headers';

export function useVendorQuery(params: { id: string | undefined }) {
  return useQuery(
    generatePath('/api/v1/vendors/:id', { id: params.id }),
    () =>
      axios.get(endpoint('/api/v1/vendors/:id', { id: params.id }), {
        headers: defaultHeaders,
      }),
    { staleTime: Infinity }
  );
}

export function useBlankVendorQuery() {
  return useQuery(
    endpoint('/api/v1/vendors/create'),
    () =>
      axios.get(endpoint('/api/v1/vendors/create'), {
        headers: defaultHeaders,
      }),
    { staleTime: Infinity }
  );
}
