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
import { Credit } from 'common/interfaces/credit';
import { setCurrentCredit } from 'common/stores/slices/credits/extra-reducers/set-current-credit';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export function useMarkSent() {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  return (credit: Credit) => {
    const toastId = toast.loading(t('processing'));

    request(
      'PUT',
      endpoint('/api/v1/credits/:id?mark_sent=true', { id: credit.id }),
      credit
    )
      .then((response) => {
        toast.success(t('updated_credit'), { id: toastId });

        dispatch(setCurrentCredit(response.data.data));
      })
      .catch((error) => {
        toast.error(t('error_title'), { id: toastId });

        console.error(error);
      });
  };
}
