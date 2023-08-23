/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint, trans } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';

const successMessages = {
  convert_to_invoice: 'converted_quote',
  convert_to_project: 'converted_quote',
  email: 'emailed_quotes',
  sent: 'marked_quote_as_sent',
};

export const useBulkAction = () => {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (
    ids: string[],
    action:
      | 'archive'
      | 'restore'
      | 'delete'
      | 'convert_to_invoice'
      | 'convert_to_project'
      | 'email'
      | 'approve'
      | 'sent'
  ) => {
    toast.processing();

    request('POST', endpoint('/api/v1/quotes/bulk'), {
      action,
      ids,
    }).then(() => {
      const message =
        successMessages[action as keyof typeof successMessages] ||
        `${action}d_quote`;

      if (action === 'approve') {
        toast.success(trans('approved_quotes', { value: ids.length }));
      } else {
        toast.success(message);
      }

      queryClient.invalidateQueries('/api/v1/quotes');

      ids.forEach((id) =>
        queryClient.invalidateQueries(route('/api/v1/quotes/:id', { id }))
      );

      invalidateQueryValue &&
        queryClient.invalidateQueries([invalidateQueryValue]);
    });
  };
};
