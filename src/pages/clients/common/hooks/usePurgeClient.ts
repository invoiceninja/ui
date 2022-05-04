/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export function usePurgeClient(clientId: string | undefined) {
  const [t] = useTranslation();
  const navigate = useNavigate();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (password: string, passwordIsRequired: boolean) => {
    const toastId = toast.loading(t('processing'));

    axios
      .post(
        endpoint('/api/v1/clients/:id/purge', { id: clientId }),
        {},
        {
          headers: { 'X-Api-Password': password, ...defaultHeaders() },
        }
      )
      .then(() => {
        toast.success(t('purged_client'), { id: toastId });
        navigate('/clients');
      })
      .catch((error: AxiosError) => {
        console.error(error);

        error.response?.status === 412
          ? toast.error(t('password_error_incorrect'), { id: toastId })
          : toast.error(t('error_title'), { id: toastId });
      })
      .finally(() => {});
  };
}
