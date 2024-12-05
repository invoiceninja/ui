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
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';

interface Params {
  setIsPurgeOrMergeActionCalled?: Dispatch<SetStateAction<boolean>>;
  setPasswordConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
}
export function usePurgeClient(params: Params) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { setIsPurgeOrMergeActionCalled, setPasswordConfirmModalOpen } = params;

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  return (password: string, clientId: string, isPasswordRequired: boolean) => {
    toast.processing();
    setIsPurgeOrMergeActionCalled?.(true);

    request(
      'POST',
      endpoint('/api/v1/clients/:id/purge', { id: clientId }),
      {},
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => {
        toast.success('purged_client');

        queryClient.invalidateQueries();

        navigate('/clients');
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 412) {
          onWrongPasswordEnter(isPasswordRequired);
          setPasswordConfirmModalOpen(true);
        }

        setIsPurgeOrMergeActionCalled?.(false);
      });
  };
}
