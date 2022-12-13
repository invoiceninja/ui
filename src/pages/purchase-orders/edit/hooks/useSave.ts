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
import { PurchaseOrder } from 'common/interfaces/purchase-order';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';

export function useSave(setErrors: (errors: ValidationBag) => unknown) {
  const queryClient = useQueryClient();

  return (purchaseOrder: PurchaseOrder) => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/purchase_orders/:id', { id: purchaseOrder.id }),
      purchaseOrder
    )
      .then(() => toast.success('updated_purchase_order'))
      .catch((error: AxiosError<ValidationBag>) => {
        error.response?.status === 422
          ? toast.dismiss() && setErrors(error.response.data)
          : toast.error();
      })
      .finally(() =>
        queryClient.invalidateQueries(
          route('/api/v1/purchase_orders/:id', { id: purchaseOrder.id })
        )
      );
  };
}
