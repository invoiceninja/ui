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
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { useQuery } from 'react-query';
import { generatePath } from 'react-router-dom';

export function usePurchaseOrderQuery(params: { id: string | undefined }) {
  return useQuery<PurchaseOrder>(
    generatePath('/api/v1/purchase_orders/:id', { id: params.id }),
    () =>
      request(
        'GET',
        endpoint('/api/v1/purchase_orders/:id', { id: params.id })
      ).then((response) => response.data.data),
    { staleTime: Infinity }
  );
}
