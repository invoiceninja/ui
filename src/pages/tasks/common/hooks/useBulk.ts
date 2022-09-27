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
import { useQueryClient } from 'react-query';
import { route } from 'common/helpers/route';

export function useBulkAction() {
  const queryClient = useQueryClient();

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/tasks/bulk'), {
      action,
      ids: [id],
    })
      .then(() => toast.success(`${action}d_task`))
      .catch((error: AxiosError) => {
        console.error(error);
        console.error(error.response?.data);

        toast.error();
      })
      .finally(() => {
        queryClient.invalidateQueries('/api/v1/tasks');

        queryClient.invalidateQueries(
          route('/api/v1/tasks/:id', { id })
        );
      });
  };
}
