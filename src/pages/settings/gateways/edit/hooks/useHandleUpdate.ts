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
import { request } from '$app/common/helpers/request';
import { CompanyGateway } from '$app/common/interfaces/company-gateway';
import { toast } from '$app/common/helpers/toast/toast';
import { Dispatch, SetStateAction } from 'react';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Params {
  companyGateway: CompanyGateway | undefined;
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
  isFormBusy: boolean;
}

export function useHandleUpdate({
  companyGateway,
  setErrors,
  setIsFormBusy,
  isFormBusy,
}: Params) {
  return () => {
    if (!companyGateway || isFormBusy) {
      return;
    }

    setErrors(undefined);
    toast.processing();
    setIsFormBusy(true);

    request(
      'PUT',
      endpoint('/api/v1/company_gateways/:id', { id: companyGateway?.id }),
      companyGateway
    )
      .then(() => {
        toast.success('updated_company_gateway');

        $refetch(['company_gateways']);
      })
      .catch((error) => {
        if (error?.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      })
      .finally(() => setIsFormBusy(false));
  };
}
