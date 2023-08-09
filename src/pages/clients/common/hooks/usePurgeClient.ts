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
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useAtomValue, useSetAtom } from 'jotai';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { lastPasswordEntryTimeAtom } from '$app/common/atoms/password-confirmation';

export function usePurgeClient(clientId: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const setLastPasswordEntryTime = useSetAtom(lastPasswordEntryTimeAtom);

  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (password: string) => {
    toast.processing();

    request(
      'POST',
      endpoint('/api/v1/clients/:id/purge', { id: clientId }),
      {},
      { headers: { 'X-Api-Password': password } }
    )
      .then(() => {
        toast.success('purged_client');

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);

        navigate('/clients');
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 412) {
          toast.error('password_error_incorrect');
          setLastPasswordEntryTime(0);
        }
      });
  };
}
