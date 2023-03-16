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
import { Quote } from '$app/common/interfaces/quote';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from 'react-query';
import { route } from '$app/common/helpers/route';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';

export function useMarkSent() {
  const [t] = useTranslation();
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return (quote: Quote) => {
    const toastId = toast.loading(t('processing'));

    request(
      'PUT',
      endpoint('/api/v1/quotes/:id?mark_sent=true', { id: quote.id }),
      quote
    )
      .then(() => {
        toast.success(t('quote_sent'), { id: toastId });

        queryClient.invalidateQueries('/api/v1/quotes');

        queryClient.invalidateQueries(
          route('/api/v1/quotes/:id', { id: quote.id })
        );

        invalidateQueryValue &&
          queryClient.invalidateQueries([invalidateQueryValue]);
      })
      .catch((error) => {
        toast.error(t('error_title'), { id: toastId });

        console.error(error);
      });
  };
}
