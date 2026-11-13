/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';

interface Props {
  entity: 'invoice' | 'quote';
}

export function useConvertToPurchaseOrder({ entity }: Props) {
  const navigate = useNavigate();

  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);

  return (ids: string[]) => {
    toast.processing();

    request('POST', endpoint(`/api/v1/${entity}s/bulk`), {
      action: 'convert_to_purchase_order',
      ids,
    }).then((response: GenericSingleResourceResponse<PurchaseOrder>) => {
      const purchaseOrder = response.data.data;

      purchaseOrder.line_items.forEach((lineItem) => (lineItem._id = v4()));

      setPurchaseOrder(purchaseOrder);

      toast.dismiss();

      navigate('/purchase_orders/create?action=convert_to_purchase_order');
    });
  };
}
