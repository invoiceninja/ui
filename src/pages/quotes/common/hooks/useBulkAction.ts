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
import { generatePath } from 'react-router-dom';

export function useBulkAction() {
  const queryClient = useQueryClient();

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/quotes/bulk'), {
      action,
      ids: [id],
    })
      .then(() => toast.success(`${action}d_quote`))
      .catch((error: AxiosError) => {
        console.log(error);

        toast.error();
      })
      .finally(() => {
        queryClient.invalidateQueries('/api/v1/quotes');

        queryClient.invalidateQueries(
          generatePath('/api/v1/quotes/:id', { id })
        );
      });
  };
}
