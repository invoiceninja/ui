/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { GenericQueryOptions } from 'common/queries/invoices';
import { useQuery } from 'react-query';
import { route } from 'common/helpers/route';

export function useBlankPurchaseOrderQuery(options?: GenericQueryOptions) {
  return useQuery<PurchaseOrder>(
    '/api/v1/purchase_orders/create',
    () =>
      request('GET', endpoint('/api/v1/purchase_orders/create')).then(
        (response: GenericSingleResourceResponse<PurchaseOrder>) =>
          response.data.data
      ),
    { ...options, staleTime: Infinity }
  );
}

export function usePurchaseOrderQuery(params: { id: string | undefined }) {
  return useQuery<PurchaseOrder>(
    route('/api/v1/purchase_orders/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/purchase_orders/:id', { id: params.id })
      ).then(
        (response: GenericSingleResourceResponse<PurchaseOrder>) =>
          response.data.data
      ),
    { staleTime: Infinity }
  );
}
