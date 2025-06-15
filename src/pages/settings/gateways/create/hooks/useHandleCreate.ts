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
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { route } from '$app/common/helpers/route';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Params {
  companyGateway: CompanyGateway | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  isFormBusy: boolean;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
}

export function useHandleCreate({
  companyGateway,
  setErrors,
  isFormBusy,
  setIsFormBusy,
}: Params) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (defaultTabIndex: number) => {
    if (isFormBusy) {
      return;
    }

    toast.processing();
    setIsFormBusy(true);
    setErrors(undefined);

    request('POST', endpoint('/api/v1/company_gateways'), companyGateway)
      .then((response: GenericSingleResourceResponse<CompanyGateway>) => {
        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);

        $refetch(['company_gateways']);

        toast.success('created_company_gateway');

        navigate(
          route('/settings/gateways/:id/edit?tab=:defaultTabIndex', {
            id: response.data.data.id,
            defaultTabIndex,
          })
        );
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error?.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      })
      .finally(() => setIsFormBusy(false));
  };
}
