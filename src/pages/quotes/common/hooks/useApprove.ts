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
import { Quote } from 'common/interfaces/quote';
import { setCurrentQuote } from 'common/stores/slices/quotes/extra-reducers/set-current-quote';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function useApprove() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  return (quote: Quote) => {
    const toastId = toast.loading(t('processing'));

    request(
      'PUT',
      endpoint('/api/v1/quotes/:id?approve=true', { id: quote.id }),
      quote
    )
      .then((response) => {
        toast.success(t('updated_quote'), { id: toastId });

        dispatch(setCurrentQuote(response.data.data));
      })
      .catch((error) => {
        toast.error(t('error_title'), { id: toastId });

        console.error(error);
      });
  };
}
