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

export function useTaskStatusesQuery(params: Params) {
  return useQuery(['/api/v1/task_statuses', params], () =>
    axios.get(
      endpoint(
        '/api/v1/task_statuses?per_page=:perPage&page=:currentPage&sort=:sort',
        {
          perPage: params.perPage,
          currentPage: params.currentPage,
          sort: params.sort ?? 'id|asc',
        }
      ),
      { headers: defaultHeaders }
    )
  );
}
