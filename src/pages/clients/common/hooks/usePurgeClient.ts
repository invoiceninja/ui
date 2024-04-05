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
import { useSetAtom } from 'jotai';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';
import { Dispatch, SetStateAction } from 'react';

interface Params {
  setIsPurgeOrMergeActionCalled?: Dispatch<SetStateAction<boolean>>;
}
export function usePurgeClient(params?: Params) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { setIsPurgeOrMergeActionCalled } = params || {};

  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  return (password: string, clientId: string) => {
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
          toast.error('password_error_incorrect');
          setLastPasswordEntryTime(0);
        }

        setIsPurgeOrMergeActionCalled?.(false);
      });
  };
}
