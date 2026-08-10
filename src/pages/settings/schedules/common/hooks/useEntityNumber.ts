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
import { Credit } from '$app/common/interfaces/credit';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { Quote } from '$app/common/interfaces/quote';
import { Parameters } from '$app/common/interfaces/schedule';
import { useQuery } from 'react-query';

interface Params {
  entity: Parameters['entity'] | undefined;
  entityId: string | undefined;
  enabled: boolean;
}

export type EntityWithNumber = Invoice | Quote | Credit | PurchaseOrder;

export function useEntityResource({ entity, entityId, enabled }: Params) {
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

  return entityResponse;
}

export function useEntityNumber(params: Params) {
  return useEntityResource(params)?.number || '';
}
