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
import { Dispatch, SetStateAction } from 'react';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Params {
  companyGatewayId: string;
  accountId: string;
  setIsPasswordConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsFormBusy: Dispatch<SetStateAction<boolean>>;
  isFormBusy: boolean;
}

export function useHandleStripeDisconnect({
  companyGatewayId,
  accountId,
  setIsPasswordConfirmModalOpen,
  setIsFormBusy,
  isFormBusy,
}: Params) {
  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  return (password: string, isPasswordRequired: boolean) => {
    if (isFormBusy) {
      return;
    }

    toast.processing();
    setIsFormBusy(true);

    request(
      'POST',
      endpoint('/api/v1/stripe/disconnect/:id', { id: companyGatewayId }),
      { account_id: accountId },
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => {
        toast.success('disconnected_gateway');

        $refetch(['company_gateways']);
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 412) {
          onWrongPasswordEnter(isPasswordRequired);

          setIsPasswordConfirmModalOpen(true);
        }
      })
      .finally(() => setIsFormBusy(false));
  };
}
