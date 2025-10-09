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
import { $refetch } from '$app/common/hooks/useRefetch';
import { Dispatch, SetStateAction } from 'react';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useOpenFeedbackSlider } from '$app/common/hooks/useOpenFeedbackSlider';

interface Params {
  isDefaultTerms: boolean;
  isDefaultFooter: boolean;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  isFormBusy: boolean;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
}
export function useHandleCreate(params: Params) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const openFeedbackSlider = useOpenFeedbackSlider();

  const {
    setErrors,
    isDefaultTerms,
    isDefaultFooter,
    setIsFormBusy,
    isFormBusy,
  } = params;

  const refreshCompanyUsers = useRefreshCompanyUsers();
  const saveCompany = useHandleCompanySave();
  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  return async (invoice: Invoice) => {
    if (isFormBusy) {
      return;
    }

    toast.processing();
    setIsFormBusy(true);
    setErrors(undefined);

    await saveCompany({ excludeToasters: true });

    let apiEndpoint = '/api/v1/invoices?';

    if (isDefaultTerms) {
      apiEndpoint += 'save_default_terms=true';
      if (isDefaultFooter) {
        apiEndpoint += '&save_default_footer=true';
      }
    } else if (isDefaultFooter) {
      apiEndpoint += 'save_default_footer=true';
    }

    request('POST', endpoint(apiEndpoint), invoice)
      .then(async (response: GenericSingleResourceResponse<Invoice>) => {
        if (isDefaultTerms || isDefaultFooter) {
          await refreshCompanyUsers();
        }

        toast.success('created_invoice');

        $refetch(['products', 'tasks']);

        if (searchParams.get('action') === 'invoice_expense') {
          $refetch(['expenses']);
        }

        navigate(
          route('/invoices/:id/edit?table=:table', {
            id: response.data.data.id,
            table: searchParams.get('table') ?? 'products',
          })
        );

        openFeedbackSlider();
      })
      .catch((error: AxiosError<ValidationBag>) => {
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
      .finally(() => {
        setIsDeleteActionTriggered(undefined);
        setIsFormBusy(false);
      });
  };
}
