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
import { request } from '$app/common/helpers/request';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { toast } from '$app/common/helpers/toast/toast';
import { useSetAtom } from 'jotai';
import { isDeleteActionTriggeredAtom } from '../../common/components/ProductsTable';
import { useHandleCompanySave } from '$app/pages/settings/common/hooks/useHandleCompanySave';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Dispatch, SetStateAction } from 'react';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useSearchParams } from 'react-router-dom';

interface Params {
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
}
export function useHandleSave(params: Params) {
  const { setErrors, isDefaultTerms, isDefaultFooter } = params;

  const [searchParams] = useSearchParams();

  const saveCompany = useHandleCompanySave();
  const refreshCompanyUsers = useRefreshCompanyUsers();
  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  return async (invoice: Invoice) => {
    setErrors(undefined);
    toast.processing();

    await saveCompany({ excludeToasters: true });

    let apiEndpoint = '/api/v1/invoices/:id?';

    if (isDefaultTerms) {
      apiEndpoint += 'save_default_terms=true';
      if (isDefaultFooter) {
        apiEndpoint += '&save_default_footer=true';
      }
    } else if (isDefaultFooter) {
      apiEndpoint += 'save_default_footer=true';
    }

    request('PUT', endpoint(apiEndpoint, { id: invoice.id }), invoice)
      .then(async () => {
        if (isDefaultTerms || isDefaultFooter) {
          await refreshCompanyUsers();
        }

        toast.success('updated_invoice');

        $refetch(['products', 'invoices']);

        if (searchParams.get('action') === 'add_tasks') {
          $refetch(['tasks']);
        }
      })
      .catch((error) => {
        if (error.response?.status === 422) {
          const errorMessages = error.response.data;

          if (errorMessages.errors.amount) {
            toast.error(errorMessages.errors.amount[0]);
          } else {
            toast.dismiss();
          }

          setErrors(errorMessages);
        }
      })
      .finally(() => setIsDeleteActionTriggered(undefined));
  };
}
