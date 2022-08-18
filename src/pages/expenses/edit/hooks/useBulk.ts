/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { toast } from 'common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { generatePath } from 'react-router-dom';

export type BulkAction = 'archive' | 'restore' | 'delete';

export function useBulk() {
  const queryClient = useQueryClient();

  const invalidateCache = (id: string) =>
    queryClient.invalidateQueries(generatePath('/api/v1/expenses/:id', { id }));

  return (ids: string[], action: BulkAction) => {
    toast.processing();

    request('POST', endpoint('/api/v1/expenses/bulk'), { ids, action })
      .then(() => toast.success(`${action}d_expense`))
      .catch((error) => {
        console.error(error);
        toast.error();
      })
      .finally(() => ids.forEach((id) => invalidateCache(id)));
  };
}
