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
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Parameters } from '$app/common/interfaces/schedule';
import { useQuery } from 'react-query';

interface Params {
  entity: Parameters['entity'] | undefined;
  entityId: string | undefined;
  enabled: boolean;
}

interface EntityWithNumber {
  number: string;
}

export function useEntityNumber({ entity, entityId, enabled }: Params) {
  const { data: entityResponse } = useQuery<EntityWithNumber>(
    [`/api/v1/${entity}s/:id`, entityId, 'schedule_entity_number'],
    () =>
      request(
        'GET',
        endpoint(`/api/v1/${entity}s/:id`, {
          id: entityId,
        })
      ).then(
        (response: GenericSingleResourceResponse<EntityWithNumber>) =>
          response.data.data
      ),
    { staleTime: Infinity, enabled: Boolean(entity && entityId && enabled) }
  );

  return entityResponse?.number || '';
}
