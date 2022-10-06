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
import { useNavigate } from 'react-router-dom';

export function usePurgeClient(clientId: string | undefined) {
  const navigate = useNavigate();

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

        navigate('/clients');
      })
      .catch((error: AxiosError) => {
        console.error(error);

        error.response?.status === 412
          ? toast.error('password_error_incorrect')
          : toast.error();
      })
      .finally(() => {});
  };
}
