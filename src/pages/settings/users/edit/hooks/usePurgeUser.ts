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
import { useNavigate } from 'react-router-dom';
import { Dispatch, SetStateAction } from 'react';
import { useOnWrongPasswordEnter } from '$app/common/hooks/useOnWrongPasswordEnter';
import { $refetch } from '$app/common/hooks/useRefetch';

interface Params {
  setPasswordConfirmModalOpen: Dispatch<SetStateAction<boolean>>;
}
export function usePurgeUser({ setPasswordConfirmModalOpen }: Params) {
  const navigate = useNavigate();

  const onWrongPasswordEnter = useOnWrongPasswordEnter();

  return (password: string, userId: string, isPasswordRequired: boolean) => {
    toast.processing();

    request(
      'POST',
      endpoint('/api/v1/users/:id/purge', { id: userId }),
      {},
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => {
        toast.success('purged_user');

        $refetch(['users']);

        navigate('/settings/users');
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 412) {
          onWrongPasswordEnter(isPasswordRequired);
          setPasswordConfirmModalOpen(true);
        }
      });
  };
}
