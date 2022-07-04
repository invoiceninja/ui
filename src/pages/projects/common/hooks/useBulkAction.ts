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
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';

export function useBulkAction() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    const toastId = toast.loading(t('processing'));

    request('POST', endpoint('/api/v1/projects/bulk'), {
      action,
      ids: [id],
    })
      .then(() =>
        toast.success(t(`${action}d_project`), {
          id: toastId,
        })
      )
      .catch((error: AxiosError) => {
        console.error(error.response?.data);

        toast.error(t('error_title'), {
          id: toastId,
        });
      })
      .finally(() => {
        queryClient.invalidateQueries(
          generatePath('/api/v1/projects/:id', { id })
        );
      });
  };
}
