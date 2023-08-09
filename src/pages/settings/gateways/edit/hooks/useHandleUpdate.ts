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
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import { Dispatch, SetStateAction } from 'react';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

export function useHandleUpdate(
  companyGateway: CompanyGateway | undefined,
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>
) {
  const queryClient = useQueryClient();

  return () => {
    if (!companyGateway) {
      return;
    }

    setErrors(undefined);
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/company_gateways/:id', { id: companyGateway?.id }),
      companyGateway
    )
      .then(() => {
        toast.success('updated_company_gateway');

        queryClient.invalidateQueries('/api/v1/company_gateways');

        queryClient.invalidateQueries(
          route('/api/v1/company_gateways/:id', {
            id: companyGateway?.id,
          })
        );
      })
      .catch((error) => {
        if (error?.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);
        }
      });
  };
}
