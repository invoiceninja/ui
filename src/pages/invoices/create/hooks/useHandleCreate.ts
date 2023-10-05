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
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Invoice } from '$app/common/interfaces/invoice';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import { isDeleteActionTriggeredAtom } from '../../common/components/ProductsTable';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';
import { useQueryClient } from 'react-query';
import { useResolveProduct } from '$app/common/hooks/useResolveProduct';

export function useHandleCreate(
  setErrors: (errors: ValidationBag | undefined) => unknown
) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryClient = useQueryClient();

  const resolveProduct = useResolveProduct({ resolveByProductKey: true });

  const saveCompany = useHandleCompanySave();

  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  return async (invoice: Invoice) => {
    toast.processing();
    setErrors(undefined);

    await saveCompany(true);

    request('POST', endpoint('/api/v1/invoices'), invoice)
      .then((response: GenericSingleResourceResponse<Invoice>) => {
        toast.success('created_invoice');

        queryClient.invalidateQueries('/api/v1/products');

        response.data.data.line_items.forEach(({ product_key }) => {
          if (product_key) {
            const currentProduct = resolveProduct(product_key);

            if (currentProduct) {
              queryClient.invalidateQueries(
                route('/api/v1/products/:id', { id: currentProduct.id })
              );
            }
          }
        });

        navigate(
          route('/invoices/:id/edit?table=:table', {
            id: response.data.data.id,
            table: searchParams.get('table') ?? 'products',
          })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      })
      .finally(() => setIsDeleteActionTriggered(undefined));
  };
}
