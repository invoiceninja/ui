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
import { Design } from '$app/common/interfaces/design';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { useQuery } from 'react-query';
import { AxiosResponse } from 'axios';

export function useDesignsQuery() {
  return useQuery<Design[]>(
    ['/api/v1/designs'],
    () =>
      request('GET', endpoint('/api/v1/designs')).then(
        (response: AxiosResponse<GenericManyResponse<Design>>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}
