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
import { useQuery, useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { AxiosError } from 'axios';

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

export function useBulk() {
  const queryClient = useQueryClient();

  return (id: string, action: 'archive' | 'restore' | 'delete' | 'expense') => {
    toast.processing();

    request('POST', endpoint('/api/v1/purchase_orders/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        action === 'expense'
          ? toast.success('converted_to_expense')
          : toast.success(`${action}d_purchase_order`);

        queryClient.invalidateQueries('/api/v1/purchase_orders');

        queryClient.invalidateQueries(
          route('/api/v1/purchase_orders/:id', { id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();
      });
  };
}

export function useMarkSent() {
  const queryClient = useQueryClient();

  return (purchaseOrder: PurchaseOrder) => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/purchase_orders/:id?mark_sent=true', {
        id: purchaseOrder.id,
      }),
      purchaseOrder
    )
      .then(() => {
        toast.success('notification_purchase_order_sent');

        queryClient.invalidateQueries(
          route('/api/v1/purchase_orders/:id', { id: purchaseOrder.id })
        );
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();
      });
  };
}
