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
import { BankAccount } from '$app/common/interfaces/bank-accounts';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Dispatch, FormEvent, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { $refetch } from '$app/common/hooks/useRefetch';

export function useHandleCreate(
  bankAccount: BankAccount | undefined,
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>,
  setIsFormBusy: Dispatch<SetStateAction<boolean>>,
  isFormBusy: boolean,
  setIsModalOpened?: Dispatch<SetStateAction<boolean>>,
  onCreatedBankAccount?: (bankAccount: BankAccount) => unknown
) {
  const navigate = useNavigate();

  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormBusy && bankAccount) {
      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/bank_integrations'), bankAccount)
        .then((response: GenericSingleResourceResponse<BankAccount>) => {
          toast.success('created_bank_account');

          $refetch(['bank_integrations']);

          if (!setIsModalOpened) {
            navigate('/settings/bank_accounts');
          } else {
            $refetch(['bank_integrations']);

            if (onCreatedBankAccount) {
              onCreatedBankAccount(response.data.data);
            }

            setIsModalOpened(false);
          }
        })
        .catch((error: AxiosError<ValidationBag>) => {
          if (error.response?.status === 422) {
            toast.dismiss();
            setErrors(error.response.data);
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };
}
