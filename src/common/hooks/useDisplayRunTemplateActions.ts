/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { endpoint } from '../helpers';
import { request } from '../helpers/request';
import { Design } from '../interfaces/design';
import { GenericManyResponse } from '../interfaces/generic-many-response';

export function useDisplayRunTemplateActions() {
  const { data } = useQuery({
    queryKey: ['/api/v1/designs', '?template=true&status=active&sort=name|asc'],

    queryFn: () =>
      request(
        'GET',
        endpoint('/api/v1/designs?template=true&status=active&sort=name|asc')
      ).then(
        (response: AxiosResponse<GenericManyResponse<Design>>) =>
          response.data.data
      ),

    staleTime: Infinity,
  });

  return {
    shouldBeVisible: typeof data !== 'undefined' ? data.length > 0 : false,
  };
}
