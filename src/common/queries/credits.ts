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
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';

const successMessages = {
  email: 'emailed_credits',
  mark_sent: 'marked_credit_as_sent',
};

interface Params {
  onActionCall?: () => void;
}
export const useBulk = (params?: Params) => {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  const { onActionCall } = params || {};

  return (
    ids: string[],
    action: 'archive' | 'restore' | 'delete' | 'email' | 'mark_sent'
  ) => {
    toast.processing();

    request('POST', endpoint('/api/v1/credits/bulk'), {
      action,
      ids,
    })
      .then(() => {
        const message =
          successMessages[action as keyof typeof successMessages] ||
          `${action}d_invoice`;

        toast.success(message);

        queryClient.invalidateQueries('/api/v1/credits');

        ids.forEach((id) =>
          queryClient.invalidateQueries(route('/api/v1/credits/:id', { id }))
        );

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);
      })
      .finally(() => onActionCall?.());
  };
};
