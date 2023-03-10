/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { Credit } from '$app/common/interfaces/credit';
import { useAtomValue } from 'jotai';
import { useQueryClient } from 'react-query';

export function useMarkSent() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (credit: Credit) => {
    toast.processing();

    request(
      'PUT',
      endpoint('/api/v1/credits/:id?mark_sent=true', { id: credit.id }),
      credit
    )
      .then(() => {
        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);

        toast.success('updated_credit');
      })
      .catch((error) => {
        console.error(error);

        toast.error();
      });
  };
}
