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
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { GenericQueryOptions } from '$app/common/queries/invoices';
import { useQuery, useQueryClient } from 'react-query';
import { toast } from '$app/common/helpers/toast/toast';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { $refetch } from '../hooks/useRefetch';
import { useHasPermission } from '../hooks/permissions/useHasPermission';

export function useBlankPurchaseOrderQuery(options?: GenericQueryOptions) {
  const hasPermission = useHasPermission();

  return useQuery<PurchaseOrder>(
    ['/api/v1/purchase_orders', 'create'],
    () =>
      request('GET', endpoint('/api/v1/purchase_orders/create')).then(
        (response: GenericSingleResourceResponse<PurchaseOrder>) =>
          response.data.data
      ),
    {
      ...options,
      staleTime: Infinity,
      enabled: hasPermission('create_purchase_order')
        ? options?.enabled ?? true
        : false,
    }
  );
}

export function usePurchaseOrderQuery(params: { id: string | undefined }) {
  return useQuery<PurchaseOrder>(
    ['/api/v1/purchase_orders', params.id],
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

const successMessages = {
  expense: 'converted_to_expense',
  email: 'emailed_purchase_orders',
  mark_sent: 'marked_purchase_orders_as_sent',
  add_to_inventory: 'added_purchase_orders_to_inventory',
};

export function useBulk() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (
    ids: string[],
    action:
      | 'archive'
      | 'restore'
      | 'delete'
      | 'expense'
      | 'email'
      | 'mark_sent'
      | 'add_to_inventory'
  ) => {
    toast.processing();

    request('POST', endpoint('/api/v1/purchase_orders/bulk'), {
      action,
      ids,
    }).then(() => {
      const message =
        successMessages[action as keyof typeof successMessages] ||
        `${action}d_purchase_order`;

      toast.success(message);

      $refetch(['purchase_orders']);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);
    });
  };
}

export function useMarkSent() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (purchaseOrder: PurchaseOrder) => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/purchase_orders/:id?mark_sent=true', {
        id: purchaseOrder.id,
      }),
      purchaseOrder
    ).then(() => {
      toast.success('marked_purchase_order_as_sent');

      $refetch(['purchase_orders']);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);
    });
  };
}
