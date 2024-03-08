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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useSetAtom } from 'jotai';
import { isDeleteActionTriggeredAtom } from '$app/pages/invoices/common/components/ProductsTable';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Dispatch, SetStateAction } from 'react';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';

interface Props {
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}
export function useSave(props: Props) {
  const { setErrors, isDefaultFooter, isDefaultTerms } = props;

  const refreshCompanyUsers = useRefreshCompanyUsers();
  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  return (purchaseOrder: PurchaseOrder) => {
    setErrors(undefined);
    toast.processing();

    let apiEndpoint = '/api/v1/purchase_orders/:id?';

    if (isDefaultTerms) {
      apiEndpoint += 'save_default_terms=true';
      if (isDefaultFooter) {
        apiEndpoint += '&save_default_footer=true';
      }
    } else if (isDefaultFooter) {
      apiEndpoint += 'save_default_footer=true';
    }

    request(
      'PUT',
      endpoint(apiEndpoint, { id: purchaseOrder.id }),
      purchaseOrder
    )
      .then(async () => {
        if (isDefaultTerms || isDefaultFooter) {
          await refreshCompanyUsers();
        }

        toast.success('updated_purchase_order');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => {
        setIsDeleteActionTriggered(undefined);

        $refetch(['purchase_orders']);
      });
  };
}
