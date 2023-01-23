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
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { BankAccount } from 'common/interfaces/bank-accounts';
import { GenericSingleResourceResponse } from 'common/interfaces/generic-api-response';
import { ValidationBag } from 'common/interfaces/validation-bag';
import { Dispatch, FormEvent, SetStateAction } from 'react';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

export function useHandleCreate(
  bankAccount: BankAccount | undefined,
  setErrors: Dispatch<SetStateAction<ValidationBag | undefined>>,
  setIsFormBusy: Dispatch<SetStateAction<boolean>>,
  isFormBusy: boolean,
  setIsModalOpened?: Dispatch<SetStateAction<boolean>>,
  onCreatedBankAccount?: (bankAccount: BankAccount) => unknown
) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormBusy && bankAccount) {
      toast.processing();
      setErrors(undefined);
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/bank_integrations'), bankAccount)
        .then((response: GenericSingleResourceResponse<BankAccount>) => {
          toast.success('created_bank_account');

          queryClient.invalidateQueries('/api/v1/bank_integrations');

          if (!setIsModalOpened) {
            navigate('/settings/bank_accounts');
          } else {
            window.dispatchEvent(
              new CustomEvent('invalidate.combobox.queries', {
                detail: {
                  url: endpoint('/api/v1/bank_integrations'),
                },
              })
            );

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
          } else {
            console.error(error);
            toast.error();
          }
        })
        .finally(() => setIsFormBusy(false));
    }
  };
}
