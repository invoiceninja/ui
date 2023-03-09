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

export function useHandleCreate(
  companyGateway: CompanyGateway | undefined,
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>
) {
  const navigate = useNavigate();

  return () => {
    toast.processing();

    setErrors(undefined);

    request('POST', endpoint('/api/v1/company_gateways'), companyGateway)
      .then(() => {
        toast.success('created_company_gateway');
        navigate('/settings/online_payments');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error?.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        } else {
          console.error(error);
          toast.error();
        }
      });
  };
}
