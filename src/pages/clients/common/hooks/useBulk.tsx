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
import { invalidationQueryAtom } from 'common/atoms/data-table';
import { endpoint } from 'common/helpers';
import { request } from 'common/helpers/request';
import { route } from 'common/helpers/route';
import { toast } from 'common/helpers/toast/toast';
import { useAtomValue } from 'jotai';
import { useQueryClient } from 'react-query';

export function useBulk() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (id: string, action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    request('POST', endpoint('/api/v1/clients/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        toast.success(`${action}d_client`);

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);

        queryClient.invalidateQueries(route('/api/v1/clients/:id', { id }));
      })
      .catch((error: AxiosError) => {
        console.error(error);
        toast.error();
      });
  };
}
