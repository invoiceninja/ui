/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQueryClient } from 'react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';

type Action = 'archive' | 'restore' | 'delete' | 'invoice';

export function useBulkAction() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return async (ids: string[], action: Action) => {
    toast.processing();

    return request('POST', endpoint('/api/v1/projects/bulk'), {
      action,
      ids,
    })
      .then((response) => {
        if (action !== 'invoice') {
          toast.success(`${action}d_project`);
        }

        return response;
      })
      .finally(() => {
        $refetch(['projects']);

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);
      });
  };
}
