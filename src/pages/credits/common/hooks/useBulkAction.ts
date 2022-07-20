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
import { setCurrentCredit } from 'common/stores/slices/credits/extra-reducers/set-current-credit';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';

export function useBulkAction() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    const toastId = toast.loading(t('processing'));

    request('POST', endpoint('/api/v1/credits/bulk'), {
      action,
      ids: [id],
    })
      .then((response) => {
        toast.success(t(`${action}d_credit`), {
          id: toastId,
        });

        dispatch(setCurrentCredit(response.data.data[0]));
      })
      .catch((error: AxiosError) => {
        console.log(error);
        console.error(error.response?.data);

        toast.error(t('error_title'), {
          id: toastId,
        });
      })
      .finally(() => {
        queryClient.invalidateQueries('/api/v1/credits');
      });
  };
}
