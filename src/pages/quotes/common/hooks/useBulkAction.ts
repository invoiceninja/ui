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
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';

export function useBulkAction() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (
    id: string,
    action: 'archive' | 'restore' | 'delete' | 'convert_to_invoice'
  ) => {
    toast.processing();

    request('POST', endpoint('/api/v1/quotes/bulk'), {
      action,
      ids: [id],
    })
      .then(() => {
        action === 'convert_to_invoice'
          ? toast.success('converted_quote')
          : toast.success(`${action}d_quote`);
      })
      .catch((error: AxiosError) => {
        console.error(error);

        toast.error();
      })
      .finally(() => {
        queryClient.invalidateQueries('/api/v1/quotes');

        queryClient.invalidateQueries(route('/api/v1/quotes/:id', { id }));

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);
      });
  };
}
