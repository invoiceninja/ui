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
import { setCurrentQuote } from 'common/stores/slices/quotes/extra-reducers/set-current-quote';
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

    request('POST', endpoint('/api/v1/quotes/bulk'), {
      action,
      ids: [id],
    })
      .then((response) => {
        toast.success(t(`${action}d_quote`), {
          id: toastId,
        });

        dispatch(setCurrentQuote(response.data.data[0]));
      })
      .catch((error: AxiosError) => {
        console.log(error);
        console.error(error.response?.data);

        toast.error(t('error_title'), {
          id: toastId,
        });
      })
      .finally(() => {
        queryClient.invalidateQueries(endpoint('/api/v1/quotes'));
      });
  };
}
