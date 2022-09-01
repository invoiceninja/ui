/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { generatePath, useNavigate } from 'react-router-dom';

export function useSave(setErrors: (errors: ValidationBag) => unknown) {
  const navigate = useNavigate();

  return (purchaseOrder: PurchaseOrder) => {
    toast.processing();

    request('POST', endpoint('/api/v1/purchase_orders'), purchaseOrder)
      .then((response: GenericSingleResourceResponse<PurchaseOrder>) => {
        toast.success('created_purchase_order');

        navigate(
          generatePath('/purchase_orders/:id/edit', {
            id: response.data.data.id,
          })
        );
      })
      .catch((error: AxiosError) => {
        error.response?.status === 422
          ? toast.dismiss() && setErrors(error.response.data)
          : toast.error();
      });
  };
}
