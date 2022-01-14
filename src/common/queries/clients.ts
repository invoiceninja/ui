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
import { defaultHeaders } from './common/headers';
import { Params } from './common/params.interface';

export function useClientsQuery(params: Params) {
  return useQuery(['/api/v1/clients', params], () =>
    axios.get(
      endpoint('/api/v1/clients?per_page=:perPage&page=:currentPage', {
        perPage: params.perPage,
        currentPage: params.currentPage,
      }),
      { headers: defaultHeaders }
    )
  );
}
