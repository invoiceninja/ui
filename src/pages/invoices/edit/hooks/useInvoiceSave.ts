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
import { Invoice } from '$app/common/interfaces/invoice';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { request } from '$app/common/helpers/request';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { toast } from '$app/common/helpers/toast/toast';
import { useSetAtom } from 'jotai';
import { isDeleteActionTriggeredAtom } from '../../common/components/ProductsTable';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';

export function useHandleSave(
  setErrors: (errors: ValidationBag | undefined) => unknown
) {
  const queryClient = useQueryClient();
  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);
  const saveCompany = useHandleCompanySave();

  return async (invoice: Invoice) => {
    setErrors(undefined);

    toast.processing();

    await saveCompany(true);

    request(
      'PUT',
      endpoint('/api/v1/invoices/:id', { id: invoice.id }),
      invoice
    )
      .then(() => toast.success('updated_invoice'))
      .catch((error) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => {
        setIsDeleteActionTriggered(undefined);

        queryClient.invalidateQueries(
          route('/api/v1/invoices/:id', { id: invoice.id })
        );
      });
  };
}
