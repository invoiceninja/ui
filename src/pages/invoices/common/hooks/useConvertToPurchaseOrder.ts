/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from 'axios';
import { useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { purchaseOrderAtom } from '$app/pages/purchase-orders/common/atoms';

export function useConvertToPurchaseOrder() {
  const navigate = useNavigate();

  const setPurchaseOrder = useSetAtom(purchaseOrderAtom);

  return (ids: string[]) => {
    toast.processing();

    request('POST', endpoint('/api/v1/invoices/bulk'), {
      action: 'convert_to_purchase_order',
      ids,
    }).then((response: AxiosResponse<GenericManyResponse<PurchaseOrder>>) => {
      const purchaseOrder = response.data.data[0];

      purchaseOrder.line_items.forEach((lineItem) => (lineItem._id = v4()));

      setPurchaseOrder(purchaseOrder);

      toast.dismiss();

      navigate('/purchase_orders/create?action=convert_to_purchase_order');
    });
  };
}
