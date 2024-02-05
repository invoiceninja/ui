/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtomValue } from 'jotai';
import { useQueryClient } from 'react-query';
import { invalidationQueryAtom } from '../atoms/data-table';
import { toast } from '../helpers/toast/toast';
import { request } from '../helpers/request';
import { endpoint } from '../helpers';
import { $refetch } from '../hooks/useRefetch';

export function useBulkAction() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return async (ids: string[], action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    return request('POST', endpoint('/api/v1/designs/bulk'), {
      action,
      ids,
    }).then(() => {
      toast.success(`${action}d_design`);

      $refetch(['designs']);

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);
    });
  };
}
